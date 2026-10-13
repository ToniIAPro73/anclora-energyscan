import { del, list } from '@vercel/blob';
import { prisma } from './prisma';
import { BlobPurgeStageError, isBlobPurgeStageError, type BlobPurgeDiagnostic, type BlobPurgeStage } from './blob-purge-diagnostics';
import {
  DEFAULT_BLOB_PURGE_BATCH_LIMIT,
  MAX_BLOB_PURGE_BATCH_LIMIT,
  purgeOrphanedAssessmentBlobs,
  type OrphanedBlobPurgeOptions,
  type BlobListPage,
} from './orphaned-assessment-blob-purge';

export type OrphanedBlobPurgeRuntimeDeps = {
  connect: () => Promise<void>;
  query: () => Promise<unknown>;
  verifyAttachmentReadSchema: () => Promise<unknown>;
  list: (options: { prefix: string; cursor?: string; limit: number; mode: 'expanded' }) => Promise<BlobListPage>;
  findReferencedPaths: (pathnames: string[]) => Promise<string[]>;
  delete: (pathname: string) => Promise<unknown>;
};

type OrphanedBlobPurgeRuntimeOptions = OrphanedBlobPurgeOptions & { checkOnly?: boolean };

const defaultRuntimeDeps: OrphanedBlobPurgeRuntimeDeps = {
  connect: () => prisma.$connect(),
  query: () => prisma.$queryRaw`SELECT 1`,
  verifyAttachmentReadSchema: () => prisma.$queryRaw`SELECT "path" FROM "AssessmentAttachment" LIMIT 0`,
  list: ({ prefix, cursor, limit, mode }) => list({ prefix, cursor, limit, mode }),
  findReferencedPaths: async (pathnames) => {
    const records = await prisma.assessmentAttachment.findMany({
      where: { path: { in: pathnames } },
      select: { path: true },
    });
    return records.map((record) => record.path);
  },
  delete: (pathname) => del(pathname),
};

export async function checkOrphanedBlobPurgeDatabase(
  deps: OrphanedBlobPurgeRuntimeDeps = defaultRuntimeDeps,
): Promise<void> {
  await runOrphanedAssessmentBlobPurge({ checkOnly: true }, deps);
}

async function runDatabasePreflight(
  deps: OrphanedBlobPurgeRuntimeDeps,
  onStage: (stage: BlobPurgeStage) => void,
): Promise<void> {
  let stage: BlobPurgeStage = 'DB_CONNECT';
  try {
    onStage(stage);
    await deps.connect();
    stage = 'DB_QUERY';
    onStage(stage);
    await deps.query();
    await deps.verifyAttachmentReadSchema();
  } catch (error) {
    throw new BlobPurgeStageError(stage, error);
  }
}

export function getConfiguredBlobPurgeBatchLimit(): number {
  const raw = process.env.BLOB_ORPHAN_PURGE_BATCH_LIMIT;
  if (raw === undefined || raw.trim() === '') return DEFAULT_BLOB_PURGE_BATCH_LIMIT;
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_BLOB_PURGE_BATCH_LIMIT) {
    throw new Error('Blob purge batch limit configuration is invalid.');
  }
  return parsed;
}

export function runOrphanedAssessmentBlobPurge(
  options: OrphanedBlobPurgeRuntimeOptions & { checkOnly: true },
  deps?: OrphanedBlobPurgeRuntimeDeps,
  onDeleteFailure?: (diagnostic: BlobPurgeDiagnostic) => void,
): Promise<void>;
export function runOrphanedAssessmentBlobPurge(
  options?: OrphanedBlobPurgeOptions,
  deps?: OrphanedBlobPurgeRuntimeDeps,
  onDeleteFailure?: (diagnostic: BlobPurgeDiagnostic) => void,
): Promise<Awaited<ReturnType<typeof purgeOrphanedAssessmentBlobs>>>;
export function runOrphanedAssessmentBlobPurge(
  options: OrphanedBlobPurgeRuntimeOptions = {},
  deps: OrphanedBlobPurgeRuntimeDeps = defaultRuntimeDeps,
  onDeleteFailure?: (diagnostic: BlobPurgeDiagnostic) => void,
): Promise<Awaited<ReturnType<typeof purgeOrphanedAssessmentBlobs>> | void> {
  return runWithDiagnostics(options, deps, onDeleteFailure);
}

async function runWithDiagnostics(
  options: OrphanedBlobPurgeRuntimeOptions,
  deps: OrphanedBlobPurgeRuntimeDeps,
  onDeleteFailure?: (diagnostic: BlobPurgeDiagnostic) => void,
) {
  let stage: BlobPurgeStage = 'CONFIGURATION';
  try {
    const { checkOnly = false, ...purgeOptions } = options;
    const normalizedOptions = checkOnly
      ? purgeOptions
      : { ...purgeOptions, batchLimit: purgeOptions.batchLimit ?? getConfiguredBlobPurgeBatchLimit() };
    await runDatabasePreflight(deps, (nextStage) => { stage = nextStage; });
    stage = 'PURGE';
    if (checkOnly) return;
    return await purgeOrphanedAssessmentBlobs(
      normalizedOptions,
      {
        list: async function listAssessmentBlobs({ prefix, cursor, limit }) {
          stage = 'BLOB_LIST';
          try {
            const page = await deps.list({ prefix, cursor, limit, mode: 'expanded' });
            return {
              blobs: page.blobs.map(({ pathname, uploadedAt, size }) => ({ pathname, uploadedAt, size })),
              cursor: page.cursor,
              hasMore: page.hasMore,
            };
          } catch (error) {
            throw new BlobPurgeStageError('BLOB_LIST', error);
          }
        },
        findReferencedPaths: async function classifyAssessmentAttachments(pathnames) {
          stage = 'CLASSIFY';
          try {
            return await deps.findReferencedPaths(pathnames);
          } catch (error) {
            throw new BlobPurgeStageError('CLASSIFY', error);
          }
        },
        delete: async function deleteAssessmentBlob(pathname) {
          stage = 'DELETE';
          try {
            return await deps.delete(pathname);
          } catch (error) {
            throw new BlobPurgeStageError('DELETE', error);
          }
        },
        onDeleteFailure,
      },
    );
  } catch (error) {
    if (isBlobPurgeStageError(error)) throw error;
    throw new BlobPurgeStageError(stage, error);
  }
}
