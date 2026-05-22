import Link from 'next/link';
import { cookies } from 'next/headers';
import { Activity, BarChart3, BriefcaseBusiness, FileText, ShieldCheck, UserRound, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';

export const dynamic = 'force-dynamic';

const REVIEW_TRAY_LIMIT = 5;
const ACTIVITY_LIMIT = 8;

const copy = {
  es: {
    eyebrow: 'Consola administrativa',
    title: 'Panel de administración',
    subtitle: 'Supervisa solicitudes, actividad comercial, proveedores, profesionales y métricas operativas de EnergyScan.',
    role: 'Administrador',
    updated: 'Última actualización',
    pendingProfessionals: 'Profesionales pendientes',
    pendingProviders: 'Proveedores pendientes',
    leads: 'Leads generados',
    assessments: 'Análisis realizados',
    revenue: 'Ingresos estimados',
    reviewTray: 'Solicitudes pendientes de revisión',
    pendingProfessionalsLabel: 'Profesionales',
    pendingProvidersLabel: 'Proveedores',
    viewAllProfessionals: 'Ver todos',
    viewAllProviders: 'Ver todos',
    emptyProfessionals: 'Sin profesionales pendientes.',
    emptyProviders: 'Sin proveedores pendientes.',
    recentActivity: 'Actividad reciente',
    viewAllActivity: 'Ver leads',
    monetization: 'Resumen comercial',
    documentation: 'Documentación',
    documentationCopy: 'Área preparada para gestionar documentación interna, fuentes normativas, catálogos de costes y materiales de soporte para EnergyScan.',
    professional: 'Profesional',
    provider: 'Proveedor',
    premiumReports: 'Informes premium desbloqueados',
    budgetReviews: 'Budget reviews',
    payments: 'Pagos completados',
    providerCredits: 'Créditos proveedor',
    viewDocs: 'Ver documentación',
    moreItems: 'y %n más →',
  },
  en: {
    eyebrow: 'Admin console',
    title: 'Administration dashboard',
    subtitle: 'Monitor requests, commercial activity, providers, professionals and operational metrics for EnergyScan.',
    role: 'Administrator',
    updated: 'Last updated',
    pendingProfessionals: 'Pending professionals',
    pendingProviders: 'Pending providers',
    leads: 'Generated leads',
    assessments: 'Assessments completed',
    revenue: 'Estimated revenue',
    reviewTray: 'Requests pending review',
    pendingProfessionalsLabel: 'Professionals',
    pendingProvidersLabel: 'Providers',
    viewAllProfessionals: 'View all',
    viewAllProviders: 'View all',
    emptyProfessionals: 'No pending professionals.',
    emptyProviders: 'No pending providers.',
    recentActivity: 'Recent activity',
    viewAllActivity: 'View leads',
    monetization: 'Commercial summary',
    documentation: 'Documentation',
    documentationCopy: 'Area prepared to manage internal documentation, regulatory sources, cost catalogs and support material for EnergyScan.',
    professional: 'Professional',
    provider: 'Provider',
    premiumReports: 'Premium reports unlocked',
    budgetReviews: 'Budget reviews',
    payments: 'Completed payments',
    providerCredits: 'Provider credits',
    viewDocs: 'View documentation',
    moreItems: 'and %n more →',
  },
  de: {
    eyebrow: 'Administrationskonsole',
    title: 'Admin-Dashboard',
    subtitle: 'Überwache Anfragen, kommerzielle Aktivität, Anbieter, Fachleute und operative Kennzahlen von EnergyScan.',
    role: 'Administrator',
    updated: 'Letzte Aktualisierung',
    pendingProfessionals: 'Ausstehende Fachleute',
    pendingProviders: 'Ausstehende Anbieter',
    leads: 'Generierte Leads',
    assessments: 'Durchgeführte Analysen',
    revenue: 'Geschätzter Umsatz',
    reviewTray: 'Anfragen zur Prüfung',
    pendingProfessionalsLabel: 'Fachleute',
    pendingProvidersLabel: 'Anbieter',
    viewAllProfessionals: 'Alle anzeigen',
    viewAllProviders: 'Alle anzeigen',
    emptyProfessionals: 'Keine ausstehenden Fachleute.',
    emptyProviders: 'Keine ausstehenden Anbieter.',
    recentActivity: 'Letzte Aktivität',
    viewAllActivity: 'Leads anzeigen',
    monetization: 'Kommerzielle Übersicht',
    documentation: 'Dokumentation',
    documentationCopy: 'Bereich zur Verwaltung interner Dokumentation, regulatorischer Quellen, Kostenkataloge und Supportmaterialien für EnergyScan.',
    professional: 'Fachperson',
    provider: 'Anbieter',
    premiumReports: 'Freigeschaltete Premium-Berichte',
    budgetReviews: 'Budget Reviews',
    payments: 'Abgeschlossene Zahlungen',
    providerCredits: 'Anbieter-Credits',
    viewDocs: 'Dokumentation öffnen',
    moreItems: 'und %n weitere →',
  },
};


function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default async function AdminDashboardPage() {
  const session = await auth().catch(() => null);
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const t = copy[language] ?? copy.es;
  const locale = language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'es-ES';

  const [
    pendingProfessionals,
    pendingProviders,
    allProfessionalsCount,
    allProvidersCount,
    leadCount,
    assessmentCount,
    premiumReports,
    budgetReviews,
    paidBudgetReviews,
    assessmentRevenue,
    budgetRevenue,
    recentLeads,
    recentAssessments,
    recentProfessionals,
    recentProviders,
    creditsAggregate,
  ] = await Promise.all([
    prisma.professionalAccessRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } }),
    prisma.provider.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } }),
    prisma.professionalAccessRequest.count({ where: { status: 'PENDING' } }),
    prisma.provider.count({ where: { status: 'PENDING' } }),
    prisma.lead.count(),
    prisma.assessment.count(),
    prisma.assessment.count({ where: { paidAt: { not: null } } }),
    prisma.budgetReview.count(),
    prisma.budgetReview.count({ where: { paidAt: { not: null } } }),
    prisma.assessment.aggregate({ _sum: { paidAmountCents: true }, where: { paidAt: { not: null } } }),
    prisma.budgetReview.aggregate({ _sum: { paidAmountCents: true }, where: { paidAt: { not: null } } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: ACTIVITY_LIMIT }),
    prisma.assessment.findMany({ orderBy: { createdAt: 'desc' }, take: ACTIVITY_LIMIT }),
    prisma.professionalAccessRequest.findMany({ orderBy: { createdAt: 'desc' }, take: ACTIVITY_LIMIT }),
    prisma.provider.findMany({ orderBy: { createdAt: 'desc' }, take: ACTIVITY_LIMIT }),
    prisma.provider.aggregate({ _sum: { leadCreditsBalance: true } }),
  ]);

  const revenueCents = (assessmentRevenue._sum.paidAmountCents || 0) + (budgetRevenue._sum.paidAmountCents || 0);

  const pendingProfessionalsSlice = pendingProfessionals.slice(0, REVIEW_TRAY_LIMIT);
  const pendingProvidersSlice = pendingProviders.slice(0, REVIEW_TRAY_LIMIT);

  const activity = [
    ...recentProfessionals.map((item) => ({ id: `pro-${item.id}`, label: `${t.professional}: ${item.name || item.email}`, date: item.createdAt })),
    ...recentProviders.map((item) => ({ id: `provider-${item.id}`, label: `${t.provider}: ${item.name}`, date: item.createdAt })),
    ...recentLeads.map((item) => ({ id: `lead-${item.id}`, label: `${t.leads}: ${item.requestedService || item.userEmail || item.zone || item.id}`, date: item.createdAt })),
    ...recentAssessments.map((item) => ({ id: `assessment-${item.id}`, label: `${t.assessments}: ${item.zipcode} · ${item.estimatedLetter}`, date: item.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, ACTIVITY_LIMIT);

  return (
    <div className="min-h-screen app-shell">
      <Navbar mode="app" userEmail={session?.user?.email} userName={session?.user?.name} userImage={session?.user?.image} isAdmin />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28">
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-heading font-semibold uppercase tracking-wider text-[#00DC82]">{t.eyebrow}</p>
              <h1 className="mt-2 font-heading text-4xl font-bold text-premium sm:text-5xl">{t.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{t.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-[#00DC82]/15 px-3 py-2 text-[#00DC82]">{t.role}</span>
              <span className="rounded-full border border-white/10 px-3 py-2 text-muted">{t.updated}: {new Date().toLocaleString(locale)}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: t.pendingProfessionals, value: allProfessionalsCount, Icon: UserRound, href: '/admin/professional' },
            { label: t.pendingProviders, value: allProvidersCount, Icon: BriefcaseBusiness, href: '/admin/providers' },
            { label: t.leads, value: leadCount, Icon: Users, href: '/admin/leads' },
            { label: t.assessments, value: assessmentCount, Icon: BarChart3, href: '/admin/kpis' },
            { label: t.revenue, value: money(revenueCents, locale), Icon: ShieldCheck, href: '/admin/kpis' },
          ].map(({ label, value, Icon, href }) => (
            <Link key={label} href={href} className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[#00DC82]/30">
              <Icon className="h-5 w-5 text-[#00DC82]" />
              <p className="mt-4 font-heading text-3xl font-bold text-premium">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase text-muted">{label}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="font-heading text-2xl font-bold text-premium">{t.reviewTray}</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {/* Profesionales pendientes */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-[#00DC82]" />
                  <span className="text-sm font-bold text-premium">{t.pendingProfessionalsLabel}</span>
                  <span className="rounded-full bg-[#00DC82]/15 px-2 py-0.5 text-xs font-bold text-[#00DC82]">{allProfessionalsCount}</span>
                </div>
                {allProfessionalsCount > 0 && (
                  <Link href="/admin/professional" className="text-xs font-bold text-[#00DC82]">{t.viewAllProfessionals} →</Link>
                )}
              </div>
              {pendingProfessionals.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-muted">{t.emptyProfessionals}</p>
              ) : (
                <div className="space-y-2">
                  {pendingProfessionalsSlice.map((item) => (
                    <Link key={item.id} href="/admin/professional" className="flex items-start justify-between gap-2 rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-[#00DC82]/30">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-premium">{item.name || item.email}</p>
                        <p className="truncate text-xs text-muted">{item.email}</p>
                        {item.company && <p className="text-xs text-muted">{item.company}</p>}
                      </div>
                      <span className="shrink-0 text-xs text-muted">{item.createdAt.toLocaleDateString(locale)}</span>
                    </Link>
                  ))}
                  {allProfessionalsCount > REVIEW_TRAY_LIMIT && (
                    <Link href="/admin/professional" className="block rounded-2xl border border-white/5 bg-black/5 px-4 py-3 text-center text-xs font-bold text-[#00DC82]">
                      {t.moreItems.replace('%n', String(allProfessionalsCount - REVIEW_TRAY_LIMIT))}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Proveedores pendientes */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-[#00DC82]" />
                  <span className="text-sm font-bold text-premium">{t.pendingProvidersLabel}</span>
                  <span className="rounded-full bg-[#00DC82]/15 px-2 py-0.5 text-xs font-bold text-[#00DC82]">{allProvidersCount}</span>
                </div>
                {allProvidersCount > 0 && (
                  <Link href="/admin/providers" className="text-xs font-bold text-[#00DC82]">{t.viewAllProviders} →</Link>
                )}
              </div>
              {pendingProviders.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-muted">{t.emptyProviders}</p>
              ) : (
                <div className="space-y-2">
                  {pendingProvidersSlice.map((item) => (
                    <Link key={item.id} href="/admin/providers" className="flex items-start justify-between gap-2 rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-[#00DC82]/30">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-premium">{item.name}</p>
                        {item.email && <p className="truncate text-xs text-muted">{item.email}</p>}
                        {item.legalName && <p className="text-xs text-muted">{item.legalName}</p>}
                      </div>
                      <span className="shrink-0 text-xs text-muted">{item.createdAt.toLocaleDateString(locale)}</span>
                    </Link>
                  ))}
                  {allProvidersCount > REVIEW_TRAY_LIMIT && (
                    <Link href="/admin/providers" className="block rounded-2xl border border-white/5 bg-black/5 px-4 py-3 text-center text-xs font-bold text-[#00DC82]">
                      {t.moreItems.replace('%n', String(allProvidersCount - REVIEW_TRAY_LIMIT))}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#00DC82]" />
                <h2 className="font-heading text-2xl font-bold text-premium">{t.recentActivity}</h2>
              </div>
              <Link href="/admin/leads" className="text-xs font-bold text-[#00DC82]">{t.viewAllActivity} →</Link>
            </div>
            <div className="mt-5 space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <p className="font-semibold text-premium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted">{item.date.toLocaleString(locale)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h2 className="font-heading text-2xl font-bold text-premium">{t.monetization}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  [t.premiumReports, premiumReports],
                  [t.budgetReviews, budgetReviews],
                  [t.payments, premiumReports + paidBudgetReviews],
                  [t.providerCredits, creditsAggregate._sum.leadCreditsBalance ?? 0],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-xs font-bold uppercase text-muted">{label}</p>
                    <p className="mt-2 font-heading text-2xl font-bold text-premium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-[#00DC82]/20 bg-[#00DC82]/5 p-5">
              <FileText className="h-6 w-6 text-[#00DC82]" />
              <h2 className="mt-3 font-heading text-2xl font-bold text-premium">{t.documentation}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{t.documentationCopy}</p>
              <Link href="/admin/documentation" className="mt-5 inline-flex rounded-full bg-[#00DC82] px-5 py-3 font-heading font-bold text-[#07140f]">{t.viewDocs}</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
