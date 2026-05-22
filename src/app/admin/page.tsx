import Link from 'next/link';
import { cookies } from 'next/headers';
import { Activity, BarChart3, BriefcaseBusiness, ClipboardList, FileText, ShieldCheck, UserRound, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';

export const dynamic = 'force-dynamic';

const copy = {
  es: {
    eyebrow: 'Consola administrativa',
    title: 'Panel de administración',
    subtitle: 'Supervisa solicitudes, actividad comercial, proveedores, profesionales y métricas operativas de EnergyScan.',
    role: 'Administrador',
    updated: 'Última actualización',
    pendingRequests: 'Solicitudes pendientes',
    pendingProfessionals: 'Profesionales pendientes',
    pendingProviders: 'Proveedores pendientes',
    leads: 'Leads generados',
    assessments: 'Análisis realizados',
    revenue: 'Ingresos estimados',
    reviewTray: 'Solicitudes pendientes de revisión',
    recentActivity: 'Actividad reciente',
    monetization: 'Resumen comercial',
    documentation: 'Documentación',
    documentationCopy: 'Área preparada para gestionar documentación interna, fuentes normativas, catálogos de costes y materiales de soporte para EnergyScan.',
    type: 'Tipo',
    name: 'Nombre',
    professional: 'Profesional',
    provider: 'Proveedor',
    company: 'Empresa',
    category: 'Categoría',
    zone: 'Zona',
    date: 'Fecha',
    status: 'Estado',
    review: 'Revisar',
    empty: 'No hay elementos pendientes.',
    premiumReports: 'Informes premium desbloqueados',
    budgetReviews: 'Budget reviews',
    payments: 'Pagos completados',
    providerCredits: 'Créditos proveedor',
    viewDocs: 'Ver documentación',
  },
  en: {
    eyebrow: 'Admin console',
    title: 'Administration dashboard',
    subtitle: 'Monitor requests, commercial activity, providers, professionals and operational metrics for EnergyScan.',
    role: 'Administrator',
    updated: 'Last updated',
    pendingRequests: 'Pending requests',
    pendingProfessionals: 'Pending professionals',
    pendingProviders: 'Pending providers',
    leads: 'Generated leads',
    assessments: 'Assessments completed',
    revenue: 'Estimated revenue',
    reviewTray: 'Requests pending review',
    recentActivity: 'Recent activity',
    monetization: 'Commercial summary',
    documentation: 'Documentation',
    documentationCopy: 'Area prepared to manage internal documentation, regulatory sources, cost catalogs and support material for EnergyScan.',
    type: 'Type',
    name: 'Name',
    professional: 'Professional',
    provider: 'Provider',
    company: 'Company',
    category: 'Category',
    zone: 'Zone',
    date: 'Date',
    status: 'Status',
    review: 'Review',
    empty: 'No pending items.',
    premiumReports: 'Premium reports unlocked',
    budgetReviews: 'Budget reviews',
    payments: 'Completed payments',
    providerCredits: 'Provider credits',
    viewDocs: 'View documentation',
  },
  de: {
    eyebrow: 'Administrationskonsole',
    title: 'Admin-Dashboard',
    subtitle: 'Überwache Anfragen, kommerzielle Aktivität, Anbieter, Fachleute und operative Kennzahlen von EnergyScan.',
    role: 'Administrator',
    updated: 'Letzte Aktualisierung',
    pendingRequests: 'Ausstehende Anfragen',
    pendingProfessionals: 'Ausstehende Fachleute',
    pendingProviders: 'Ausstehende Anbieter',
    leads: 'Generierte Leads',
    assessments: 'Durchgeführte Analysen',
    revenue: 'Geschätzter Umsatz',
    reviewTray: 'Anfragen zur Prüfung',
    recentActivity: 'Letzte Aktivität',
    monetization: 'Kommerzielle Übersicht',
    documentation: 'Dokumentation',
    documentationCopy: 'Bereich zur Verwaltung interner Dokumentation, regulatorischer Quellen, Kostenkataloge und Supportmaterialien für EnergyScan.',
    type: 'Typ',
    name: 'Name',
    professional: 'Fachperson',
    provider: 'Anbieter',
    company: 'Unternehmen',
    category: 'Kategorie',
    zone: 'Region',
    date: 'Datum',
    status: 'Status',
    review: 'Prüfen',
    empty: 'Keine ausstehenden Einträge.',
    premiumReports: 'Freigeschaltete Premium-Berichte',
    budgetReviews: 'Budget Reviews',
    payments: 'Abgeschlossene Zahlungen',
    providerCredits: 'Anbieter-Credits',
    viewDocs: 'Dokumentation öffnen',
  },
};

function parseList(value?: string | null) {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
  } catch {
    return value;
  }
}

