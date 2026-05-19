import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request): Promise<NextResponse> {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { name?: string };
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : undefined;

  if (name === undefined) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name || null },
    select: { id: true, name: true, image: true },
  });

  return NextResponse.json(updated);
}
