import { lightAuth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { getAssessmentRetentionCutoff } from '@/lib/assessment-retention';

export async function getAuthenticatedUserId() {
  try {
    return (await lightAuth())?.user?.id || null;
  } catch {
    return null;
  }
}

/** Returns the assessment only when the current server session owns it. */
export async function getOwnedAssessment(assessmentId: string) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  return prisma.assessment.findFirst({
    where: { id: assessmentId, userId, createdAt: { gt: getAssessmentRetentionCutoff() } },
  });
}

export async function isOwnedAssessment(assessmentId: string) {
  return Boolean(await getOwnedAssessment(assessmentId));
}

export function isOwnedDraftPath(pathname: string, userId: string) {
  const segments = pathname.split('/');
  return segments[0] === 'assessment-drafts' && segments[1] === userId && segments.length >= 3 && segments.every((segment) => segment && segment !== '.' && segment !== '..');
}
