import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';

function getStripeId(value: string | { id: string } | null) {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value.id;
}

export async function confirmBudgetReviewCheckoutFromSession(input: { reviewId: string; stripeSessionId?: string | null }) {
  if (!input.stripeSessionId) return;

  const session = await getStripeClient().checkout.sessions.retrieve(input.stripeSessionId);
  if (session.metadata?.productType !== 'budget_review') return;
  if (session.metadata?.budgetReviewId !== input.reviewId) return;
  if (session.payment_status !== 'paid' && session.status !== 'complete') return;

  await prisma.budgetReview.updateMany({
    where: { id: input.reviewId, paidAt: null },
    data: {
      paidAt: new Date(),
      status: 'PAID',
      stripeSessionId: session.id,
      stripePaymentIntent: getStripeId(session.payment_intent),
      paidAmountCents: session.amount_total || undefined,
      paidCurrency: session.currency || undefined,
    },
  });
}
