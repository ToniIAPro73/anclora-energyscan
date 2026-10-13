jest.mock('@/auth.config', () => ({ lightAuth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    assessment: { findFirst: jest.fn() },
    assessmentAttachment: { findFirst: jest.fn(), delete: jest.fn() },
  },
}));
jest.mock('@/lib/blob-storage', () => ({
  deleteStoredAttachment: jest.fn(),
  readAttachmentBytes: jest.fn(),
  restoreStoredAttachment: jest.fn(),
}));

import { GET, DELETE } from '@/app/api/assessment/[id]/attachments/[attachmentId]/route';
import { lightAuth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { deleteStoredAttachment, readAttachmentBytes, restoreStoredAttachment } from '@/lib/blob-storage';
import { isOwnedDraftPath } from '@/lib/assessment-authorization';

const params = { params: { id: 'assessment_fixture', attachmentId: 'attachment_fixture' } };
const attachment = {
  id: 'attachment_fixture', assessmentId: 'assessment_fixture', name: 'fixture.png',
  type: 'image/png', path: 'blob:assessments/assessment_fixture/fixture.png',
};

describe('assessment attachment authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    (prisma.assessment.findFirst as jest.Mock).mockResolvedValue({ id: params.params.id, userId: 'owner_fixture' });
    (prisma.assessmentAttachment.findFirst as jest.Mock).mockResolvedValue(attachment);
    (readAttachmentBytes as jest.Mock).mockResolvedValue({ bytes: Buffer.from('fixture') });
    (deleteStoredAttachment as jest.Mock).mockResolvedValue(undefined);
    (prisma.assessmentAttachment.delete as jest.Mock).mockResolvedValue(attachment);
  });

  it('reads private attachment bytes for its owner', async () => {
    const response = await GET(new Request('http://localhost'), params);
    expect(response.status).toBe(200);
    expect(prisma.assessment.findFirst).toHaveBeenCalledWith({ where: { id: 'assessment_fixture', userId: 'owner_fixture' } });
    expect(readAttachmentBytes).toHaveBeenCalledWith(attachment.path);
  });

  it('returns not found for an absent attachment without reading storage', async () => {
    (prisma.assessmentAttachment.findFirst as jest.Mock).mockResolvedValue(null);
    const response = await GET(new Request('http://localhost'), params);
    expect(response.status).toBe(404);
    expect(readAttachmentBytes).not.toHaveBeenCalled();
  });

  it.each([
    ['non-owner', async () => {
      (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'other_fixture' } });
      (prisma.assessment.findFirst as jest.Mock).mockResolvedValue(null);
    }],
    ['missing session', async () => (lightAuth as jest.Mock).mockResolvedValue(null)],
    ['failed session', async () => (lightAuth as jest.Mock).mockRejectedValue(new Error('session unavailable'))],
    ['missing assessment', async () => (prisma.assessment.findFirst as jest.Mock).mockResolvedValue(null)],
  ])('hides attachment for %s before storage access', async (_label, setup) => {
    await setup();
    const response = await GET(new Request('http://localhost'), params);
    expect(response.status).toBe(404);
    expect(prisma.assessmentAttachment.findFirst).not.toHaveBeenCalled();
    expect(readAttachmentBytes).not.toHaveBeenCalled();
  });

  it.each([
    ['read', GET],
    ['delete', DELETE],
  ])('denies a professional without an explicit grant before %s storage access', async (_action, handler) => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'professional_fixture', role: 'PROFESSIONAL' } });
    (prisma.assessment.findFirst as jest.Mock).mockResolvedValue(null);

    const response = await handler(new Request('http://localhost'), params);

    expect(response.status).toBe(404);
    expect(prisma.assessment.findFirst).toHaveBeenCalledWith({
      where: { id: 'assessment_fixture', userId: 'professional_fixture' },
    });
    expect(prisma.assessmentAttachment.findFirst).not.toHaveBeenCalled();
    expect(readAttachmentBytes).not.toHaveBeenCalled();
    expect(deleteStoredAttachment).not.toHaveBeenCalled();
  });

  it('does not delete database metadata when storage deletion fails', async () => {
    (readAttachmentBytes as jest.Mock).mockResolvedValue({ bytes: Buffer.from('fixture') });
    (deleteStoredAttachment as jest.Mock).mockRejectedValue(new Error('storage unavailable'));
    const response = await DELETE(new Request('http://localhost'), params);
    expect(response.status).toBe(503);
    expect(prisma.assessmentAttachment.delete).not.toHaveBeenCalled();
  });

  it('deletes storage and metadata for its owner', async () => {
    const response = await DELETE(new Request('http://localhost'), params);
    expect(response.status).toBe(200);
    expect(deleteStoredAttachment).toHaveBeenCalledWith(attachment.path);
    expect(prisma.assessmentAttachment.delete).toHaveBeenCalledWith({ where: { id: attachment.id } });
  });

  it('restores bytes when database deletion fails after storage deletion', async () => {
    (prisma.assessmentAttachment.delete as jest.Mock).mockRejectedValue(new Error('database unavailable'));
    const response = await DELETE(new Request('http://localhost'), params);
    expect(response.status).toBe(503);
    expect(restoreStoredAttachment).toHaveBeenCalledWith(attachment.path, Buffer.from('fixture'), 'image/png');
  });

  it('binds draft paths to an exact authenticated owner segment', () => {
    expect(isOwnedDraftPath('assessment-drafts/owner_fixture/batch/file.png', 'owner_fixture')).toBe(true);
    expect(isOwnedDraftPath('assessment-drafts/other_fixture/batch/file.png', 'owner_fixture')).toBe(false);
    expect(isOwnedDraftPath('assessment-drafts/owner_fixture/../other/file.png', 'owner_fixture')).toBe(false);
  });
});
