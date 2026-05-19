import { resolveVisionEntitlement } from '@/lib/vision/vision-entitlements';
import type { VisionAnalysisConfig } from '@/lib/vision/vision-config';

const ENABLED_CONFIG: VisionAnalysisConfig = {
  enabled: true,
  freeEnabled: false,
  includedInPremium: true,
  maxImagesPremium: 3,
  maxImagesPro: 8,
  defaultMaxImages: 0,
};

const DISABLED_CONFIG: VisionAnalysisConfig = { ...ENABLED_CONFIG, enabled: false };
const FREE_CONFIG: VisionAnalysisConfig = { ...ENABLED_CONFIG, freeEnabled: true };

describe('resolveVisionEntitlement', () => {
  it('blocks when vision_analysis is disabled', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: new Date() },
      config: DISABLED_CONFIG,
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('vision_disabled');
    expect(result.maxImages).toBe(0);
  });

  it('blocks free user by default', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: null },
      config: ENABLED_CONFIG,
    });
    expect(result.allowed).toBe(false);
    expect(result.level).toBe('none');
    expect(result.reason).toBe('not_premium');
  });

  it('allows when ENABLE_FREE_VISION_ANALYSIS=true (free_test level, max 1 image)', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: null },
      config: FREE_CONFIG,
    });
    expect(result.allowed).toBe(true);
    expect(result.level).toBe('free_test');
    expect(result.maxImages).toBe(1);
    expect(result.reason).toBe('free_test_enabled');
  });

  it('allows premium assessment (paidAt present)', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: new Date('2026-05-01') },
      config: ENABLED_CONFIG,
    });
    expect(result.allowed).toBe(true);
    expect(result.level).toBe('premium');
    expect(result.maxImages).toBe(3);
    expect(result.reason).toBe('premium_assessment');
  });

  it('applies maxImagesPremium from config', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: new Date() },
      config: { ...ENABLED_CONFIG, maxImagesPremium: 5 },
    });
    expect(result.maxImages).toBe(5);
  });

  it('allows pro user with higher limit', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: null },
      user: { plan: 'pro' },
      config: ENABLED_CONFIG,
    });
    expect(result.allowed).toBe(true);
    expect(result.level).toBe('pro');
    expect(result.maxImages).toBe(8);
    expect(result.reason).toBe('pro_user');
  });

  it('allows b2b role user', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: null },
      user: { role: 'b2b' },
      config: ENABLED_CONFIG,
    });
    expect(result.allowed).toBe(true);
    expect(result.level).toBe('pro');
  });

  it('blocks when includedInPremium is false even with paidAt', () => {
    const result = resolveVisionEntitlement({
      assessment: { paidAt: new Date() },
      config: { ...ENABLED_CONFIG, includedInPremium: false },
    });
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('not_premium');
  });

  it('falls back to safe config when config not provided and ENABLE_VISION_ANALYSIS is unset', () => {
    const originalEnv = process.env;
    process.env = { ...originalEnv };
    delete process.env.ENABLE_VISION_ANALYSIS;
    const result = resolveVisionEntitlement({ assessment: { paidAt: new Date() } });
    expect(result.allowed).toBe(false);
    process.env = originalEnv;
  });
});
