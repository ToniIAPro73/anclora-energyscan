import { getAssessmentDataExpiresAt, getAssessmentRetentionCutoff, isAssessmentDataExpired } from '@/lib/assessment-retention';

describe('assessment retention', () => {
  const createdAt = new Date('2026-01-01T10:00:00.000Z');

  it('expires assessment data exactly 30 days after assessment creation', () => {
    const expiresAt = getAssessmentDataExpiresAt(createdAt);
    expect(expiresAt.toISOString()).toBe('2026-01-31T10:00:00.000Z');
    expect(isAssessmentDataExpired(createdAt, new Date('2026-01-31T09:59:59.999Z'))).toBe(false);
    expect(isAssessmentDataExpired(createdAt, expiresAt)).toBe(true);
  });

  it('computes the purge cutoff from a controlled clock', () => {
    expect(getAssessmentRetentionCutoff(new Date('2026-01-31T10:00:00.000Z')).toISOString())
      .toBe('2026-01-01T10:00:00.000Z');
  });

  it('rejects invalid timestamps instead of retaining them indefinitely', () => {
    expect(() => isAssessmentDataExpired('not-a-date', createdAt)).toThrow('Assessment creation date is invalid.');
  });
});
