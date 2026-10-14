import { POST } from '@/app/api/budget-review/compare/route';

describe('POST /api/budget-review/compare', () => {
  it('returns a transient structural result without price verdicts or deltas', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const sentinel = 'SYNTHETIC_PRIVATE_SCOPE_7f3a';
    const response = await POST(new Request('http://localhost/api/budget-review/compare', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-private-probe': sentinel },
      body: JSON.stringify({
        leftText: 'Pintado de parametro vertical 20 m2 12.00 €/m2 240.00 €',
        rightText: 'Pintado de parametro vertical 18 m2 13.00 €/m2 234.00 €',
      }),
    }));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.result.priceComparisonAvailable).toBe(false);
    expect(payload.result.matches[0]).toMatchObject({ scope: 'UNKNOWN', vat: 'UNKNOWN', priceStatus: 'NO_REFERENCE' });
    expect(JSON.stringify(payload)).not.toMatch(/priceDelta|priceVerdict|HIGH_REVIEW|LOW_REVIEW/);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(logSpy.mock.calls.flat().join(' ')).not.toContain(sentinel);
    expect(errorSpy.mock.calls.flat().join(' ')).not.toContain(sentinel);
    expect(warnSpy.mock.calls.flat().join(' ')).not.toContain(sentinel);
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('rejects missing or undersized input', async () => {
    const response = await POST(new Request('http://localhost/api/budget-review/compare', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ leftText: 'short', rightText: 'short' }),
    }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, error: 'comparison_input_invalid' });
  });
});
