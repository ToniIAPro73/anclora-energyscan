jest.mock('@/auth.config', () => ({ lightAuth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  prisma: {
    assessment: { create: jest.fn(), delete: jest.fn() },
    assessmentAttachment: { createMany: jest.fn() },
  },
}));
jest.mock('@/lib/blob-storage', () => ({
  deleteStoredAttachment: jest.fn(),
  saveAssessmentAttachment: jest.fn(),
}));

import { POST } from '@/app/api/assessment/route';
import { lightAuth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { deleteStoredAttachment } from '@/lib/blob-storage';

const validAssessment = {
  year: 1990,
  area: 80,
  zipcode: '28001',
  propertyType: 'apartment',
  heating: 'gas',
  cooling: 'none',
  waterHeating: 'gas',
  windows: 'double',
  renewables: 'none',
};

function request(payload: Record<string, unknown>) {
  return new Request('http://localhost/api/assessment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...validAssessment, ...payload }),
  });
}

describe('assessment attachment association', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.assessment.create as jest.Mock).mockResolvedValue({ id: 'assessment_created' });
    (prisma.assessment.delete as jest.Mock).mockResolvedValue({ id: 'assessment_created' });
    (prisma.assessmentAttachment.createMany as jest.Mock).mockResolvedValue({ count: 1 });
    (deleteStoredAttachment as jest.Mock).mockResolvedValue(undefined);
  });

  it('rejects anonymous attachment association regardless of client supplied metadata', async () => {
    (lightAuth as jest.Mock).mockResolvedValue(null);
    const response = await POST(request({
      uploadedAttachments: [{ name: 'fixture.png', type: 'image/png', size: 10, pathname: 'assessment-drafts/owner_fixture/batch/fixture.png' }],
    }));
    expect(response.status).toBe(401);
    expect(prisma.assessment.create).not.toHaveBeenCalled();
  });

  it('does not associate another owner’s draft even with an authenticated session', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    const response = await POST(request({
      uploadedAttachments: [{ name: 'fixture.png', type: 'image/png', size: 10, pathname: 'assessment-drafts/other_fixture/batch/fixture.png' }],
    }));
    expect(response.status).toBe(404);
    expect(prisma.assessment.create).not.toHaveBeenCalled();
  });

  it('associates the authenticated owner’s uploaded draft with the created assessment', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    const pathname = 'assessment-drafts/owner_fixture/batch/fixture.png';

    const response = await POST(request({
      uploadedAttachments: [{ name: 'fixture.png', type: 'image/png', size: 10, pathname }],
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(expect.objectContaining({ id: 'assessment_created' }));
    expect(prisma.assessment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 'owner_fixture', isDemo: false }),
    }));
    expect(prisma.assessmentAttachment.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ assessmentId: 'assessment_created', path: `blob:${pathname}` })],
    });
    expect(deleteStoredAttachment).not.toHaveBeenCalled();
  });

  it('returns an error and removes an uploaded draft when assessment persistence fails', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    (prisma.assessment.create as jest.Mock).mockRejectedValue(new Error('synthetic database failure'));
    const pathname = 'assessment-drafts/owner_fixture/batch/fixture.png';

    const response = await POST(request({
      uploadedAttachments: [{ name: 'fixture.png', type: 'image/png', size: 10, pathname }],
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'No se pudo guardar la valoración con sus adjuntos' });
    expect(deleteStoredAttachment).toHaveBeenCalledWith(`blob:${pathname}`);
  });

  it('rolls back assessment and uploaded draft when attachment metadata persistence fails', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    (prisma.assessmentAttachment.createMany as jest.Mock).mockRejectedValue(new Error('synthetic metadata failure'));
    const pathname = 'assessment-drafts/owner_fixture/batch/fixture.png';

    const response = await POST(request({
      uploadedAttachments: [{ name: 'fixture.png', type: 'image/png', size: 10, pathname }],
    }));

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'No se pudo guardar la valoración con sus adjuntos' });
    expect(prisma.assessment.delete).toHaveBeenCalledWith({ where: { id: 'assessment_created' } });
    expect(deleteStoredAttachment).toHaveBeenCalledWith(`blob:${pathname}`);
  });
});
