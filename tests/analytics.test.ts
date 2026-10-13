import { sanitizeAnalyticsPayload, trackEvent } from '@/lib/analytics';

describe('analytics', () => {
  it('removes personal data from payloads', () => {
    const payload = sanitizeAnalyticsPayload({
      assessmentId: 'assess_1',
      userEmail: 'person@example.com',
      userPhone: '+34123456789',
      address: 'Calle Mayor 1',
      cadastralReference: '1234567AB1234C0001DE',
      zipcode: '07015',
    });
    expect(payload).toEqual({ assessmentId: 'assess_1', zipcodePrefix: '07' });
  });

  it('does not throw without PostHog configuration', () => {
    expect(() => trackEvent('checkout_initiated', { assessmentId: 'assess_1' })).not.toThrow();
  });

  it('does not write personal or assessment sentinels to application logs', async () => {
    const sentinel = 'SYNTHETIC_ASSESSMENT_ID_PERSONAL_SENTINEL';
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.ENABLE_ANALYTICS_EVENT_LOG;
    const spies = [
      jest.spyOn(console, 'debug').mockImplementation(() => undefined),
      jest.spyOn(console, 'info').mockImplementation(() => undefined),
      jest.spyOn(console, 'log').mockImplementation(() => undefined),
      jest.spyOn(console, 'warn').mockImplementation(() => undefined),
      jest.spyOn(console, 'error').mockImplementation(() => undefined),
    ];

    trackEvent('assessment_created', { assessmentId: sentinel, zipcode: '28001' });
    await Promise.resolve();

    const rendered = spies.flatMap((spy) => spy.mock.calls.flat()).join(' ');
    expect(rendered).not.toContain(sentinel);
    spies.forEach((spy) => spy.mockRestore());
    process.env = originalEnv;
  });
});
