jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/email', () => ({
  sendConsentConfirmationEmail: jest.fn().mockResolvedValue({ ok: true }),
}));

const mockPrisma: any = {
  professionalAccessRequest: {
    findFirst: jest.fn(),
  },
  assessment: {
    findUnique: jest.fn(),
  },
  lead: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

import { POST } from '@/app/api/professional/leads/route';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sendConsentConfirmationEmail } from '@/lib/email';

const BASE_URL = 'http://localhost:3000/api/professional/leads';

function makeRequest(body: unknown, cookie = '') {
  return new Request(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  assessmentId: 'assess_123',
  clientName: 'Ana García',
  clientEmail: 'ana@example.com',
  clientPhone: '+34600000000',
  requestedService: 'CEE',
  consentConfirmed: true,
};

const approvedSession = { user: { id: 'user_123', email: 'pro@example.com', name: 'Pro User' } };
const approvedRequest = { id: 'par_123', status: 'APPROVED' };
const validAssessment = { id: 'assess_123', zipcode: '28001' };
const createdLead = { id: 'lead_abc' };

describe('POST /api/professional/leads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it('rejects session without email', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user_123' } });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it('rejects when professional access is not APPROVED', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toBe('professional_access_required');
  });

  it('rejects invalid body (missing required fields)', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(approvedRequest);

    const res = await POST(makeRequest({ assessmentId: 'a', clientName: '' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('invalid_input');
  });

  it('rejects when consentConfirmed is false', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(approvedRequest);

    const res = await POST(makeRequest({ ...validBody, consentConfirmed: false }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when assessment does not belong to professional', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(approvedRequest);
    (prisma.assessment.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('assessment_not_found');
  });

  it('returns 409 when lead for that assessment already exists', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(approvedRequest);
    (prisma.assessment.findUnique as jest.Mock).mockResolvedValue(validAssessment);
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue({ id: 'lead_existing' });

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe('already_registered');
    expect(data.leadId).toBe('lead_existing');
  });

  it('creates lead with consent fields and fires confirmation email', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(approvedRequest);
    (prisma.assessment.findUnique as jest.Mock).mockResolvedValue(validAssessment);
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.lead.create as jest.Mock).mockResolvedValue(createdLead);

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.leadId).toBe('lead_abc');

    expect(prisma.lead.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        userId: 'user_123',
        assessmentId: 'assess_123',
        source: 'professional_offline',
        consentObtainedBy: 'professional',
        consentMethod: 'professional_offline',
        consentAccepted: true,
        clientName: 'Ana García',
        clientEmail: 'ana@example.com',
        clientPhone: '+34600000000',
        requestedService: 'CEE',
        zone: '28001',
      }),
    }));

    // consentWithdrawToken must be set
    const createCall = (prisma.lead.create as jest.Mock).mock.calls[0][0];
    expect(typeof createCall.data.consentWithdrawToken).toBe('string');
    expect(createCall.data.consentWithdrawToken).toHaveLength(64);

    expect(sendConsentConfirmationEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'ana@example.com',
      professionalName: 'Pro User',
    }));
  });

  it('creates lead without optional fields when omitted', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(approvedRequest);
    (prisma.assessment.findUnique as jest.Mock).mockResolvedValue(validAssessment);
    (prisma.lead.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.lead.create as jest.Mock).mockResolvedValue(createdLead);

    const minBody = {
      assessmentId: 'assess_123',
      clientName: 'Pedro',
      clientEmail: 'pedro@example.com',
      consentConfirmed: true as const,
    };

    const res = await POST(makeRequest(minBody));
    expect(res.status).toBe(200);

    const createCall = (prisma.lead.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.clientPhone).toBeNull();
    expect(createCall.data.requestedService).toBeNull();
  });

  it('looks up professional request by session email (lowercased)', async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: 'user_123', email: 'Pro@EXAMPLE.COM', name: 'Pro' } });
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(null);

    await POST(makeRequest(validBody));

    expect(prisma.professionalAccessRequest.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { email: 'pro@example.com', status: 'APPROVED' },
    }));
  });

  it('reads assessment only for the authenticated user', async () => {
    (auth as jest.Mock).mockResolvedValue(approvedSession);
    (prisma.professionalAccessRequest.findFirst as jest.Mock).mockResolvedValue(approvedRequest);
    (prisma.assessment.findUnique as jest.Mock).mockResolvedValue(null);

    await POST(makeRequest(validBody));

    expect(prisma.assessment.findUnique).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'assess_123', userId: 'user_123' },
    }));
  });
});
