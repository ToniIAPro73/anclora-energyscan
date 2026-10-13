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
  return { deps: { prisma: prisma as unknown as PrismaClient, deleteStoredAttachment: jest.fn().mockResolvedValue(undefined) }, prisma, tx };
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

  it('purges only records whose parent creation date is at or before the 30-day cutoff', async () => {
    const { deps, prisma } = createDeps();
    prisma.assessment.findMany.mockResolvedValue([{ id: 'assessment_fixture', userId: 'owner_fixture' }]);
    const result = await purgeExpiredAssessmentData(new Date('2026-02-01T00:00:00.000Z'), deps);
    expect(prisma.assessment.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { createdAt: { lte: new Date('2026-01-02T00:00:00.000Z') } },
    }));
    expect(result).toEqual({ considered: 1, deleted: 1, failed: 0 });
  });
});
