import { NextResponse } from 'next/server';
import { z } from 'zod';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { KNOWLEDGE_CATEGORIES, SPAIN_REGIONS } from '@/lib/knowledge/constants';
import { isAdmin } from '@/lib/is-admin';

export const dynamic = 'force-dynamic';

const REGION_CODES = SPAIN_REGIONS.map((r) => r.code);

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  category: z.enum(KNOWLEDGE_CATEGORIES),
  region: z.string().trim().max(10).nullable().optional(),
  content: z.string().trim().min(1).max(8000),
  tags: z.string().trim().max(500).nullable().optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  sourceUrl: z.string().max(500).nullable().optional(),
  sourceLabel: z.string().trim().max(200).nullable().optional(),
  active: z.boolean().default(true),
});

export async function GET(req: Request) {
  const session = await auth().catch(() => null);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const url = new URL(req.url);
  const category = url.searchParams.get('category') || undefined;
  const region = url.searchParams.get('region') || undefined;
  const activeParam = url.searchParams.get('active');
  const active = activeParam === null ? undefined : activeParam === 'true';

  const entries = await prisma.knowledgeEntry.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(region === 'national' ? { region: null } : region ? { region } : {}),
      ...(active !== undefined ? { active } : {}),
    },
    orderBy: [{ category: 'asc' }, { updatedAt: 'desc' }],
  });

  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const session = await auth().catch(() => null);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', details: parsed.error.format() }, { status: 400 });
  }

  const { region, validFrom, validUntil, sourceUrl, ...rest } = parsed.data;

  const regionCode = region && REGION_CODES.includes(region as typeof REGION_CODES[number]) ? region : null;

  const entry = await prisma.knowledgeEntry.create({
    data: {
      ...rest,
      region: regionCode,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      sourceUrl: sourceUrl || null,
      createdBy: session!.user!.email!,
    },
  });

  return NextResponse.json({ ok: true, entry });
}
