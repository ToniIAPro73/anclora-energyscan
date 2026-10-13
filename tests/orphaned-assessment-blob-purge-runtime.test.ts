import {
  BlobPurgeStageError,
  formatBlobPurgeDiagnostic,
  toBlobPurgeDiagnostic,
} from '@/lib/blob-purge-diagnostics';
import {
  checkOrphanedBlobPurgeDatabase,
  runOrphanedAssessmentBlobPurge,
  type OrphanedBlobPurgeRuntimeDeps,
} from '@/lib/orphaned-assessment-blob-purge-runtime';

const NOW = new Date('2026-10-14T00:00:00.000Z');
const SENTINEL_SECRET = 'synthetic-token-MUST-NOT-LEAK';
const SENTINEL_PATH = 'assessment-drafts/synthetic-owner/synthetic-private-file.png';
const ASSESSMENT_DRAFT = 'assessment-drafts/synthetic-owner/123e4567-e89b-42d3-a456-426614174000/synthetic-private-file.png';

function createDeps(): jest.Mocked<OrphanedBlobPurgeRuntimeDeps> {
  return {
    connect: jest.fn(async () => undefined),
    query: jest.fn(async () => [{ '?column?': 1 }]),
    verifyAttachmentReadSchema: jest.fn(async () => []),
    list: jest.fn(async ({ prefix }: Parameters<OrphanedBlobPurgeRuntimeDeps['list']>[0]) => ({
      blobs: [{ pathname: ASSESSMENT_DRAFT, uploadedAt: new Date(NOW.getTime() - 31 * 24 * 60 * 60 * 1000), size: 12 }]
        .filter(({ pathname }) => pathname.startsWith(prefix)),
      hasMore: false,
    })),
    findReferencedPaths: jest.fn(async (_pathnames: string[]) => [] as string[]),
    delete: jest.fn(async (_pathname: string) => undefined),
  };
}

function rejectionOutput(error: unknown): string {
  if (!(error instanceof BlobPurgeStageError)) throw error;
  return formatBlobPurgeDiagnostic(error.diagnostic);
}

