const mockPrisma: any = {
  lead: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

import { GET } from '@/app/api/leads/withdraw/route';
import { prisma } from '@/lib/prisma';

function makeRequest(token?: string) {
  const url = token
    ? `http://localhost:3000/api/leads/withdraw?token=${token}`
    : 'http://localhost:3000/api/leads/withdraw';
  return new Request(url);
}

const activeLead = { id: 'lead_123', status: 'PENDING', consentWithdrawToken: 'tok_abc' };

describe('GET /api/leads/withdraw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to error when token is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('error=invalid');
    expect(prisma.lead.findUnique).not.toHaveBeenCalled();
  });

  it('redirects to error when token does not match any lead', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await GET(makeRequest('bad_token'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('error=already_withdrawn');
    expect(prisma.lead.update).not.toHaveBeenCalled();
  });

  it('redirects to error when lead is already CANCELLED', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue({ ...activeLead, status: 'CANCELLED' });

    const res = await GET(makeRequest('tok_abc'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('error=already_withdrawn');
    expect(prisma.lead.update).not.toHaveBeenCalled();
  });

  it('cancels lead and nulls personal data on valid token', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue(activeLead);
    (prisma.lead.update as jest.Mock).mockResolvedValue({ id: 'lead_123', status: 'CANCELLED' });

    const res = await GET(makeRequest('tok_abc'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('success=1');

    expect(prisma.lead.update).toHaveBeenCalledWith({
      where: { id: 'lead_123' },
      data: {
        status: 'CANCELLED',
        consentAccepted: false,
        consentWithdrawToken: null,
        clientName: null,
        clientEmail: null,
        clientPhone: null,
        userName: null,
        userEmail: null,
        userPhone: null,
      },
    });
  });

  it('looks up lead by consentWithdrawToken', async () => {
    (prisma.lead.findUnique as jest.Mock).mockResolvedValue(activeLead);
    (prisma.lead.update as jest.Mock).mockResolvedValue({ id: 'lead_123', status: 'CANCELLED' });

    await GET(makeRequest('tok_abc'));

    expect(prisma.lead.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { consentWithdrawToken: 'tok_abc' },
    }));
  });
});
