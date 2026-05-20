'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PricingCard } from '@/components/PricingCard';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { getLegalDisclaimer } from '@/lib/i18n';
import { PRODUCTS } from '@/lib/monetization/products';

function formatPrice(eur: number, language: string): string {
  const formatted = eur.toFixed(2).replace('.', language === 'de' ? ',' : language === 'en' ? '.' : ',');
  return language === 'en' ? `€${formatted}` : `${formatted} €`;
}

export default function PricingPage() {
  const { dictionary: t, language } = usePreferences();
  const { data: session } = useSession();

  const premiumLaunchPrice = formatPrice(PRODUCTS.premium_pdf.launchPrice, language);
  const premiumStdPrice = formatPrice(PRODUCTS.premium_pdf.standardPrice, language);
  const budgetReviewLaunchPrice = formatPrice(PRODUCTS.budget_review.launchPrice, language);
  const budgetReviewStdPrice = formatPrice(PRODUCTS.budget_review.standardPrice, language);
  const bundleLaunchPrice = formatPrice(PRODUCTS.residential_bundle.launchPrice, language);
  const bundleStdPrice = formatPrice(PRODUCTS.residential_bundle.standardPrice, language);
  const bundleComingSoon = PRODUCTS.residential_bundle.comingSoon;

  const labelLaunch = language === 'en' ? 'Launch price' : language === 'de' ? 'Einführungspreis' : 'Precio lanzamiento';
  const labelStd = language === 'en' ? 'standard' : language === 'de' ? 'Standard' : 'estándar';
  const labelComingSoon = language === 'en' ? 'Coming soon' : language === 'de' ? 'Demnächst' : 'Próximamente';
  const labelNotIncluded = language === 'en' ? 'Not included' : language === 'de' ? 'Nicht enthalten' : 'No incluye';

  const budgetReviewFeatures = language === 'en'
    ? [
        'Line item detection',
        'Total amount detected',
        'Extraction confidence',
        '2–3 general alerts',
        'Suggested questions before accepting',
        'Downloadable PDF report',
        `${labelNotIncluded}: full home energy diagnosis`,
      ]
    : language === 'de'
    ? [
        'Positionserkennung',
        'Erkannter Gesamtbetrag',
        'Extraktionskonfidenz',
        '2–3 allgemeine Hinweise',
        'Empfohlene Fragen vor Annahme',
        'Herunterladbarer PDF-Bericht',
        `${labelNotIncluded}: vollständige Energieanalyse`,
      ]
    : [
        'Detección de partidas',
        'Total detectado',
        'Confianza de extracción',
        '2–3 alertas generales',
        'Preguntas sugeridas antes de aceptar',
        'Informe PDF descargable',
        `${labelNotIncluded}: diagnóstico completo de vivienda`,
      ];

  const bundleFeatures = language === 'en'
    ? ['Everything in Premium PDF', 'Everything in Budget Review', 'One payment, two products']
    : language === 'de'
    ? ['Alles aus Premium-PDF', 'Alles aus Budget Review', 'Eine Zahlung, zwei Produkte']
    : ['Todo lo del PDF Premium', 'Todo lo del Budget Review', 'Un pago, dos productos'];

  const budgetReviewCtaText = language === 'en'
    ? `Start Budget Review · ${budgetReviewLaunchPrice}`
    : language === 'de'
    ? `Budget Review starten · ${budgetReviewLaunchPrice}`
    : `Revisar presupuesto · ${budgetReviewLaunchPrice}`;

  return (
    <div className="min-h-screen app-shell">
      {session?.user ? (
        <Navbar
          mode="app"
          userEmail={session.user.email}
          userName={session.user.name}
          userImage={session.user.image as string | null}
        />
      ) : (
        <Navbar />
      )}
      <main className="px-4 pb-16 pt-28">
        <section className="mx-auto max-w-6xl space-y-10">
          <div className="text-center">
            <p className="text-xs font-heading font-semibold uppercase tracking-wider text-[#00DC82]">{t.navPricing}</p>
            <h1 className="mt-3 font-heading text-4xl font-bold text-premium">{t.pricingTitle}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted">{t.pricingSubtitle}</p>
          </div>

          {/* 4 pricing columns */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Free diagnostic */}
            <PricingCard
              title={t.pricingFreeTitle}
              price={t.pricingFreePrice}
              subtitle={t.freePlanBadge}
              features={[...t.pricingFreeFeatures]}
              cta={t.startFree}
              href="/wizard"
            />

            {/* 2. PDF Premium residencial */}
            <PricingCard
              title={t.pricingPremiumTitle}
              price={premiumLaunchPrice}
              subtitle={`${labelLaunch} · ${premiumStdPrice} ${labelStd}`}
              features={[...t.pricingPremiumFeatures]}
              cta={t.pricingPremiumCta}
              href="/wizard"
              highlighted
            />

            {/* 3. Budget Review */}
            <PricingCard
              title={
                language === 'en' ? 'Budget Review Premium'
                  : language === 'de' ? 'Budget Review Premium'
                  : 'Budget Review Premium'
              }
              price={budgetReviewLaunchPrice}
              subtitle={`${labelLaunch} · ${budgetReviewStdPrice} ${labelStd}`}
              features={budgetReviewFeatures}
              cta={budgetReviewCtaText}
              href="/budget-review"
            />

            {/* 4. Pack Reforma Inteligente */}
            <PricingCard
              title={
                language === 'en' ? 'Smart Renovation Pack'
                  : language === 'de' ? 'Smart-Sanierungspaket'
                  : 'Pack Reforma Inteligente'
              }
              price={bundleComingSoon ? labelComingSoon : bundleLaunchPrice}
              subtitle={bundleComingSoon
                ? (language === 'en' ? 'PDF Premium + Budget Review' : language === 'de' ? 'Premium-PDF + Budget Review' : 'PDF Premium + Budget Review')
                : `${labelLaunch} · ${bundleStdPrice} ${labelStd}`
              }
              features={bundleFeatures}
              cta={labelComingSoon}
            />
          </div>

          {/* Separation note */}
          <div className="rounded-2xl border border-[#FFB020]/20 bg-[#FFB020]/5 p-4 text-center">
            <p className="text-xs text-[#FFB020] leading-relaxed max-w-3xl mx-auto">
              {language === 'en'
                ? 'Budget Review is not included in the Premium PDF. It is an independent second opinion on a specific renovation quote. The Premium PDF can use an uploaded quote as context, but does not review it line by line.'
                : language === 'de'
                ? 'Budget Review ist nicht im Premium-PDF enthalten. Es ist eine unabhängige zweite Meinung zu einem konkreten Sanierungsangebot. Das Premium-PDF kann ein hochgeladenes Angebot als Kontext nutzen, prüft es aber nicht positionsweise.'
                : 'Budget Review no está incluido en el PDF Premium. Es una segunda opinión independiente sobre un presupuesto concreto. El PDF Premium puede usar un presupuesto adjunto como contexto, pero no lo revisa partida por partida.'}
            </p>
          </div>

          <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-muted">
            {getLegalDisclaimer(language)}
          </p>

          <p className="text-center text-xs text-muted">
            {language === 'en'
              ? 'You can start without an account. An account is recommended to save your history.'
              : language === 'de'
              ? 'Sie können ohne Konto starten. Ein Konto ist empfehlenswert, um den Verlauf zu speichern.'
              : 'Puedes empezar sin cuenta. La cuenta es recomendable para guardar historial.'}{' '}
            <Link href="/wizard" className="text-[#00DC82] underline underline-offset-2 hover:brightness-125">{t.startFree}</Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