function money(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default async function AdminDashboardPage() {
  const session = await auth().catch(() => null);
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const t = copy[language] ?? copy.es;
  const locale = language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'es-ES';

  const [
    professionalRequests,
    providers,
    leadCount,
    assessmentCount,
    premiumReports,
    budgetReviews,
    paidBudgetReviews,
    assessmentRevenue,
    budgetRevenue,
    recentLeads,
    recentAssessments,
  ] = await Promise.all([
    prisma.professionalAccessRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.provider.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.lead.count(),
    prisma.assessment.count(),
    prisma.assessment.count({ where: { paidAt: { not: null } } }),
    prisma.budgetReview.count(),
    prisma.budgetReview.count({ where: { paidAt: { not: null } } }),
    prisma.assessment.aggregate({ _sum: { paidAmountCents: true }, where: { paidAt: { not: null } } }),
    prisma.budgetReview.aggregate({ _sum: { paidAmountCents: true }, where: { paidAt: { not: null } } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.assessment.findMany({ orderBy: { createdAt: 'desc' }, take: 4 }),
  ]);

  const pendingProfessionals = professionalRequests.filter((item) => item.status === 'PENDING');
  const pendingProviders = providers.filter((item) => item.status === 'PENDING');
  const revenueCents = (assessmentRevenue._sum.paidAmountCents || 0) + (budgetRevenue._sum.paidAmountCents || 0);
  const pendingRows = [
    ...pendingProfessionals.map((item) => ({
      id: item.id,
      href: '/admin/professionals',
      type: t.professional,
      name: item.name || item.email,
      email: item.email,
      company: item.company || '',
      category: item.role || '',
      zone: '',
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...pendingProviders.map((item) => ({
      id: item.id,
      href: '/admin/providers',
      type: t.provider,
      name: item.name,
      email: item.email || '',
      company: item.legalName || '',
      category: parseList(item.categories),
      zone: parseList(item.zones),
      status: item.status,
      createdAt: item.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const activity = [
    ...professionalRequests.slice(0, 4).map((item) => ({ id: `pro-${item.id}`, label: `${t.professional}: ${item.name || item.email}`, date: item.createdAt })),
    ...providers.slice(0, 4).map((item) => ({ id: `provider-${item.id}`, label: `${t.provider}: ${item.name}`, date: item.createdAt })),
    ...recentLeads.map((item) => ({ id: `lead-${item.id}`, label: `${t.leads}: ${item.requestedService || item.userEmail || item.zone || item.id}`, date: item.createdAt })),
    ...recentAssessments.map((item) => ({ id: `assessment-${item.id}`, label: `${t.assessments}: ${item.zipcode} · ${item.estimatedLetter}`, date: item.createdAt })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8);

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

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { label: t.pendingRequests, value: pendingRows.length, Icon: ClipboardList },
            { label: t.pendingProfessionals, value: pendingProfessionals.length, Icon: UserRound },
            { label: t.pendingProviders, value: pendingProviders.length, Icon: BriefcaseBusiness },
            { label: t.leads, value: leadCount, Icon: Users },
            { label: t.assessments, value: assessmentCount, Icon: BarChart3 },
            { label: t.revenue, value: money(revenueCents, locale), Icon: ShieldCheck },
          ].map(({ label, value, Icon }) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Icon className="h-5 w-5 text-[#00DC82]" />
              <p className="mt-4 font-heading text-3xl font-bold text-premium">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase text-muted">{label}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-2xl font-bold text-premium">{t.reviewTray}</h2>
            <Link href="/admin/requests" className="text-sm font-bold text-[#00DC82]">{t.review}</Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            {pendingRows.length === 0 ? (
              <p className="text-sm text-muted">{t.empty}</p>
            ) : (
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-muted">
                  <tr>
                    <th className="py-3 pr-4">{t.type}</th>
                    <th className="py-3 pr-4">{t.name}</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">{t.company}</th>
                    <th className="py-3 pr-4">{t.category}</th>
                    <th className="py-3 pr-4">{t.zone}</th>
                    <th className="py-3 pr-4">{t.date}</th>
                    <th className="py-3 pr-4">{t.status}</th>
                    <th className="py-3 pr-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {pendingRows.map((row) => (
                    <tr key={`${row.type}-${row.id}`} className="text-muted">
                      <td className="py-3 pr-4 font-bold text-[#00DC82]">{row.type}</td>
                      <td className="py-3 pr-4 font-semibold text-premium">{row.name}</td>
                      <td className="py-3 pr-4">{row.email}</td>
                      <td className="py-3 pr-4">{row.company || '-'}</td>
                      <td className="py-3 pr-4">{row.category || '-'}</td>
                      <td className="py-3 pr-4">{row.zone || '-'}</td>
                      <td className="py-3 pr-4">{row.createdAt.toLocaleDateString(locale)}</td>
                      <td className="py-3 pr-4">{row.status}</td>
                      <td className="py-3 pr-4"><Link href={row.href} className="font-bold text-[#00DC82]">{t.review}</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#00DC82]" />
              <h2 className="font-heading text-2xl font-bold text-premium">{t.recentActivity}</h2>
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
                  [t.providerCredits, providers.reduce((sum, provider) => sum + provider.leadCreditsBalance, 0)],
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
