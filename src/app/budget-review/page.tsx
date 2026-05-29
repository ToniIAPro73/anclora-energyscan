'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BudgetReviewUploader } from '@/components/monetization/BudgetReviewUploader';
import { usePreferences } from '@/components/AppPreferencesProvider';

export default function BudgetReviewPage() {
  const { dictionary: t, selectedLanguage } = usePreferences();
  const demoPdfHref = `/api/budget-review/demo/pdf?lang=${selectedLanguage}`;

  return (
    <div className="min-h-screen app-shell">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28">
        {/* Positioning header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-premium">{t.budgetReviewPageTitle}</h1>
          <p className="mt-4 max-w-3xl text-muted leading-relaxed">{t.budgetReviewPageIntro}</p>

          {/* Differentiation note */}
          <div className="mt-4 rounded-2xl border border-[#FFB020]/20 bg-[#FFB020]/5 p-4">
            <p className="text-xs text-[#FFB020] leading-relaxed">{t.budgetReviewNotIncluded}</p>
          </div>

          {/* Demo CTA — dynamic PDF in the current app language */}
          <div className="mt-4">
            <a
              href={demoPdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2 text-sm text-brand hover:bg-brand/10 transition-colors"
            >
              <span>↗</span>
              {t.budgetReviewDemoLabel}
            </a>
          </div>
        </div>

        {/* Uploader */}
        <div className="mt-8"><BudgetReviewUploader /></div>

        {/* Legal limitation */}
        <p className="mt-6 text-xs text-muted leading-relaxed max-w-3xl">
          {t.budgetReviewLegal}
        </p>
      </main>
      <Footer />
    </div>
  );
}
