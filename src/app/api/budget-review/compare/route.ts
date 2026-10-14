import { NextResponse } from 'next/server';
import { z } from 'zod';
import { compareBudgetLineItems } from '@/lib/budget-review/comparison';
import { parseBudgetLineItems } from '@/lib/ocr/budget-parser';

export const dynamic = 'force-dynamic';

const schema = z.object({
  leftText: z.string().trim().min(20).max(80_000),
  rightText: z.string().trim().min(20).max(80_000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'comparison_input_invalid' }, { status: 400 });
  }

  const result = compareBudgetLineItems(
    parseBudgetLineItems(parsed.data.leftText),
    parseBudgetLineItems(parsed.data.rightText),
  );
  return NextResponse.json({ ok: true, result }, { headers: { 'Cache-Control': 'no-store' } });
}
