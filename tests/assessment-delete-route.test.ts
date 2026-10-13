jest.mock('@/auth.config', () => ({ lightAuth: jest.fn() }));
jest.mock('@/lib/prisma', () => ({ prisma: {} }));
jest.mock('@/lib/blob-storage', () => ({ deleteStoredAttachment: jest.fn() }));
jest.mock('@/lib/assessment-data-deletion', () => ({ deleteAssessmentData: jest.fn() }));

import { DELETE } from '@/app/api/assessment/[id]/route';
import { lightAuth } from '@/auth.config';
import { deleteAssessmentData } from '@/lib/assessment-data-deletion';

describe('owner assessment deletion route', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not expose assessment existence without an authenticated owner', async () => {
    (lightAuth as jest.Mock).mockResolvedValue(null);
    const response = await DELETE(new Request('http://local', { method: 'DELETE' }), { params: { id: 'assessment_fixture' } });
    expect(response.status).toBe(404);
    expect(deleteAssessmentData).not.toHaveBeenCalled();
  });

  it('deletes only the assessment associated with the current owner', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { id: 'owner_fixture' } });
    (deleteAssessmentData as jest.Mock).mockResolvedValue(true);
    const response = await DELETE(new Request('http://local', { method: 'DELETE' }), { params: { id: 'assessment_fixture' } });
    expect(response.status).toBe(200);
    expect(deleteAssessmentData).toHaveBeenCalledWith('assessment_fixture', 'owner_fixture');
  });
});
