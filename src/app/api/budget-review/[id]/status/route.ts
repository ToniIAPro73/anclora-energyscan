import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { confirmBudgetReviewCheckoutFromSession } from '@/lib/budget-review/payment-status';
import { logSafeError } from '@/lib/safe-logger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  await confirmBudgetReviewCheckoutFromSession({
    reviewId: params.id,
    stripeSessionId: url.searchParams.get('session_id'),
  }).catch(() => {
    logSafeError('budget_review_failed');
  });

  const review = await prisma.budgetReview.findUnique({
    where: { id: params.id },
    select: { id: true, status: true, paidAt: true },
  });
  if (!review) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ id: review.id, status: review.status, paid: Boolean(review.paidAt) });
}
