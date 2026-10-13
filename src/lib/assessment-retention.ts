export const ASSESSMENT_RETENTION_DAYS = 30;
export const ASSESSMENT_RETENTION_MS = ASSESSMENT_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** Retention for every attachment and derived record is anchored to the parent assessment. */
export function getAssessmentDataExpiresAt(createdAt: Date | string): Date {
  const timestamp = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  if (!Number.isFinite(timestamp)) throw new Error('Assessment creation date is invalid.');
  return new Date(timestamp + ASSESSMENT_RETENTION_MS);
}

export function isAssessmentDataExpired(createdAt: Date | string, now: Date | number = Date.now()): boolean {
  const nowTimestamp = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(nowTimestamp)) throw new Error('Current date is invalid.');
  return getAssessmentDataExpiresAt(createdAt).getTime() <= nowTimestamp;
}

export function getAssessmentRetentionCutoff(now: Date | number = Date.now()): Date {
  const nowTimestamp = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(nowTimestamp)) throw new Error('Current date is invalid.');
  return new Date(nowTimestamp - ASSESSMENT_RETENTION_MS);
}

export function isAssessmentActive(createdAt: Date | string, now: Date | number = Date.now()): boolean {
  return !isAssessmentDataExpired(createdAt, now);
}
