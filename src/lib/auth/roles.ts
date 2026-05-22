import type { Session } from 'next-auth';
import { isAdmin } from '@/lib/is-admin';

export type AppUserRole = 'admin' | 'provider' | 'professional' | 'user' | 'anonymous';

export function isAdminUser(userOrEmail?: { email?: string | null; isAdmin?: boolean | null } | string | null): boolean {
  if (!userOrEmail) return false;
  if (typeof userOrEmail === 'string') return isAdmin(userOrEmail);
  return Boolean(userOrEmail.isAdmin || isAdmin(userOrEmail.email));
}

export function getDefaultDashboardPath(role: AppUserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'provider':
      return '/provider/dashboard';
    case 'professional':
      return '/profesional/dashboard';
    case 'anonymous':
      return '/auth';
    default:
      return '/dashboard';
  }
}

export function getDefaultDashboardPathForSession(session?: Session | null): string {
  if (!session?.user) return getDefaultDashboardPath('anonymous');
  if (isAdminUser(session.user)) return getDefaultDashboardPath('admin');
  return getDefaultDashboardPath('user');
}
