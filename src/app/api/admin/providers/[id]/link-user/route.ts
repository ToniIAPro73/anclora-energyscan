import { NextResponse } from 'next/server';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/is-admin';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const provider = await prisma.provider.findUnique({
    where: { id: params.id },
    include: { accounts: { select: { userId: true } } },
  });
  if (!provider) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (provider.accounts.length > 0) {
    return NextResponse.json({ ok: true, alreadyLinked: true });
  }

  if (!provider.email) {
    return NextResponse.json({ error: 'provider_has_no_email' }, { status: 422 });
  }

  const user = await prisma.user.findUnique({ where: { email: provider.email } });
  if (!user) {
    return NextResponse.json({ error: 'no_user_with_provider_email' }, { status: 404 });
  }

  await prisma.providerAccount.create({
    data: { userId: user.id, providerId: provider.id },
  });

  return NextResponse.json({ ok: true, linked: true, userId: user.id });
}
