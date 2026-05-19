import { getVisionAnalysisConfig } from '@/lib/vision/vision-config';

describe('getVisionAnalysisConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ENABLE_VISION_ANALYSIS;
    delete process.env.ENABLE_FREE_VISION_ANALYSIS;
    delete process.env.VISION_ANALYSIS_INCLUDED_IN_PREMIUM;
    delete process.env.VISION_MAX_IMAGES_PREMIUM;
    delete process.env.VISION_MAX_IMAGES_PRO;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('is disabled and safe by default when vars are absent', () => {
    const config = getVisionAnalysisConfig();
    expect(config.enabled).toBe(false);
    expect(config.freeEnabled).toBe(false);
    expect(config.defaultMaxImages).toBe(0);
  });

  it('includes premium by default (not opted out)', () => {
    const config = getVisionAnalysisConfig();
    expect(config.includedInPremium).toBe(true);
  });

  it('uses safe fallback limits when vars are absent', () => {
    const config = getVisionAnalysisConfig();
    expect(config.maxImagesPremium).toBe(3);
    expect(config.maxImagesPro).toBe(8);
  });

  it('reads ENABLE_VISION_ANALYSIS=true correctly', () => {
    process.env.ENABLE_VISION_ANALYSIS = 'true';
    expect(getVisionAnalysisConfig().enabled).toBe(true);
  });

  it('keeps freeEnabled false unless explicitly set to true', () => {
    process.env.ENABLE_VISION_ANALYSIS = 'true';
    expect(getVisionAnalysisConfig().freeEnabled).toBe(false);
  });

  it('reads ENABLE_FREE_VISION_ANALYSIS=true correctly', () => {
    process.env.ENABLE_FREE_VISION_ANALYSIS = 'true';
    expect(getVisionAnalysisConfig().freeEnabled).toBe(true);
  });

  it('reads custom VISION_MAX_IMAGES_PREMIUM', () => {
    process.env.VISION_MAX_IMAGES_PREMIUM = '5';
    expect(getVisionAnalysisConfig().maxImagesPremium).toBe(5);
  });

  it('reads custom VISION_MAX_IMAGES_PRO', () => {
    process.env.VISION_MAX_IMAGES_PRO = '12';
    expect(getVisionAnalysisConfig().maxImagesPro).toBe(12);
  });

  it('falls back to default for invalid VISION_MAX_IMAGES_PREMIUM', () => {
    process.env.VISION_MAX_IMAGES_PREMIUM = 'not-a-number';
    expect(getVisionAnalysisConfig().maxImagesPremium).toBe(3);
  });

  it('disables includedInPremium when explicitly set to false', () => {
    process.env.VISION_ANALYSIS_INCLUDED_IN_PREMIUM = 'false';
    expect(getVisionAnalysisConfig().includedInPremium).toBe(false);
  });
});
