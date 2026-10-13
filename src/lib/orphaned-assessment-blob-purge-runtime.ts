import { del, list } from '@vercel/blob';
import { prisma } from './prisma';
import { BlobPurgeStageError, type BlobPurgeDiagnostic, type BlobPurgeStage } from './blob-purge-diagnostics';
import {
  DEFAULT_BLOB_PURGE_BATCH_LIMIT,
  MAX_BLOB_PURGE_BATCH_LIMIT,
  purgeOrphanedAssessmentBlobs,
  type OrphanedBlobPurgeOptions,
  type BlobListPage,
} from './orphaned-assessment-blob-purge';

export type OrphanedBlobPurgeRuntimeDeps = {
  connect: () => Promise<void>;
  list: (options: { prefix: string; cursor?: string; limit: number; mode: 'expanded' }) => Promise<BlobListPage>;
  findReferencedPaths: (pathnames: string[]) => Promise<string[]>;
  delete: (pathname: string) => Promise<unknown>;
};

const defaultRuntimeDeps: OrphanedBlobPurgeRuntimeDeps = {
  connect: () => prisma.$connect(),
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
  options: OrphanedBlobPurgeOptions = {},
  deps: OrphanedBlobPurgeRuntimeDeps = defaultRuntimeDeps,
  onDeleteFailure?: (diagnostic: BlobPurgeDiagnostic) => void,
) {
  return runWithDiagnostics(options, deps, onDeleteFailure);
}

async function runWithDiagnostics(
  options: OrphanedBlobPurgeOptions,
  deps: OrphanedBlobPurgeRuntimeDeps,
  onDeleteFailure?: (diagnostic: BlobPurgeDiagnostic) => void,
) {
  let stage: BlobPurgeStage = 'CONFIGURATION';
  try {
    const normalizedOptions = {
      ...options,
      batchLimit: options.batchLimit ?? getConfiguredBlobPurgeBatchLimit(),
    };
    stage = 'DB_CONNECT';
    await deps.connect();
    return await purgeOrphanedAssessmentBlobs(
      normalizedOptions,
      {
        list: async ({ prefix, cursor, limit }) => {
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
        findReferencedPaths: async (pathnames) => {
          stage = 'DB_CLASSIFY';
          try {
            return await deps.findReferencedPaths(pathnames);
          } catch (error) {
            throw new BlobPurgeStageError('DB_CLASSIFY', error);
          }
        },
        delete: async (pathname) => {
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
    if (error instanceof BlobPurgeStageError) throw error;
    throw new BlobPurgeStageError(stage, error);
  }
}
