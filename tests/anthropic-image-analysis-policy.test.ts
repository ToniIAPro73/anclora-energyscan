import { analyzePropertyImage } from '@/lib/vision/image-analysis';

describe('Anthropic image route opt-in policy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'synthetic-key' };
    delete process.env.ENABLE_ANTHROPIC_IMAGE_ANALYSIS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns local fallback when the documented opt-in flag is absent', async () => {
    await expect(analyzePropertyImage('SYNTHETIC_IMAGE', 'image/jpeg')).resolves.toEqual({
      relevant: true,
      category: 'facade',
      findings: [],
      confidence: 'low',
    });
  });

  it('also stays disabled when the API key is absent, even if the flag is enabled', async () => {
    process.env.ENABLE_ANTHROPIC_IMAGE_ANALYSIS = 'true';
    delete process.env.ANTHROPIC_API_KEY;
    await expect(analyzePropertyImage('SYNTHETIC_IMAGE', 'image/jpeg')).resolves.toMatchObject({ confidence: 'low' });
  });
});
