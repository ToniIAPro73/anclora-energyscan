jest.mock('@/auth.config', () => ({
  lightAuth: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
  sendProviderVerifiedEmail: jest.fn(),
}));

const mockPrisma: any = {
  provider: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

import { PATCH } from '@/app/api/admin/providers/[id]/status/route';
import { lightAuth } from '@/auth.config';
import { prisma } from '@/lib/prisma';

const routeParams = { params: { id: 'prov_123' } };

function makeRequest(body: unknown) {
  return new Request('http://localhost:3000/api/admin/providers/prov_123/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/admin/providers/[id]/status', () => {
  const originalEnv = process.env.ADMIN_EMAILS;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ADMIN_EMAILS = 'admin@test.com';
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = originalEnv;
    }
  });

  it('rejects unauthenticated requests with 403', async () => {
    (lightAuth as jest.Mock).mockResolvedValue(null);

    const res = await PATCH(makeRequest({ status: 'VERIFIED' }), routeParams);
    expect(res.status).toBe(403);
  });

  it('rejects non-admin email with 403', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { email: 'notadmin@test.com' } });

    const res = await PATCH(makeRequest({ status: 'VERIFIED' }), routeParams);
    expect(res.status).toBe(403);
    expect(prisma.provider.update).not.toHaveBeenCalled();
  });

  it('rejects invalid status with 400', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { email: 'admin@test.com' } });

    const res = await PATCH(makeRequest({ status: 'INVALID_STATUS' }), routeParams);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('invalid_status');
    expect(Array.isArray(data.allowed)).toBe(true);
    expect(prisma.provider.update).not.toHaveBeenCalled();
  });

  it('returns 400 when status is missing', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { email: 'admin@test.com' } });

    const res = await PATCH(makeRequest({}), routeParams);
    expect(res.status).toBe(400);
  });

  it('returns 404 when provider does not exist', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { email: 'admin@test.com' } });
    (prisma.provider.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await PATCH(makeRequest({ status: 'VERIFIED' }), routeParams);
    expect(res.status).toBe(404);
    expect(prisma.provider.update).not.toHaveBeenCalled();
  });

  it.each([
    'PENDING', 'VERIFIED', 'PREFERRED', 'SUSPENDED', 'EXCLUSIVE',
  ] as const)('accepts valid status %s', async (status) => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { email: 'admin@test.com' } });
    (prisma.provider.findUnique as jest.Mock).mockResolvedValue({ id: 'prov_123', email: 'provider@test.com', status: 'PENDING' });
    (prisma.provider.update as jest.Mock).mockResolvedValue({ id: 'prov_123', status });

    const res = await PATCH(makeRequest({ status }), routeParams);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.provider.status).toBe(status);
  });

  it('calls update with correct provider id and status', async () => {
    (lightAuth as jest.Mock).mockResolvedValue({ user: { email: 'admin@test.com' } });
    (prisma.provider.findUnique as jest.Mock).mockResolvedValue({ id: 'prov_123', email: 'provider@test.com', status: 'PENDING' });
    (prisma.provider.update as jest.Mock).mockResolvedValue({ id: 'prov_123', status: 'PREFERRED' });

    await PATCH(makeRequest({ status: 'PREFERRED' }), routeParams);

    expect(prisma.provider.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'prov_123' },
      data: { status: 'PREFERRED' },
    }));
  });

  it('is case-sensitive for admin email matching', async () => {
    process.env.ADMIN_EMAILS = 'Admin@Test.com';
    (lightAuth as jest.Mock).mockResolvedValue({ user: { email: 'admin@test.com' } });
    (prisma.provider.findUnique as jest.Mock).mockResolvedValue({ id: 'prov_123', email: 'provider@test.com', status: 'PENDING' });
    (prisma.provider.update as jest.Mock).mockResolvedValue({ id: 'prov_123', status: 'VERIFIED' });

    const res = await PATCH(makeRequest({ status: 'VERIFIED' }), routeParams);
    expect(res.status).toBe(200);
  });
});
