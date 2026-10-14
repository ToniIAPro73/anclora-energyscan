import { assertCanDownloadPremiumPdf, canAccessPremiumContent } from '@/lib/premium-access';

describe('premium access', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ENABLE_DEMO_PREMIUM;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows premium access when paidAt is present', () => {
    const access = canAccessPremiumContent({ paidAt: new Date('2026-05-16T10:00:00Z') });
    expect(access.isPaid).toBe(true);
    expect(access.reason).toBe('paid');
    expect(assertCanDownloadPremiumPdf(access)).toBe(true);
  });

  it('does not treat legacy isPremium as paid without paidAt', () => {
    const access = canAccessPremiumContent({ isPremium: true });
    expect(access.isPaid).toBe(false);
    expect(access.reason).toBe('unpaid');
    expect(assertCanDownloadPremiumPdf(access)).toBe(false);
  });

  it('allows authorized demo premium access', () => {
    process.env.ENABLE_DEMO_PREMIUM = 'true';
    const access = canAccessPremiumContent({ isDemo: true });
    expect(access.isPaid).toBe(true);
    expect(access.reason).toBe('demo');
  });

  it('does not grant premium access from a forged demo flag inside a stateless payload', () => {
    process.env.ENABLE_DEMO_PREMIUM = 'true';
    const forgedLocalPayload = {
      isDemo: true,
      paidAt: '2099-01-01T00:00:00.000Z',
      scoreResult: { score: 100 },
    };

    const access = canAccessPremiumContent({
      isDemo: false,
      statelessPayload: forgedLocalPayload,
    });

    expect(access.isStateless).toBe(true);
    expect(access.isDemo).toBe(false);
    expect(access.isPaid).toBe(false);
    expect(assertCanDownloadPremiumPdf(access)).toBe(false);
  });

  it('keeps unpaid assessments blocked', () => {
    const access = canAccessPremiumContent({});
    expect(access.isPaid).toBe(false);
    expect(assertCanDownloadPremiumPdf(access)).toBe(false);
  });
});
