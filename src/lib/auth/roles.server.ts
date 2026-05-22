import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/is-admin';
import { getDefaultDashboardPath, type AppUserRole } from './roles';

export async function getUserRoleForEmail(email?: string | null): Promise<AppUserRole> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return 'anonymous';
  if (isAdmin(normalized)) return 'admin';

  const [provider, professional] = await Promise.all([
    prisma.provider.findFirst({
      where: {
        email: normalized,
        OR: [
          { accounts: { isNot: null } },
          { status: { in: ['VERIFIED', 'PREFERRED', 'EXCLUSIVE'] } },
        ],
      },
      select: { id: true },
    }),
    prisma.professionalAccessRequest.findFirst({
      where: { email: normalized, status: 'APPROVED' },
      select: { id: true },
    }),
  ]);

  if (provider) return 'provider';
  if (professional) return 'professional';
  return 'user';
}

export async function getDefaultDashboardPathForEmail(email?: string | null): Promise<string> {
  return getDefaultDashboardPath(await getUserRoleForEmail(email));
}
