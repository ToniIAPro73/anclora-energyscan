import { isAbsolute, relative, resolve } from 'path';
import { prisma } from './prisma';
import type { Prisma, PrismaClient } from '@prisma/client';
import { deleteStoredAttachment } from './blob-storage';
import { getAssessmentRetentionCutoff } from './assessment-retention';
import { isLegacyEnergyScanDraftBlobPath, type OrphanedBlobPurgeResult } from './orphaned-assessment-blob-purge';

type AssessmentDataDeps = {
  prisma: PrismaClient;
  deleteStoredAttachment: (path: string) => Promise<unknown>;
  purgeOrphanedBlobs?: () => Promise<OrphanedBlobPurgeResult>;
};

const defaultAssessmentDataDeps: AssessmentDataDeps = {
  prisma,
  deleteStoredAttachment,
  purgeOrphanedBlobs: async () => {
    const { runOrphanedAssessmentBlobPurge } = await import('./orphaned-assessment-blob-purge-runtime');
    return runOrphanedAssessmentBlobPurge({ apply: true });
  },
};

const UNEXPECTED_PATH_MESSAGE = 'Unexpected attachment storage path.';

/** Content-free token describing where a rejected attachment path lives; never includes ids or file names. */
function classifyAttachmentPathShape(pathValue: string): string {
  if (pathValue.startsWith('blob:assessments/')) return 'blob_assessments';
  if (pathValue.startsWith('blob:assessment-drafts/')) return 'blob_drafts';
  if (pathValue.startsWith('blob:')) return 'blob_other';
  return 'local_path';
}

function unexpectedPathError(pathValue: string) {
  return Object.assign(new Error(UNEXPECTED_PATH_MESSAGE), { shape: classifyAttachmentPathShape(pathValue) });
}

/** Maps a purge failure to a short content-free reason code for the cron response. */
export function classifyPurgeFailure(error: unknown): string {
  const candidate = error as { message?: unknown; shape?: unknown; code?: unknown; name?: unknown } | null;
  if (candidate?.message === UNEXPECTED_PATH_MESSAGE && typeof candidate.shape === 'string') return `unexpected_path:${candidate.shape}`;
  if (typeof candidate?.code === 'string' && /^P\d{4}$/.test(candidate.code)) return `prisma:${candidate.code}`;
  if (typeof candidate?.name === 'string') return `error:${candidate.name.replace(/[^A-Za-z0-9_]/g, '').slice(0, 40) || 'Unknown'}`;
  return 'error:Unknown';
}

export function validateAssessmentAttachmentPath(pathValue: string, assessmentId: string, userId?: string | null) {
  if (pathValue.startsWith('demo://')) return;
  if (pathValue.startsWith('blob:')) {
    const path = pathValue.slice(5);
    const allowed = path.startsWith(`assessments/${assessmentId}/`) ||
      Boolean(userId && path.startsWith(`assessment-drafts/${userId}/`)) ||
      isLegacyEnergyScanDraftBlobPath(path);
    if (!path || path.startsWith('/') || path.split('/').includes('..') || !allowed) {
      throw unexpectedPathError(pathValue);
    }
    return;
  }
  const root = resolve(process.cwd(), 'uploads', 'assessments', assessmentId);
  const resolved = resolve(pathValue);
  const rel = relative(root, resolved);
  if (!isAbsolute(pathValue) || rel.startsWith('..') || isAbsolute(rel)) {
    throw unexpectedPathError(pathValue);
  }
}

/**
 * True for a local-disk path recorded by another environment (the database is shared between local
 * development and Vercel) that this runtime cannot own: `.../uploads/assessments/{assessmentId}/{file}`.
 * Its file is never touched here; only the database rows are removed.
 */
export function isForeignLocalAttachmentPath(pathValue: string, assessmentId: string, userId?: string | null): boolean {
  if (pathValue.startsWith('demo://') || pathValue.startsWith('blob:')) return false;
  const segments = pathValue.replace(/\\/g, '/').split('/');
  const index = segments.lastIndexOf('uploads');
  const structural = index >= 0 &&
    segments.length === index + 4 &&
    segments[index + 1] === 'assessments' &&
    segments[index + 2] === assessmentId &&
    segments[index + 3].length > 0 &&
    !segments.includes('..');
  if (!structural) return false;
  try {
    validateAssessmentAttachmentPath(pathValue, assessmentId, userId);
    return false;
  } catch {
    return true;
  }
}

