import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/is-admin';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['PENDING', 'VERIFIED', 'PREFERRED', 'SUSPENDED', 'EXCLUSIVE'] as const;
type ProviderStatus = typeof ALLOWED_STATUSES[number];

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as string | undefined;

  if (!status || !ALLOWED_STATUSES.includes(status as ProviderStatus)) {
    return NextResponse.json(
      { error: 'invalid_status', allowed: ALLOWED_STATUSES },
      { status: 400 }
    );
  }

  const provider = await prisma.provider.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!provider) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const updated = await prisma.provider.update({
    where: { id: params.id },
    data: { status },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, provider: updated });
}
