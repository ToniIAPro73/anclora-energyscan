'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, CheckCircle2, Home, Gauge, Zap, FileText, Calculator } from 'lucide-react';
import Link from 'next/link';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { getLegalDisclaimer } from '@/lib/i18n';
import { HeroEnergyScale } from '@/components/HeroEnergyScale';

export default function LandingPage() {
  const { dictionary: t, language, currency, measurementSystem, formatCurrency } = usePreferences();
  const timeline = {
    es: [
      { year: 'Hoy', title: 'R.D. 390/2021', desc: 'CEE obligatorio para venta/alquiler.', status: 'Vigente', color: 'bg-[#00DC82]' },
      { year: '2030', title: 'Reducción 16%', desc: 'Meta de ahorro en energía primaria.', status: 'Objetivo UE', color: 'bg-[#FFB020]' },
      { year: '2033', title: 'Clase E', desc: 'Objetivo residencial obligatorio.', status: 'Regulación', color: 'bg-[#EF4444]' },
    ],
    en: [
      { year: 'Today', title: 'R.D. 390/2021', desc: 'EPC required for sale or rental where applicable.', status: 'Current', color: 'bg-[#00DC82]' },
      { year: '2030', title: '16% reduction', desc: 'Primary energy savings target.', status: 'EU target', color: 'bg-[#FFB020]' },
      { year: '2033', title: 'Class E', desc: 'Residential target under regulatory development.', status: 'Regulation', color: 'bg-[#EF4444]' },
    ],
    de: [
      { year: 'Heute', title: 'R.D. 390/2021', desc: 'Energieausweis für Verkauf oder Vermietung, sofern anwendbar.', status: 'Gültig', color: 'bg-[#00DC82]' },
      { year: '2030', title: '16% Reduktion', desc: 'Ziel zur Senkung der Primärenergie.', status: 'EU-Ziel', color: 'bg-[#FFB020]' },
      { year: '2033', title: 'Klasse E', desc: 'Wohngebäudeziel in regulatorischer Entwicklung.', status: 'Regulierung', color: 'bg-[#EF4444]' },
    ],
  }[language];
  const pricingItems = {
    es: {
      free: ['Wizard energético completo', 'Letra orientativa y confianza', 'Penalizaciones y fortalezas', 'Contexto normativo básico'],
      premium: ['Informe PDF Premium', 'Escenarios de mejora', 'Costes orientativos', 'Categorías de proveedores sugeridas'],
    },
    en: {
      free: ['Complete energy wizard', 'Indicative rating and confidence', 'Penalties and strengths', 'Basic regulatory context'],
      premium: ['Premium PDF report', 'Improvement scenarios', 'Indicative costs', 'Suggested provider categories'],
    },
    de: {
      free: ['Vollständiger Energie-Wizard', 'Orientierende Klasse und Sicherheit', 'Abzüge und Stärken', 'Grundlegender regulatorischer Kontext'],
      premium: ['Premium-PDF-Bericht', 'Verbesserungsszenarien', 'Orientierungskosten', 'Vorgeschlagene Anbieterkategorien'],
    },
  }[language];

  return (
    <div className="min-h-screen app-shell overflow-x-hidden">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-[calc(100vh-64px)] flex items-center pt-16 lg:pt-20">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00DC82]/30 bg-[#00DC82]/5 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#00DC82] animate-pulse"></span>
                  <span className="text-xs text-[#00DC82] font-heading font-medium">{t.heroBadge}</span>
                </div>
                <h1 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[3rem] leading-[1.1] text-premium mb-4">
                  {t.heroTitleA}<br />
                  <span className="text-[#00DC82]">{t.heroTitleB}</span> {t.heroTitleC}
                </h1>
                <p className="text-muted text-base sm:text-lg leading-relaxed mb-6 max-w-xl">
                  {t.heroCopy}
                </p>
                {/* Product offerings strip */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/20">
                    <FileText className="w-3 h-3" />
                    {language === 'en' ? 'Premium PDF Report' : language === 'de' ? 'Premium PDF-Bericht' : 'Informe PDF Premium'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB020]/10 text-[#FFB020] border border-[#FFB020]/20">
                    <FileText className="w-3 h-3" />
                    Budget Review
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-muted border border-white/10 border-dashed">
                    {language === 'en' ? 'Full Pack · Soon' : language === 'de' ? 'Komplettpaket · Bald' : 'Pack completo · Próx.'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                  <Link href="/wizard" className="px-6 py-3 rounded-full bg-[#00DC82] text-[#0A0A0A] font-heading font-bold text-sm hover:brightness-110 transition pulse-glow">
                    {t.startFree}
                  </Link>
                  <Link href="/pricing" className="px-6 py-3 rounded-full border border-[#00DC82]/40 text-[#00DC82] font-heading font-bold text-sm hover:bg-[#00DC82]/10 transition">
                    {t.pricingPremiumCta}
                  </Link>
                  <Link href="#como-funciona" className="px-6 py-3 rounded-full border border-white/10 text-muted font-heading font-semibold text-sm hover:text-premium hover:border-white/20 transition">
                    {t.howItWorks}
                  </Link>
                </div>
                <p className="text-[10px] text-muted leading-relaxed max-w-md">
                  {getLegalDisclaimer(language)}
                </p>
              </div>

              {/* ENERGY SCALE INTERACTIVE */}
              <HeroEnergyScale />
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 lg:mt-16">
              {[
                { label: t.statsDeficient, val: '80%', color: 'text-premium' },
                { label: t.statsDate, val: '2030', color: 'text-[#FFB020]' },
                { label: t.statsTarget, val: '2033', color: 'text-[#EF4444]' },
                { label: t.statsSteps, val: '7', color: 'text-[#00DC82]' },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl surface-2 border text-center">
                  <p className={`font-heading font-bold text-xl sm:text-2xl ${s.color}`}>{s.val}</p>
                  <p className="text-[10px] text-muted mt-1 uppercase tracking-wider font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="py-24 sm:py-32 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-xs text-[#00DC82] font-heading font-semibold tracking-wider uppercase mb-3">{t.process}</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-premium mb-4">{t.processTitle}</h2>
              <p className="text-muted max-w-2xl mx-auto">{t.processCopy}</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: t.stepDescribeTitle, desc: t.stepDescribeDesc, icon: Home, step: '01', color: 'text-[#00DC82]' },
                { title: t.stepRatingTitle, desc: t.stepRatingDesc, icon: Gauge, step: '02', color: 'text-[#FFB020]' },
                { title: t.stepImproveTitle, desc: t.stepImproveDesc, icon: Zap, step: '03', color: 'text-[#00DC82]' },
                { title: t.stepPdfTitle, desc: t.stepPdfDesc, icon: FileText, step: '04', color: 'text-[#FFB020]' },
              ].map((s, i) => (
                <div key={i} className="group p-6 rounded-2xl surface-2 border hover:border-[#00DC82]/30 transition">
                  <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition`}>
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-heading font-bold text-xs ${s.color}`}>{s.step}</span>
                    <div className="h-px flex-1 bg-[#262626]"></div>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-premium mb-2">{s.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NORMATIVA PREVIEW */}
        <section id="normativa" className="py-24 sm:py-32 relative surface">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-xs text-[#EF4444] font-heading font-semibold tracking-wider uppercase mb-3">{t.regulatoryContext}</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-premium mb-4">{t.regulatoryTitle}</h2>
              <p className="text-muted max-w-2xl mx-auto">{t.regulatoryCopy}</p>
            </div>
            
            <div className="relative">
              <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00DC82] via-[#FFB020] to-[#EF4444]" />
              <div className="space-y-12">
                {timeline.map((n, i) => (
                  <div key={i} className={`relative flex flex-col sm:flex-row items-start gap-6 sm:gap-0 ${i % 2 === 0 ? '' : 'sm:flex-row-reverse'}`}>
                    <div className={`sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-12 sm:text-right' : 'sm:pl-12'} pl-16`}>
                      <h3 className="font-heading font-bold text-xl text-premium mb-1">{n.year}</h3>
                      <p className="font-semibold text-sm text-premium mb-2">{n.title}</p>
                      <p className="text-sm text-muted">{n.desc}</p>
                    </div>
                    <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 top-1">
                      <div className={`w-3 h-3 rounded-full ${n.color} ring-4 ring-white/5`} />
                    </div>
                    <div className={`sm:w-1/2 ${i % 2 === 0 ? 'sm:pl-12' : 'sm:pr-12 sm:text-right'} pl-16`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">{n.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* USE CASES RESIDENCIALES */}
        <section id="casos-de-uso" className="py-24 sm:py-32 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs text-[#00DC82] font-heading font-semibold tracking-wider uppercase mb-3">{
                language === 'en' ? 'For residential users' : language === 'de' ? 'Für Wohnungsnutzer' : 'Para usuarios residenciales'
              }</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-premium mb-4">{
                language === 'en' ? 'What do you need to review today?' : language === 'de' ? 'Was möchten Sie heute prüfen?' : '¿Qué necesitas revisar hoy?'
              }</h2>
              <p className="text-muted max-w-2xl mx-auto text-sm">
                {language === 'en'
                  ? 'You can analyse your home or review a quote without creating an account.'
                  : language === 'de'
                  ? 'Sie können Ihre Immobilie analysieren oder ein Angebot prüfen, ohne ein Konto zu erstellen.'
                  : 'Puedes analizar tu vivienda o revisar un presupuesto sin crear cuenta.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* CASO 1: Analizar vivienda */}
              <div className="surface-2 border border-[#00DC82]/20 rounded-2xl p-6 sm:p-8 flex flex-col">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#00DC82]/10 text-[#00DC82] self-start">
                  <Home className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-premium mb-2">{
                  language === 'en' ? 'Analyse my home' : language === 'de' ? 'Meine Immobilie analysieren' : 'Analizar mi vivienda'
                }</h3>
                <p className="text-sm text-muted leading-relaxed mb-6 flex-1">{
                  language === 'en'
                    ? 'To understand your home\'s energy situation, prioritise renovations and download a Premium report.'
                    : language === 'de'
                    ? 'Um die energetische Situation Ihrer Immobilie zu verstehen, Sanierungen zu priorisieren und einen Premium-Bericht herunterzuladen.'
                    : 'Para entender la situación energética de tu vivienda, priorizar reformas y descargar un informe Premium.'
                }</p>
                <div className="flex flex-col gap-3">
                  <Link href="/wizard" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#00DC82] px-6 py-3 text-sm font-heading font-bold text-[#0A0A0A] transition hover:brightness-110">
                    {t.startFree} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={`/api/assessment/demo/pdf?lang=${language}&currency=${currency}&units=${measurementSystem}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#00DC82]/30 px-6 py-3 text-sm font-heading font-semibold text-[#00DC82] hover:bg-[#00DC82]/10 transition"
                  >
                    {t.paywallDemoLink}
                  </a>
                </div>
              </div>

              {/* CASO 2: Revisar presupuesto */}
              <div className="surface-2 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFB020]/10 text-[#FFB020] self-start">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-premium mb-2">{
                  language === 'en' ? 'Review a renovation quote' : language === 'de' ? 'Ein Angebot prüfen' : 'Revisar un presupuesto'
                }</h3>
                <p className="text-sm text-muted leading-relaxed mb-6 flex-1">{
                  language === 'en'
                    ? 'To get a second opinion on a renovation quote before accepting it.'
                    : language === 'de'
                    ? 'Um eine zweite Meinung zu einem Sanierungsangebot zu erhalten, bevor Sie es annehmen.'
                    : 'Para obtener una segunda opinión sobre un presupuesto de reforma antes de aceptarlo.'
                }</p>
                <div className="flex flex-col gap-3">
                  <Link href="/budget-review" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FFB020]/40 px-6 py-3 text-sm font-heading font-bold text-[#FFB020] hover:bg-[#FFB020]/10 transition">
                    {language === 'en' ? 'Review my quote' : language === 'de' ? 'Mein Angebot prüfen' : 'Revisar mi presupuesto'} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/budget-review?demo=1"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-heading font-semibold text-muted hover:text-premium hover:border-white/20 transition"
                  >
                    {language === 'en' ? 'View Budget Review demo' : language === 'de' ? 'Budget-Review-Demo ansehen' : 'Ver Budget Review demo'}
                  </Link>
                </div>
              </div>

              {/* CASO 3: Calculadora de ahorro */}
              <div className="surface-2 border border-[#60A5FA]/20 rounded-2xl p-6 sm:p-8 flex flex-col">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#60A5FA]/10 text-[#60A5FA] self-start">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-premium mb-2">{
                  language === 'en' ? 'Savings calculator' : language === 'de' ? 'Einsparpotenzial berechnen' : 'Calcular ahorro potencial'
                }</h3>
                <p className="text-sm text-muted leading-relaxed mb-6 flex-1">{
                  language === 'en'
                    ? 'Simulate a specific improvement measure and compare estimated investment, annual savings and payback period.'
                    : language === 'de'
                    ? 'Simulieren Sie eine konkrete Verbesserungsmaßnahme und vergleichen Sie Investition, Jahresersparnis und Amortisationszeit.'
                    : 'Simula una medida concreta y compara inversión estimada, ahorro anual y plazo de retorno orientativos.'
                }</p>
                <div className="flex flex-col gap-3">
                  <Link href="/calculadora-ahorro" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#60A5FA]/40 px-6 py-3 text-sm font-heading font-bold text-[#60A5FA] hover:bg-[#60A5FA]/10 transition">
                    {language === 'en' ? 'Open calculator' : language === 'de' ? 'Rechner öffnen' : 'Abrir calculadora'} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* NOTA DIFERENCIAL */}
            <div className="rounded-2xl border border-[#FFB020]/20 bg-[#FFB020]/5 p-4 text-center">
              <p className="text-xs text-[#FFB020] leading-relaxed max-w-3xl mx-auto">
                <span className="font-semibold">{language === 'en' ? 'Note:' : language === 'de' ? 'Hinweis:' : 'Nota:'}</span>{' '}
                {language === 'en'
                  ? 'If you upload a quote during the wizard, we use it as context for the energy report. For a line-by-line review, use Budget Review.'
                  : language === 'de'
                  ? 'Wenn Sie während des Wizards ein Angebot hochladen, verwenden wir es als Kontext für den Energiebericht. Für eine positionsweise Prüfung nutzen Sie Budget Review.'
                  : 'Si subes un presupuesto durante el wizard, lo usamos como contexto para el informe energético. Si quieres revisarlo partida por partida, usa Budget Review.'}
              </p>
            </div>
          </div>
        </section>

        {/* PARTNERS */}
        <section id="mejoras" className="py-24 sm:py-32 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-xs text-[#00DC82] font-heading font-semibold tracking-wider uppercase mb-3">{t.partnersBadge}</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-premium mb-4">{t.partnersTitle}</h2>
              <p className="text-muted max-w-3xl leading-relaxed">
                {t.partnersCopy}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: t.providerCee, desc: t.providerCeeDesc, icon: FileText },
                { title: t.providerEnvelope, desc: t.providerEnvelopeDesc, icon: Home },
                { title: t.providerHvac, desc: t.providerHvacDesc, icon: Gauge },
                { title: t.providerSolar, desc: t.providerSolarDesc, icon: Zap },
              ].map((item) => (
                <div key={item.title} className="surface-2 border rounded-2xl p-5">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#00DC82]/10 text-[#00DC82]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-premium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRECIOS */}
        <section id="precios" className="py-24 sm:py-32 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#262626] to-transparent"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-xs text-[#00DC82] font-heading font-semibold tracking-wider uppercase mb-3">{t.navPricing}</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-premium mb-4">{t.pricingTitle}</h2>
              <p className="text-muted max-w-2xl mx-auto">
                {t.pricingCopy}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: t.freePlan,
                  price: formatCurrency(0, { maximumFractionDigits: 0 }),
                  badge: t.freePlanBadge,
                  cta: t.startFree,
                  href: '/wizard',
                  items: pricingItems.free,
                },
                {
                  name: t.premiumPlan,
                  price: t.priceDemo,
                  badge: t.premiumPlanBadge,
                  cta: t.pricingPremiumCta,
                  href: '/wizard',
                  items: pricingItems.premium,
                },
              ].map((plan) => (
                <div key={plan.name} className="surface-2 border rounded-2xl p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-premium">{plan.name}</h3>
                      <p className="mt-2 text-sm text-muted">{plan.badge}</p>
                    </div>
                    <p className="font-heading text-3xl font-bold text-[#00DC82]">{plan.price}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00DC82]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00DC82] px-6 py-3 text-sm font-heading font-bold text-[#0A0A0A] transition hover:brightness-110">
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted leading-relaxed max-w-3xl mx-auto text-center mt-8">
              {getLegalDisclaimer(language)}
            </p>
            <div className="mt-6 text-center">
              <Link href="/pricing" className="text-sm font-heading font-semibold text-[#00DC82] hover:brightness-125">
                {t.navPricing}
              </Link>
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-24 sm:py-32 relative overflow-hidden text-center">
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-premium mb-6">
              {t.finalCtaTitle}<br /><span className="text-[#00DC82]">{t.finalCtaAccent}</span>
            </h2>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
              {t.finalCtaCopy}
            </p>
            <Link href="/wizard" className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[#00DC82] text-[#0A0A0A] font-heading font-bold text-base hover:brightness-110 transition pulse-glow">
              {t.startFree} <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-[11px] text-muted mt-6">
              {getLegalDisclaimer(language)}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