/** Explicitly deletes non-cascading children; shared by owner deletion, expiry purge, and QA teardown. */
export async function deleteAssessmentRowsInTransaction(tx: Prisma.TransactionClient, assessmentIds: string[], attachmentIds: string[]) {
  if (!assessmentIds.length) return;
  const assessmentWhere = { assessmentId: { in: assessmentIds } };
  const runs = await tx.estimateRun.findMany({ where: assessmentWhere, select: { id: true } });
  const runIds = runs.map((run: { id: string }) => run.id);

  if (attachmentIds.length) await tx.attachmentAnalysis.deleteMany({ where: { attachmentId: { in: attachmentIds } } });
  await tx.energyCertificate.deleteMany({ where: assessmentWhere });
  await tx.rehabBudget.deleteMany({ where: assessmentWhere });
  await tx.cadastralRecord.deleteMany({ where: assessmentWhere });
  await tx.dataFieldSource.deleteMany({ where: assessmentWhere });
  await tx.checkoutRecovery.deleteMany({ where: assessmentWhere });
  if (runIds.length) await tx.estimateLine.deleteMany({ where: { estimateRunId: { in: runIds } } });
  await tx.estimateRun.deleteMany({ where: assessmentWhere });
  await tx.lead.deleteMany({ where: assessmentWhere });
  await tx.analyticsEventLog.deleteMany({ where: assessmentWhere });
  await tx.emailLog.deleteMany({ where: assessmentWhere });
  await tx.assessmentAttachment.deleteMany({ where: { id: { in: attachmentIds } } });
  await tx.assessment.deleteMany({ where: { id: { in: assessmentIds } } });
}

export async function deleteAssessmentData(
  assessmentId: string,
  userId: string | null,
  deps: AssessmentDataDeps = { prisma, deleteStoredAttachment },
): Promise<boolean> {
  const assessment = await deps.prisma.assessment.findFirst({
    where: { id: assessmentId, userId },
    select: { id: true, userId: true },
  });
  if (!assessment) return false;

  await deps.prisma.$transaction(async (tx) => {
    const attachments = await tx.assessmentAttachment.findMany({
      where: { assessmentId },
      select: { id: true, path: true },
    });
    for (const attachment of attachments) {
      if (isForeignLocalAttachmentPath(attachment.path, assessmentId, assessment.userId)) continue;
      validateAssessmentAttachmentPath(attachment.path, assessmentId, assessment.userId);
      if (!attachment.path.startsWith('demo://')) await deps.deleteStoredAttachment(attachment.path);
    }
    await deleteAssessmentRowsInTransaction(tx, [assessmentId], attachments.map((attachment: { id: string }) => attachment.id));
  }, { isolationLevel: 'Serializable' });

  return true;
}

export async function purgeExpiredAssessmentData(now: Date | number = Date.now(), deps: AssessmentDataDeps = defaultAssessmentDataDeps) {
  const cutoff = getAssessmentRetentionCutoff(now);
  const expired = await deps.prisma.assessment.findMany({
    where: { createdAt: { lte: cutoff } },
    select: { id: true, userId: true },
    orderBy: { createdAt: 'asc' },
  });

  let deleted = 0;
  let failed = 0;
  const failureReasons: Record<string, number> = {};
  for (const assessment of expired) {
    try {
      if (await deleteAssessmentData(assessment.id, assessment.userId, deps)) deleted += 1;
    } catch (error) {
      failed += 1;
      const reason = classifyPurgeFailure(error);
      failureReasons[reason] = (failureReasons[reason] ?? 0) + 1;
    }
  }
  const orphanedBlobs = deps.purgeOrphanedBlobs
    ? await deps.purgeOrphanedBlobs()
    : {
      scanned: 0,
      matrix: {
        '0-30': { a: { count: 0, sizeBytes: 0 }, 'a-legacy': { count: 0, sizeBytes: 0 }, b: { count: 0, sizeBytes: 0 }, c: { count: 0, sizeBytes: 0 }, d: { count: 0, sizeBytes: 0 } },
        '31-90': { a: { count: 0, sizeBytes: 0 }, 'a-legacy': { count: 0, sizeBytes: 0 }, b: { count: 0, sizeBytes: 0 }, c: { count: 0, sizeBytes: 0 }, d: { count: 0, sizeBytes: 0 } },
        'over-90': { a: { count: 0, sizeBytes: 0 }, 'a-legacy': { count: 0, sizeBytes: 0 }, b: { count: 0, sizeBytes: 0 }, c: { count: 0, sizeBytes: 0 }, d: { count: 0, sizeBytes: 0 } },
      },
      shapes: [],
      legacyShape: [
        { ageBand: '0-30', referenced: { count: 0, sizeBytes: 0 }, orphaned: { count: 0, sizeBytes: 0 } },
        { ageBand: '31-90', referenced: { count: 0, sizeBytes: 0 }, orphaned: { count: 0, sizeBytes: 0 } },
        { ageBand: 'over-90', referenced: { count: 0, sizeBytes: 0 }, orphaned: { count: 0, sizeBytes: 0 } },
      ],
      candidateCount: 0,
      batchLimit: 0,
      attempted: 0,
      deleted: 0,
      failed: 0,
      skippedReferenced: 0,
      deferred: 0,
    } satisfies OrphanedBlobPurgeResult;
  return { considered: expired.length, deleted, failed, failureReasons, orphanedBlobs };
}
