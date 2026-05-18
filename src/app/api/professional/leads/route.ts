import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { normalizeLanguage } from '@/lib/preferences';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import { sendConsentConfirmationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const schema = z.object({
  assessmentId: z.string().min(1),
  clientName: z.string().trim().min(1).max(120),
  clientEmail: z.string().trim().email(),
  clientPhone: z.string().trim().max(30).optional(),
  requestedService: z.string().trim().max(60).optional(),
  consentConfirmed: z.literal(true),
});

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const request = await prisma.professionalAccessRequest.findFirst({
    where: { email: session.user.email.toLowerCase(), status: 'APPROVED' },
  });
  if (!request) {
    return NextResponse.json({ error: 'professional_access_required' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', details: parsed.error.format() }, { status: 400 });
  }

  const { assessmentId, clientName, clientEmail, clientPhone, requestedService } = parsed.data;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId, userId: session.user.id },
    select: { id: true, zipcode: true },
  });
  if (!assessment) {
    return NextResponse.json({ error: 'assessment_not_found' }, { status: 404 });
  }

  const existing = await prisma.lead.findFirst({
    where: { assessmentId, consentObtainedBy: 'professional', status: { not: 'CANCELLED' } },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: 'already_registered', leadId: existing.id }, { status: 409 });
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const cookieLang = cookieHeader.match(/enerscan-language=(es|en|de)/)?.[1];
  const language = normalizeLanguage(cookieLang);
  const copy = getMonetizationCopy(language).professional;

  const consentWithdrawToken = randomBytes(32).toString('hex');
  const consentText = copy.includeConsentCheck;
  const now = new Date();

  const lead = await prisma.lead.create({
    data: {
      userId: session.user.id,
      assessmentId,
      source: 'professional_offline',
      attributionOwner: 'ANCLORA',
      attributionExpiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      commissionStatus: 'NOT_APPLICABLE',
      consentAccepted: true,
      consentObtainedBy: 'professional',
      consentMethod: 'professional_offline',
      consentObtainedAt: now,
      consentText,
      consentWithdrawToken,
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      userName: clientName,
      userEmail: clientEmail,
      userPhone: clientPhone || null,
      requestedService: requestedService || null,
      zone: assessment.zipcode,
    },
    select: { id: true },
  });

  await sendConsentConfirmationEmail({
    to: clientEmail,
    withdrawToken: consentWithdrawToken,
    professionalName: session.user.name || session.user.email,
    language,
  }).catch((err) => console.warn('Consent email send failed:', err));

  return NextResponse.json({ ok: true, leadId: lead.id });
}
