jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/lib/blob-storage', () => ({ deleteStoredAttachment: jest.fn() }));

import { deleteAssessmentData, purgeExpiredAssessmentData, validateAssessmentAttachmentPath } from '@/lib/assessment-data-deletion';
import type { PrismaClient } from '@prisma/client';

function createTx() {
  const tx: Record<string, any> = {};
  for (const model of [
    'assessment', 'assessmentAttachment', 'attachmentAnalysis', 'energyCertificate', 'rehabBudget',
    'cadastralRecord', 'dataFieldSource', 'checkoutRecovery', 'estimateRun', 'estimateLine',
    'lead', 'analyticsEventLog', 'emailLog',
  ]) tx[model] = { findMany: jest.fn().mockResolvedValue([]), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) };
  tx.estimateRun.findMany.mockResolvedValue([{ id: 'estimate_fixture' }]);
  return tx;
}

function createDeps() {
  const tx = createTx();
  const prisma: Record<string, any> = {
    assessment: {
      findFirst: jest.fn().mockResolvedValue({ id: 'assessment_fixture', userId: 'owner_fixture' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)),
  };
  tx.assessmentAttachment.findMany.mockResolvedValue([
    { id: 'attachment_fixture', path: 'blob:assessments/assessment_fixture/photo.png' },
  ]);
  const purgeOrphanedBlobs = jest.fn().mockResolvedValue({
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
    batchLimit: 100,
    attempted: 0,
    deleted: 0,
    failed: 0,
    skippedReferenced: 0,
    deferred: 0,
  });
  return { deps: { prisma: prisma as unknown as PrismaClient, deleteStoredAttachment: jest.fn().mockResolvedValue(undefined), purgeOrphanedBlobs }, prisma, tx };
}

describe('assessment data deletion and retention purge', () => {
  it('refuses a different owner before touching storage or rows', async () => {
    const { deps, prisma } = createDeps();
    prisma.assessment.findFirst.mockResolvedValue(null);
    const deleted = await deleteAssessmentData('assessment_fixture', 'other_user', deps);
    expect(deleted).toBe(false);
    expect(deps.deleteStoredAttachment).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deletes Blob and all derived/related rows through the shared teardown primitive', async () => {
    const { deps, tx } = createDeps();
    const deleted = await deleteAssessmentData('assessment_fixture', 'owner_fixture', deps);
    expect(deleted).toBe(true);
    expect(deps.deleteStoredAttachment).toHaveBeenCalledWith('blob:assessments/assessment_fixture/photo.png');
    expect(tx.attachmentAnalysis.deleteMany).toHaveBeenCalled();
    expect(tx.energyCertificate.deleteMany).toHaveBeenCalled();
    expect(tx.rehabBudget.deleteMany).toHaveBeenCalled();
    expect(tx.estimateLine.deleteMany).toHaveBeenCalledWith({ where: { estimateRunId: { in: ['estimate_fixture'] } } });
    expect(tx.assessment.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['assessment_fixture'] } } });
  });

  it('rejects an attachment path outside the assessment and owner namespaces', () => {
    expect(() => validateAssessmentAttachmentPath('blob:assessments/other/photo.png', 'assessment_fixture', 'owner_fixture')).toThrow();
    expect(() => validateAssessmentAttachmentPath('blob:assessment-drafts/other/file.png', 'assessment_fixture', 'owner_fixture')).toThrow();
    expect(() => validateAssessmentAttachmentPath('blob:assessment-drafts/owner_fixture/../other/file.png', 'assessment_fixture', 'owner_fixture')).toThrow();
  });

  it('accepts a strict legacy draft path and rejects malformed legacy-like paths', () => {
    const legacyId = '3f2b8c1e-5a4d-4e6f-9b7a-1c2d3e4f5a6b';
    expect(() => validateAssessmentAttachmentPath(`blob:assessment-drafts/${legacyId}/file.png`, 'assessment_fixture', 'owner_fixture')).not.toThrow();
    expect(() => validateAssessmentAttachmentPath(`blob:assessment-drafts/${legacyId}/../x.png`, 'assessment_fixture', 'owner_fixture')).toThrow();
    expect(() => validateAssessmentAttachmentPath(`blob:assessment-drafts/${legacyId}/a/b.png`, 'assessment_fixture', 'owner_fixture')).toThrow();
    expect(() => validateAssessmentAttachmentPath('blob:assessment-drafts/not-a-uuid/file.png', 'assessment_fixture', 'owner_fixture')).toThrow();
  });

  it('purges only records whose parent creation date is at or before the 30-day cutoff', async () => {
    const { deps, prisma } = createDeps();
    prisma.assessment.findMany.mockResolvedValue([{ id: 'assessment_fixture', userId: 'owner_fixture' }]);
    const result = await purgeExpiredAssessmentData(new Date('2026-02-01T00:00:00.000Z'), deps);
    expect(prisma.assessment.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { createdAt: { lte: new Date('2026-01-02T00:00:00.000Z') } },
    }));
    expect(result).toMatchObject({ considered: 1, deleted: 1, failed: 0, orphanedBlobs: { failed: 0 } });
    expect(deps.purgeOrphanedBlobs).toHaveBeenCalledTimes(1);
  });
});
