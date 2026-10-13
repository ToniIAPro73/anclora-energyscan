import { runQaTeardown } from '@/../scripts/qa/teardown-qa-data';

const QA_USER_ID = 'qa_user_fixture';
const ASSESSMENT_ID = 'assessment_qa_fixture';
const ATTACHMENT_PATH = 'blob:assessment-drafts/qa_user_fixture/batch/synthetic.png';

function createHarness(options: { owned?: boolean; attachmentPath?: string } = {}) {
  const state = {
    assessmentCount: options.owned === false ? 0 : 1,
    attachmentCount: options.owned === false ? 0 : 1,
    analysisCount: options.owned === false ? 0 : 1,
    attachmentPath: options.attachmentPath ?? ATTACHMENT_PATH,
  };

  const tx = {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: QA_USER_ID }),
      deleteMany: jest.fn().mockImplementation(async () => ({ count: 1 })),
    },
    assessment: {
      findMany: jest.fn().mockImplementation(async () => state.assessmentCount ? [{ id: ASSESSMENT_ID }] : []),
      count: jest.fn().mockImplementation(async () => state.assessmentCount),
      deleteMany: jest.fn().mockImplementation(async () => {
        state.assessmentCount = 0;
        return { count: 1 };
      }),
    },
    assessmentAttachment: {
      findMany: jest.fn().mockImplementation(async () => state.attachmentCount
        ? [{ id: 'attachment_qa_fixture', path: state.attachmentPath }]
        : []),
      count: jest.fn().mockImplementation(async () => state.attachmentCount),
      deleteMany: jest.fn().mockImplementation(async () => {
        state.attachmentCount = 0;
        state.analysisCount = 0;
        return { count: 1 };
      }),
    },
    attachmentAnalysis: { count: jest.fn().mockImplementation(async () => state.analysisCount), deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
    energyCertificate: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    rehabBudget: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    cadastralRecord: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    dataFieldSource: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    checkoutRecovery: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    estimateRun: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    estimateLine: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    lead: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    analyticsEventLog: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    emailLog: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    budgetReview: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    account: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    session: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    passwordResetToken: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    providerAccount: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    professionalBranding: { count: jest.fn().mockResolvedValue(0), deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  };
  const prisma = {
    ...tx,
    $transaction: jest.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)),
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
  const deleteStoredAttachment = jest.fn().mockResolvedValue(undefined);

  return { prisma, tx, deleteStoredAttachment, state };
}

describe('QA data teardown', () => {
  it('dry-run reports scoped counts without deleting Blob or database rows', async () => {
    const harness = createHarness();

    const output = await runQaTeardown(['--assessment-id', ASSESSMENT_ID], harness);

    expect(output).toContain('DRY RUN');
    expect(output).toContain('assessments: 1');
    expect(output).toContain('attachments: 1');
    expect(harness.deleteStoredAttachment).not.toHaveBeenCalled();
    expect(harness.tx.assessmentAttachment.deleteMany).not.toHaveBeenCalled();
    expect(harness.tx.assessment.deleteMany).not.toHaveBeenCalled();
    expect(harness.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects an assessment that is not owned by the contract QA identity', async () => {
    const harness = createHarness({ owned: false });

    await expect(runQaTeardown(['--assessment-id', 'foreign_assessment'], harness)).rejects.toThrow(/not owned by QA identity/i);

    expect(harness.deleteStoredAttachment).not.toHaveBeenCalled();
    expect(harness.tx.assessmentAttachment.deleteMany).not.toHaveBeenCalled();
    expect(harness.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('with --apply deletes Blob first, then attachment and assessment rows in a transaction', async () => {
    const harness = createHarness();

    const output = await runQaTeardown(['--assessment-id', ASSESSMENT_ID, '--apply'], harness);

    expect(harness.prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(harness.deleteStoredAttachment).toHaveBeenCalledWith(ATTACHMENT_PATH);
    expect(harness.tx.assessmentAttachment.deleteMany).toHaveBeenCalled();
    expect(harness.tx.assessment.deleteMany).toHaveBeenCalled();
    expect(output).toContain('VERIFIED ZERO');
    expect(output).toContain('assessments: 0');
    expect(output).toContain('attachments: 0');
  });

  it('does not delete database rows when Blob deletion fails', async () => {
    const harness = createHarness();
    harness.deleteStoredAttachment.mockRejectedValue(new Error('synthetic Blob failure'));

    await expect(runQaTeardown(['--assessment-id', ASSESSMENT_ID, '--apply'], harness)).rejects.toThrow(/Blob deletion failed/i);

    expect(harness.tx.assessmentAttachment.deleteMany).not.toHaveBeenCalled();
    expect(harness.tx.assessment.deleteMany).not.toHaveBeenCalled();
  });

  it('requires the QA identity ID confirmation before deleting the identity', async () => {
    const harness = createHarness();

    await expect(runQaTeardown(['--delete-identity', '--apply', '--confirm', 'wrong_identity'], harness)).rejects.toThrow(/confirmation/i);

    expect(harness.deleteStoredAttachment).not.toHaveBeenCalled();
    expect(harness.tx.user.deleteMany).not.toHaveBeenCalled();
    expect(harness.prisma.$transaction).not.toHaveBeenCalled();
  });

  it('never returns credentials, full QA email, or Blob token in its output', async () => {
    const harness = createHarness();

    const output = await runQaTeardown(['--assessment-id', ASSESSMENT_ID], harness);

    expect(output).not.toContain('qa.energyscan@anclora.local');
    expect(output).not.toContain('QA_PASSWORD');
    expect(output).not.toContain('BLOB_READ_WRITE_TOKEN');
    expect(output).not.toContain(ATTACHMENT_PATH);
  });
});
