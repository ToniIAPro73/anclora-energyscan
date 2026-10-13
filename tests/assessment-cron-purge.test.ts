jest.mock('@/lib/assessment-data-deletion', () => ({ purgeExpiredAssessmentData: jest.fn() }));

import { POST } from '@/app/api/cron/purge-expired-assessments/route';
import { purgeExpiredAssessmentData } from '@/lib/assessment-data-deletion';

describe('expired assessment purge endpoint', () => {
  it('does not start a purge without CRON_SECRET authorization', async () => {
    const response = await POST(new Request('http://local', { method: 'POST' }));
    expect(response.status).toBe(401);
    expect(purgeExpiredAssessmentData).not.toHaveBeenCalled();
  });

  it('runs purge only after authorization', async () => {
    process.env.CRON_SECRET = 'synthetic-secret';
    const result = {
      considered: 2,
      deleted: 2,
      failed: 0,
      orphanedBlobs: { failed: 0 },
    };
    (purgeExpiredAssessmentData as jest.Mock).mockResolvedValue(result);
    const response = await POST(new Request('http://local', { method: 'POST', headers: { authorization: 'Bearer synthetic-secret' } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);
    delete process.env.CRON_SECRET;
  });

  it('returns a retryable status when orphaned Blob deletion partially fails', async () => {
    process.env.CRON_SECRET = 'synthetic-secret';
    (purgeExpiredAssessmentData as jest.Mock).mockResolvedValue({
      considered: 0,
      deleted: 0,
      failed: 0,
      orphanedBlobs: { failed: 1 },
    });
    const response = await POST(new Request('http://local', { method: 'POST', headers: { authorization: 'Bearer synthetic-secret' } }));
    expect(response.status).toBe(503);
    delete process.env.CRON_SECRET;
  });
});
