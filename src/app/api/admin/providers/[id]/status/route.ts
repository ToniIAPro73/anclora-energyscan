import { NextResponse } from 'next/server';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/is-admin';
import { sendProviderVerifiedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = ['PENDING', 'VERIFIED', 'PREFERRED', 'SUSPENDED', 'EXCLUSIVE'] as const;
type ProviderStatus = typeof ALLOWED_STATUSES[number];
const VERIFICATION_STATUSES: ProviderStatus[] = ['VERIFIED', 'PREFERRED', 'EXCLUSIVE'];

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

  const provider = await prisma.provider.findUnique({ where: { id: params.id }, select: { id: true, email: true, status: true } });
  if (!provider) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const updated = await prisma.provider.update({
    where: { id: params.id },
    data: { status },
    select: { id: true, status: true },
  });

  // Send email when first transitioning into a verified state
  const wasNotVerified = !VERIFICATION_STATUSES.includes(provider.status as ProviderStatus);
  if (wasNotVerified && VERIFICATION_STATUSES.includes(status as ProviderStatus) && provider.email) {
    void sendProviderVerifiedEmail({ to: provider.email, providerId: provider.id });
  }

  return NextResponse.json({ ok: true, provider: updated });
}
