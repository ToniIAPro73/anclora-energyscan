import { getDefaultDashboardPath, getDefaultDashboardPathForSession, isAdminUser } from '@/lib/auth/roles';

describe('auth role navigation helpers', () => {
  const originalAdminEmails = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'pmi140979@gmail.com,admin@example.com';
  });

  afterAll(() => {
    if (originalAdminEmails === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = originalAdminEmails;
  });

  it('recognizes configured admin email', () => {
    expect(isAdminUser('pmi140979@gmail.com')).toBe(true);
    expect(isAdminUser({ email: 'ADMIN@example.com' })).toBe(true);
  });

  it('does not treat unknown users as admin', () => {
    expect(isAdminUser('user@example.com')).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it('uses explicit admin flag from session user', () => {
    expect(isAdminUser({ email: 'user@example.com', isAdmin: true })).toBe(true);
  });

  it('maps roles to default dashboards', () => {
    expect(getDefaultDashboardPath('admin')).toBe('/admin');
    expect(getDefaultDashboardPath('provider')).toBe('/provider/dashboard');
    expect(getDefaultDashboardPath('professional')).toBe('/profesional/dashboard');
    expect(getDefaultDashboardPath('user')).toBe('/dashboard');
    expect(getDefaultDashboardPath('anonymous')).toBe('/auth');
  });

  it('maps admin session to admin dashboard', () => {
    expect(getDefaultDashboardPathForSession({
      expires: new Date(Date.now() + 1000).toISOString(),
      user: { id: 'u1', email: 'pmi140979@gmail.com' },
    })).toBe('/admin');
  });
});
