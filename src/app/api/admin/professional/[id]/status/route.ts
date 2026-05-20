import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

function isAdmin(email?: string | null) {
  const allowlist = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allowlist.includes(email.toLowerCase()));
}

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

  const record = await prisma.professionalAccessRequest.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ id: record.id, status: record.status });
}
