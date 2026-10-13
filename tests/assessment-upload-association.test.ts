jest.mock('@/auth.config', () => ({ lightAuth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: { assessment: { create: jest.fn() } } }));

import { POST } from '@/app/api/assessment/route';
import { lightAuth } from '@/auth.config';
import { prisma } from '@/lib/prisma';

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
  beforeEach(() => jest.clearAllMocks());

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
});
