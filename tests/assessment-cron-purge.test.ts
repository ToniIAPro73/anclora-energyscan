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
    (purgeExpiredAssessmentData as jest.Mock).mockResolvedValue({ considered: 2, deleted: 2, failed: 0 });
    const response = await POST(new Request('http://local', { method: 'POST', headers: { authorization: 'Bearer synthetic-secret' } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ considered: 2, deleted: 2, failed: 0 });
    delete process.env.CRON_SECRET;
  });
});
