import { analyzeImageWithOpenRouter, FREE_VISION_MODEL_ALLOWLIST } from '@/lib/vision/openrouter-vision';

describe('OpenRouter privacy and free model policy', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv, OPENROUTER_API_KEY: 'synthetic-token' };
    delete process.env.OPENROUTER_VISION_MODEL;
    delete process.env.OPENROUTER_VISION_FALLBACK_MODEL;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"imageType":"facade","relevant":true,"confidence":"high","findings":[],"warnings":[],"reportSummary":null}' } }] }),
    }) as jest.Mock;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('keeps a closed allowlist of free image models', () => {
    expect(FREE_VISION_MODEL_ALLOWLIST.length).toBeGreaterThan(0);
    expect(FREE_VISION_MODEL_ALLOWLIST.every((model) => model.endsWith(':free'))).toBe(true);
  });

  it('rejects environment model identifiers outside the allowlist without making a request', async () => {
    process.env.OPENROUTER_VISION_MODEL = 'vendor/paid-model';
    process.env.OPENROUTER_VISION_FALLBACK_MODEL = 'vendor/another-paid-model';
    const result = await analyzeImageWithOpenRouter('image', 'image/jpeg');
    expect(result.model).toBe('none');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sends data_collection deny and only an allowlisted model', async () => {
    await analyzeImageWithOpenRouter('image', 'image/jpeg');
    const [, request] = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(request.body);
    expect(FREE_VISION_MODEL_ALLOWLIST).toContain(body.model);
    expect(body.provider.data_collection).toBe('deny');
    expect(body.messages[1].content[0].image_url.url).toBe('data:image/jpeg;base64,image');
  });

  it('degrades safely if every eligible endpoint fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('synthetic upstream failure')) as jest.Mock;
    const result = await analyzeImageWithOpenRouter('image', 'image/jpeg');
    expect(result.model).toBe('failed');
    expect(result.findings).toEqual([]);
  });
});
