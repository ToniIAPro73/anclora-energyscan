import { del, list } from '@vercel/blob';
import { prisma } from './prisma';
import {
  DEFAULT_BLOB_PURGE_BATCH_LIMIT,
  MAX_BLOB_PURGE_BATCH_LIMIT,
  purgeOrphanedAssessmentBlobs,
  type OrphanedBlobPurgeOptions,
} from './orphaned-assessment-blob-purge';

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
) {
  return purgeOrphanedAssessmentBlobs(
    { ...options, batchLimit: options.batchLimit ?? getConfiguredBlobPurgeBatchLimit() },
    {
      list: async ({ prefix, cursor, limit }) => {
        const page = await list({ prefix, cursor, limit, mode: 'expanded' });
        return {
          blobs: page.blobs.map(({ pathname, uploadedAt, size }) => ({ pathname, uploadedAt, size })),
          cursor: page.cursor,
          hasMore: page.hasMore,
        };
      },
      findReferencedPaths: async (pathnames) => {
        const records = await prisma.assessmentAttachment.findMany({
          where: { path: { in: pathnames } },
          select: { path: true },
        });
        return records.map((record) => record.path);
      },
      delete: (pathname) => del(pathname),
    },
  );
}
