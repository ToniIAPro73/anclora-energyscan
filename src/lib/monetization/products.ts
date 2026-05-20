// ─── Residential product catalogue ────────────────────────────────────────────
// All prices driven by env vars — do NOT hardcode prices in components.

export const PRODUCTS = {
  free_diagnostic: {
    price: 0,
    stripePrice: null as null,
  },
  premium_pdf: {
    launchPrice: parseFloat(process.env.NEXT_PUBLIC_PREMIUM_PRICE_EUR || '9.90'),
    standardPrice: parseFloat(process.env.NEXT_PUBLIC_PREMIUM_STANDARD_PRICE_EUR || '14.90'),
    stripePrice: process.env.STRIPE_PRICE_PREMIUM || null,
  },
  budget_review: {
    launchPrice: parseFloat(process.env.NEXT_PUBLIC_BUDGET_REVIEW_PRICE_EUR || '14.90'),
    standardPrice: parseFloat(process.env.NEXT_PUBLIC_BUDGET_REVIEW_STANDARD_PRICE_EUR || '19.90'),
    stripePrice: process.env.STRIPE_PRICE_BUDGET_REVIEW || null,
  },
  residential_bundle: {
    launchPrice: parseFloat(process.env.NEXT_PUBLIC_RESIDENTIAL_BUNDLE_LAUNCH_PRICE_EUR || '19.90'),
    standardPrice: parseFloat(process.env.NEXT_PUBLIC_RESIDENTIAL_BUNDLE_PRICE_EUR || '29.90'),
    stripePrice: process.env.STRIPE_PRICE_RESIDENTIAL_BUNDLE || null,
    comingSoon: !process.env.STRIPE_PRICE_RESIDENTIAL_BUNDLE,
  },
} as const;

// ─── Legacy exports (kept for backwards compatibility) ────────────────────────

/** @deprecated Use PRODUCTS.budget_review.standardPrice instead */
export const BUDGET_REVIEW_PRICE_CENTS = Math.round(
  parseFloat(process.env.NEXT_PUBLIC_BUDGET_REVIEW_PRICE_EUR || '14.90') * 100,
);

export const PROVIDER_LEAD_PACK_PRICE_CENTS = Math.round(
  Number(process.env.NEXT_PUBLIC_PROVIDER_LEAD_PACK_PRICE_EUR || '300') * 100,
);
export const PROVIDER_LEAD_PACK_CREDITS = Number(process.env.PROVIDER_LEAD_PACK_CREDITS || '10');

// ─── Product type ─────────────────────────────────────────────────────────────

export type MonetizationProductType =
  | 'premium_report'
  | 'budget_review'
  | 'residential_bundle'
  | 'provider_lead_pack';

// ─── Separation contract ──────────────────────────────────────────────────────

/**
 * Returns true if the product includes a full property energy diagnosis.
 * Budget Review does NOT include a property diagnosis.
 */
export function includesPropertyDiagnosis(product: keyof typeof PRODUCTS): boolean {
  return product === 'premium_pdf' || product === 'residential_bundle';
}

/**
 * Returns true if the product includes a line-by-line budget review.
 * PDF Premium does NOT include a line-by-line budget review.
 */
export function includesBudgetReview(product: keyof typeof PRODUCTS): boolean {
  return product === 'budget_review' || product === 'residential_bundle';
}

// ─── Legal notice ─────────────────────────────────────────────────────────────

export function getProductLegalNotice(language: 'es' | 'en' | 'de' = 'es') {
  if (language === 'en') {
    return 'Indicative estimate based on declared data or supplied documents. It does not replace the official Energy Performance Certificate or a qualified technical review.';
  }
  if (language === 'de') {
    return 'Orientierende Schätzung auf Basis angegebener Daten oder bereitgestellter Dokumente. Sie ersetzt weder den offiziellen Energieausweis noch eine qualifizierte technische Prüfung.';
  }
  return 'Estimación orientativa basada en datos declarados o documentos aportados. No sustituye al Certificado de Eficiencia Energética oficial ni a la revisión de un técnico cualificado.';
}
