import { NextResponse } from 'next/server';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail, getSupportEmail, getAppUrl } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const request = await prisma.professionalAccessRequest.findFirst({
    where: { email: session.user.email.toLowerCase(), status: 'APPROVED' },
    select: { company: true, role: true },
  });
  if (!request) {
    return NextResponse.json({ error: 'professional_access_required' }, { status: 403 });
  }

  await prisma.professionalBranding.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      interestedAt: new Date(),
    },
    update: {
      interestedAt: new Date(),
    },
  });

  const adminEmail = getSupportEmail();
  const appUrl = getAppUrl();
  await sendTransactionalEmail({
    type: 'checkout_recovery',
    to: adminEmail,
    subject: '[EnergyScan] Interés en addon White Label',
    html: [
      `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111;max-width:640px;margin:0 auto;padding:24px">`,
      `<h2>Nuevo interés en White Label</h2>`,
      `<p><strong>Email:</strong> ${session.user.email}</p>`,
      `<p><strong>Nombre:</strong> ${session.user.name || '—'}</p>`,
      `<p><strong>Empresa:</strong> ${request.company || '—'}</p>`,
      `<p><strong>Rol:</strong> ${request.role || '—'}</p>`,
      `<p><a href="${appUrl}/admin/providers">Ver panel admin</a></p>`,
      `</div>`,
    ].join(''),
  }).catch((err) => console.warn('White label interest email failed:', err));

  return NextResponse.json({ ok: true });
}
