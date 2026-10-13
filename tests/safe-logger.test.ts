import { logSafeError } from '@/lib/safe-logger';

describe('safe log events', () => {
  it('never serializes sentinels from error messages, file names, or connection strings', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const sentinelError = new Error('SYNTHETIC_PERSONAL_DATA /tmp/SYNTHETIC_FILENAME postgresql://user:SYNTHETIC_PASSWORD@host/db extracted SYNTHETIC_TEXT');
    logSafeError('assessment_write_failed', sentinelError);
    const rendered = spy.mock.calls.flat().join(' ');
    expect(rendered).toContain('assessment_write_failed');
    expect(rendered).not.toMatch(/SYNTHETIC_PERSONAL_DATA|SYNTHETIC_FILENAME|SYNTHETIC_PASSWORD|SYNTHETIC_TEXT|postgresql:\/\//);
    spy.mockRestore();
  });
});
