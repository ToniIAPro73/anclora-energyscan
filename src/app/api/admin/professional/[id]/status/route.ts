import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/is-admin';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { sendProfessionalApprovedEmail } from '@/lib/email';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const status: string = body.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const existing = await prisma.professionalAccessRequest.findUnique({ where: { id: params.id }, select: { status: true, email: true } });
  const record = await prisma.professionalAccessRequest.update({
    where: { id: params.id },
    data: { status },
  });

  // Send email only when first transitioning to APPROVED
  if (existing?.status !== 'APPROVED' && status === 'APPROVED' && record.email) {
    void sendProfessionalApprovedEmail({ to: record.email, requestId: record.id });
  }

  return NextResponse.json({ id: record.id, status: record.status });
}