describe('orphaned assessment Blob purge diagnostics', () => {
  it('reports DB_CONNECT class and safe auth code without the error message', async () => {
    const deps = createDeps();
    const error = Object.assign(new Error(`${SENTINEL_SECRET} password authentication failed for ${SENTINEL_PATH}`), {
      name: 'PrismaClientInitializationError',
      code: 'P1000',
    });
    deps.connect.mockRejectedValue(error);

    const output = await runOrphanedAssessmentBlobPurge({ batchLimit: 1 }, deps).catch(rejectionOutput);

    expect(output).toContain('stage=DB_CONNECT');
    expect(output).toContain('error_class=PrismaClientInitializationError');
    expect(output).toContain('code=ERR_DB_AUTH');
    expect(output).not.toContain(SENTINEL_SECRET);
    expect(output).not.toContain(SENTINEL_PATH);
  });

  it('preserves an allowlisted original cause class and Prisma code through a wrapper', async () => {
    const rootCause = Object.assign(new Error(`${SENTINEL_SECRET} ${SENTINEL_PATH}`), {
      name: 'PrismaClientInitializationError',
      code: 'P1001',
    });
    const wrapped = new Error('generic adapter failure', { cause: rootCause });
    const output = formatBlobPurgeDiagnostic(toBlobPurgeDiagnostic('DB_CONNECT', wrapped));

    expect(output).toContain('error_class=Error');
    expect(output).toContain('cause_class=PrismaClientInitializationError');
    expect(output).toContain('cause_code=P1001');
    expect(output).not.toContain(SENTINEL_SECRET);
    expect(output).not.toContain(SENTINEL_PATH);
  });

  it('reads the safe Prisma errorCode field when code is absent', () => {
    const cause = Object.assign(new Error(`${SENTINEL_SECRET} ${SENTINEL_PATH}`), {
      name: 'PrismaClientInitializationError',
      errorCode: 'P1001',
    });
    const output = formatBlobPurgeDiagnostic(toBlobPurgeDiagnostic('DB_CONNECT', new Error('adapter failed', { cause })));

    expect(output).toContain('cause_class=PrismaClientInitializationError');
    expect(output).toContain('cause_code=P1001');
    expect(output).toContain('code=ERR_DB_CONNREFUSED');
    expect(output).not.toContain(SENTINEL_SECRET);
    expect(output).not.toContain(SENTINEL_PATH);
  });

  it('checks DB connection and executes a trivial query without invoking Blob operations', async () => {
    const deps = createDeps();

    await expect(checkOrphanedBlobPurgeDatabase(deps)).resolves.toBeUndefined();

    expect(deps.connect).toHaveBeenCalledTimes(1);
    expect(deps.query).toHaveBeenCalledTimes(1);
    expect(deps.verifyAttachmentReadSchema).toHaveBeenCalledTimes(1);
    expect(deps.list).not.toHaveBeenCalled();
    expect(deps.delete).not.toHaveBeenCalled();
  });

  it('uses the same DB preflight before a full purge and --check-db', async () => {
    const checkDeps = createDeps();
    const checkCalls: string[] = [];
    checkDeps.connect.mockImplementation(async () => { checkCalls.push('connect'); });
    checkDeps.query.mockImplementation(async () => { checkCalls.push('query'); return []; });
    checkDeps.verifyAttachmentReadSchema.mockImplementation(async () => { checkCalls.push('schema'); return []; });
    await checkOrphanedBlobPurgeDatabase(checkDeps);

    const fullDeps = createDeps();
    const fullCalls: string[] = [];
    fullDeps.connect.mockImplementation(async () => { fullCalls.push('connect'); });
    fullDeps.query.mockImplementation(async () => { fullCalls.push('query'); return []; });
    fullDeps.verifyAttachmentReadSchema.mockImplementation(async () => { fullCalls.push('schema'); return []; });
    fullDeps.list.mockImplementation(async () => {
      fullCalls.push('blob-list');
      throw Object.assign(new Error('synthetic rejected token'), { name: 'BlobError', status: 401 });
    });
    const fullFailure = await runOrphanedAssessmentBlobPurge({}, fullDeps).catch(rejectionOutput);

    expect(checkCalls).toEqual(['connect', 'query', 'schema']);
    expect(fullCalls.slice(0, 3)).toEqual(checkCalls);
    expect(fullCalls[3]).toBe('blob-list');
    expect(fullFailure).toContain('stage=BLOB_LIST');
  });

  it('maps generic schema and connection failures without exposing their messages', async () => {
    for (const [message, expected] of [
      [`relation AssessmentAttachment does not exist ${SENTINEL_PATH}`, 'ERR_DB_SCHEMA'],
      [`connect ECONNREFUSED ${SENTINEL_SECRET} ${SENTINEL_PATH}`, 'ERR_DB_CONNREFUSED'],
      [`database operation failed ${SENTINEL_SECRET}`, 'ERR_DB_PREFLIGHT'],
    ] as const) {
      const diagnostic = toBlobPurgeDiagnostic('DB_CONNECT', new Error(message));
      const output = formatBlobPurgeDiagnostic(diagnostic);

      expect(output).toContain(`code=${expected}`);
      expect(output).not.toContain(SENTINEL_SECRET);
      expect(output).not.toContain(SENTINEL_PATH);
    }
  });

  it('reports original Prisma cause when DB connection fails', async () => {
    const deps = createDeps();
    const rootCause = Object.assign(new Error(`${SENTINEL_SECRET} ${SENTINEL_PATH}`), {
      name: 'PrismaClientInitializationError',
      code: 'P1001',
    });
    deps.connect.mockRejectedValue(new Error('adapter initialization failed', { cause: rootCause }));

    const output = await checkOrphanedBlobPurgeDatabase(deps).catch(rejectionOutput);

    expect(output).toContain('stage=DB_CONNECT');
    expect(output).toContain('cause_class=PrismaClientInitializationError');
    expect(output).toContain('cause_code=P1001');
    expect(output).not.toContain(SENTINEL_SECRET);
    expect(output).not.toContain(SENTINEL_PATH);
    expect(deps.query).not.toHaveBeenCalled();
  });

  it.each([
    ['DB_QUERY', 'query', 'ERR_DB_PREFLIGHT'],
    ['DB_SCHEMA_CHECK', 'verifyAttachmentReadSchema', 'ERR_DB_SCHEMA'],
  ] as const)('identifies a failed read-only preflight step: %s', async (stage, method, expectedCode) => {
    const deps = createDeps();
    const error = new Error(stage === 'DB_SCHEMA_CHECK' ? 'column path does not exist' : 'synthetic query failure');
    deps[method].mockRejectedValue(error);

    const output = await checkOrphanedBlobPurgeDatabase(deps).catch(rejectionOutput);

    expect(output).toContain(`stage=${stage}`);
    expect(output).toContain(`code=${expectedCode}`);
  });

  it('does not mislabel post-connect purge validation failures as DB_CONNECT', async () => {
    const deps = createDeps();

    const output = await runOrphanedAssessmentBlobPurge({ batchLimit: 1001 }, deps).catch(rejectionOutput);

    expect(output).toContain('stage=PURGE');
    expect(output).not.toContain('stage=DB_CONNECT');
    expect(deps.connect).toHaveBeenCalledTimes(1);
    expect(deps.list).not.toHaveBeenCalled();
  });

  it('reports BLOB_LIST class and HTTP status without the error message', async () => {
    const deps = createDeps();
    const error = Object.assign(new Error(`${SENTINEL_SECRET} unauthorized ${SENTINEL_PATH}`), {
      name: 'BlobError',
      status: 403,
    });
    deps.list.mockRejectedValue(error);

    const output = await runOrphanedAssessmentBlobPurge({ batchLimit: 1 }, deps).catch(rejectionOutput);

    expect(output).toContain('stage=BLOB_LIST');
    expect(output).toContain('error_class=BlobError');
    expect(output).toContain('code=ERR_BLOB_AUTH');
    expect(output).toContain('http_status=403');
    expect(output).not.toContain(SENTINEL_SECRET);
    expect(output).not.toContain(SENTINEL_PATH);
  });

  it('reports DB_CLASSIFY schema errors without table, token, or path details', async () => {
    const deps = createDeps();
    const error = Object.assign(new Error(`${SENTINEL_SECRET}: column missing on ${SENTINEL_PATH}`), {
      name: 'PrismaClientKnownRequestError',
      code: 'P2022',
    });
    deps.findReferencedPaths.mockRejectedValue(error);

    const output = await runOrphanedAssessmentBlobPurge({ batchLimit: 1 }, deps).catch(rejectionOutput);

    expect(output).toContain('stage=DB_CLASSIFY');
    expect(output).toContain('error_class=PrismaClientKnownRequestError');
    expect(output).toContain('code=ERR_DB_SCHEMA');
    expect(output).not.toContain(SENTINEL_SECRET);
    expect(output).not.toContain(SENTINEL_PATH);
  });

  it('reports partial DELETE errors and continues without the error message', async () => {
    const deps = createDeps();
    const error = Object.assign(new Error(`${SENTINEL_SECRET} forbidden ${SENTINEL_PATH}`), {
      name: 'BlobError',
      status: 403,
    });
    deps.delete.mockRejectedValue(error);
    const diagnostics: string[] = [];

    const result = await runOrphanedAssessmentBlobPurge(
      { now: NOW, apply: true, batchLimit: 1 },
      deps,
      (diagnostic) => diagnostics.push(formatBlobPurgeDiagnostic(diagnostic)),
    ).catch((error: unknown) => {
      diagnostics.push(formatBlobPurgeDiagnostic(toBlobPurgeDiagnostic('PURGE', error)));
      return undefined;
    });

    if (!result) throw new Error(`Unexpected runtime failure: ${diagnostics.join('; ')}`);
    expect(result.failed).toBe(1);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toContain('stage=DELETE');
    expect(diagnostics[0]).toContain('error_class=BlobError');
    expect(diagnostics[0]).toContain('code=ERR_BLOB_AUTH');
    expect(diagnostics[0]).not.toContain(SENTINEL_SECRET);
    expect(diagnostics[0]).not.toContain(SENTINEL_PATH);
  });

  it.each([
    ['DB_CONNECT', 'connection timed out', 'ETIMEDOUT', 'ERR_DB_TIMEOUT'],
    ['BLOB_LIST', 'request timeout', undefined, 'ERR_BLOB_TIMEOUT'],
    ['DB_CLASSIFY', 'SSL certificate failure', 'ERR_SSL_CERTIFICATE', 'ERR_DB_SSL'],
    ['DB_CLASSIFY', 'database operation failed', '42P01', 'ERR_DB_SCHEMA'],
  ] as const)('maps known %s failures to a safe code', (stage, message, code, expected) => {
    const error = Object.assign(new Error(`${message}: ${SENTINEL_SECRET} ${SENTINEL_PATH}`), code ? { code } : {});
    const diagnostic = toBlobPurgeDiagnostic(stage, error);
    const output = formatBlobPurgeDiagnostic(diagnostic);

    expect(output).toContain(`stage=${stage}`);
    expect(output).toContain(`code=${expected}`);
    expect(output).not.toContain(SENTINEL_SECRET);
    expect(output).not.toContain(SENTINEL_PATH);
  });
});
