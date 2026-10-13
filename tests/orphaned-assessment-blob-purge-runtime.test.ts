import {
  BlobPurgeStageError,
  formatBlobPurgeDiagnostic,
  toBlobPurgeDiagnostic,
} from '@/lib/blob-purge-diagnostics';
import {
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
