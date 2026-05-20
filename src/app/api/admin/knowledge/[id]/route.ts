import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { KNOWLEDGE_CATEGORIES, SPAIN_REGIONS } from '@/lib/knowledge/constants';
import { isAdmin } from '@/lib/is-admin';

export const dynamic = 'force-dynamic';

const REGION_CODES = SPAIN_REGIONS.map((r) => r.code);

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  category: z.enum(KNOWLEDGE_CATEGORIES).optional(),
  region: z.string().trim().max(10).nullable().optional(),
  content: z.string().trim().min(1).max(8000).optional(),
  tags: z.string().trim().max(500).nullable().optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  sourceUrl: z.string().max(500).nullable().optional(),
  sourceLabel: z.string().trim().max(200).nullable().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const entry = await prisma.knowledgeEntry.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!entry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input', details: parsed.error.format() }, { status: 400 });
  }

  const { region, validFrom, validUntil, sourceUrl, ...rest } = parsed.data;

  const updated = await prisma.knowledgeEntry.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(region !== undefined
        ? { region: region && REGION_CODES.includes(region as typeof REGION_CODES[number]) ? region : null }
        : {}),
      ...(validFrom !== undefined ? { validFrom: validFrom ? new Date(validFrom) : null } : {}),
      ...(validUntil !== undefined ? { validUntil: validUntil ? new Date(validUntil) : null } : {}),
      ...(sourceUrl !== undefined ? { sourceUrl: sourceUrl || null } : {}),
    },
  });

  return NextResponse.json({ ok: true, entry: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth().catch(() => null);
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 });
  }

  const entry = await prisma.knowledgeEntry.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!entry) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Soft delete — deactivate rather than destroy
  await prisma.knowledgeEntry.update({
    where: { id: params.id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
