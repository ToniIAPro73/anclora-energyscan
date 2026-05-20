import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { lightAuth } from '@/auth.config';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  categories: z.array(z.string()).min(1).max(8),
  zones: z.array(z.string()).min(1).max(12),
  website: z.string().trim().url().optional().or(z.literal('')),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'provider_invalid' }, { status: 400 });

  const session = await lightAuth().catch(() => null);
  const userId = session?.user?.id ?? null;

  // If user is logged in and already has a ProviderAccount, return it without duplicating
  if (userId) {
    const existing = await prisma.providerAccount.findUnique({
      where: { userId },
      include: { provider: true },
    });
    if (existing) {
      return NextResponse.json({ ok: true, provider: { id: existing.provider.id, status: existing.provider.status } });
    }
  }

  // Prevent duplicate Provider records by email
  let provider = await prisma.provider.findFirst({
    where: { email: parsed.data.email },
  });

  if (!provider) {
    provider = await prisma.provider.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        website: parsed.data.website || undefined,
        categories: JSON.stringify(parsed.data.categories),
        zones: JSON.stringify(parsed.data.zones),
        status: 'PENDING',
        verified: false,
        source: 'provider_signup',
      },
    });
    trackEvent('provider_signup_completed', { providerId: provider.id, source: 'provider_register' });
  }

  if (userId) {
    // Check if this Provider is already linked to a different user
    const existingLink = await prisma.providerAccount.findUnique({ where: { providerId: provider.id } });
    if (existingLink && existingLink.userId !== userId) {
      // Provider belongs to another user - cannot claim it
      return NextResponse.json({ error: 'provider_claimed' }, { status: 409 });
    }
    if (!existingLink) {
      await prisma.providerAccount.create({
        data: { userId, providerId: provider.id },
      });
    }
  }

  return NextResponse.json({ ok: true, provider: { id: provider.id, status: provider.status } });
}
