import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BudgetReviewUploader } from '@/components/monetization/BudgetReviewUploader';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';
import { lightAuth as auth } from '@/auth.config';

export const metadata = {
  title: 'Segunda opinión de presupuesto de reforma | Anclora EnergyScan',
  description: 'Análisis automático orientativo de presupuestos de reforma antes de aceptar. Accesible sin cuenta.',
};

export default async function BudgetReviewPage() {
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const session = await auth().catch(() => null);

  const positioningTitle = language === 'en'
    ? 'Second opinion on your renovation quote'
    : language === 'de'
    ? 'Zweite Meinung zu Ihrem Sanierungsangebot'
    : 'Segunda opinión sobre tu presupuesto de reforma';

  const positioningIntro = language === 'en'
    ? 'Upload or paste a renovation quote and get an indicative review of line items, amounts and possible alerts before accepting it. You can use this service without completing the energy wizard.'
    : language === 'de'
    ? 'Laden Sie ein Sanierungsangebot hoch oder fügen Sie es ein und erhalten Sie eine orientierende Prüfung von Positionen, Beträgen und möglichen Hinweisen. Sie können diesen Service nutzen, ohne den Energie-Wizard abgeschlossen zu haben.'
    : 'Sube o pega un presupuesto de reforma y obtén una revisión orientativa de partidas, importes y posibles alertas antes de aceptarlo. Puedes usarlo sin haber completado el wizard energético.';

  const notIncludedNote = language === 'en'
    ? 'Budget Review is not included in the residential Premium PDF. It is an independent review of the quote. For a full home energy diagnosis, use the wizard.'
    : language === 'de'
    ? 'Budget Review ist nicht im Premium-PDF für Wohngebäude enthalten. Es ist eine unabhängige Prüfung des Angebots. Für eine vollständige Energieanalyse nutzen Sie den Wizard.'
    : 'Budget Review no está incluido en el PDF Premium residencial. Es una revisión independiente del presupuesto. Para un diagnóstico completo de la vivienda, usa el wizard.';

  const demoLabel = language === 'en'
    ? 'See a sample report'
    : language === 'de'
    ? 'Beispielbericht ansehen'
    : 'Ver informe de ejemplo';

  const legalLimitation = language === 'en'
    ? 'Budget Review does not replace a technical, contractual, legal or in-person review. It does not validate real site measurements.'
    : language === 'de'
    ? 'Budget Review ersetzt keine technische, vertragliche, rechtliche oder persönliche Prüfung. Es validiert keine realen Aufmaße.'
    : 'Budget Review no sustituye una revisión técnica, contractual, legal ni una medición real de obra.';

  return (
    <div className="min-h-screen app-shell">
      {session?.user ? (
        <Navbar
          mode="app"
          userEmail={session.user.email}
          userName={session.user.name}
          userImage={session.user.image}
        />
      ) : (
        <Navbar />
      )}
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28">
        {/* Positioning header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-premium">{positioningTitle}</h1>
          <p className="mt-4 max-w-3xl text-muted leading-relaxed">{positioningIntro}</p>

          {/* Differentiation note */}
          <div className="mt-4 rounded-2xl border border-[#FFB020]/20 bg-[#FFB020]/5 p-4">
            <p className="text-xs text-[#FFB020] leading-relaxed">{notIncludedNote}</p>
          </div>

          {/* Demo CTA */}
          <div className="mt-4">
            <a
              href="/demo-assets/budget-review-demo.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2 text-sm text-brand hover:bg-brand/10 transition-colors"
            >
              <span>↗</span>
              {demoLabel}
            </a>
          </div>
        </div>

        {/* Uploader */}
        <div className="mt-8"><BudgetReviewUploader /></div>

        {/* Legal limitation */}
        <p className="mt-6 text-xs text-muted leading-relaxed max-w-3xl">
          {legalLimitation}
        </p>
      </main>
      <Footer />
    </div>
  );
}
