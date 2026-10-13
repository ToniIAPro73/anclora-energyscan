import { lightAuth } from '@/auth.config';
import { prisma } from '@/lib/prisma';

/** Returns the assessment only when the current server session owns it. */
export async function getOwnedAssessment(assessmentId: string) {
  let userId: string | undefined;
  try {
    userId = (await lightAuth())?.user?.id;
  } catch {
    return null;
  }

  if (!userId) return null;
  return prisma.assessment.findFirst({ where: { id: assessmentId, userId } });
}

export async function isOwnedAssessment(assessmentId: string) {
  return Boolean(await getOwnedAssessment(assessmentId));
}

export function isOwnedDraftPath(pathname: string, userId: string) {
  const segments = pathname.split('/');
  return segments[0] === 'assessment-drafts' && segments[1] === userId && segments.length >= 3 && segments.every((segment) => segment && segment !== '.' && segment !== '..');
}
