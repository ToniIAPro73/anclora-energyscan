import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/leads/withdraw?error=invalid', req.url));
  }

  const lead = await prisma.lead.findUnique({
    where: { consentWithdrawToken: token },
    select: { id: true, status: true, consentWithdrawToken: true },
  });

  if (!lead || lead.status === 'CANCELLED') {
    return NextResponse.redirect(new URL('/leads/withdraw?error=already_withdrawn', req.url));
  }

  await prisma.lead.update({
    where: { id: lead.id },
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

  return NextResponse.redirect(new URL('/leads/withdraw?success=1', req.url));
}
