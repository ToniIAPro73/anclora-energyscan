import Link from 'next/link';
import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';

export const dynamic = 'force-dynamic';

const copy = {
  es: { title: 'Leads', intro: 'Solicitudes comerciales generadas desde EnergyScan.', service: 'Servicio', user: 'Contacto', zone: 'Zona', status: 'Estado', date: 'Fecha', empty: 'No hay leads registrados.', back: 'Panel admin', roleLabel: 'Administrador' },
  en: { title: 'Leads', intro: 'Commercial requests generated from EnergyScan.', service: 'Service', user: 'Contact', zone: 'Zone', status: 'Status', date: 'Date', empty: 'No leads registered.', back: 'Admin panel', roleLabel: 'Administrator' },
  de: { title: 'Leads', intro: 'Kommerzielle Anfragen aus EnergyScan.', service: 'Leistung', user: 'Kontakt', zone: 'Region', status: 'Status', date: 'Datum', empty: 'Keine Leads vorhanden.', back: 'Admin-Panel', roleLabel: 'Administrator' },
};

export default async function AdminLeadsPage() {
  const session = await auth().catch(() => null);
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const t = copy[language] ?? copy.es;
  const locale = language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'es-ES';
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 100, include: { provider: true } });

  return (
    <div className="min-h-screen app-shell">
      <Navbar mode="app" userEmail={session?.user?.email} userName={session?.user?.name} userImage={session?.user?.image} isAdmin />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-heading font-semibold uppercase tracking-wider text-[#00DC82]">{t.roleLabel}</p>
            <h1 className="mt-2 font-heading text-4xl font-bold text-premium">{t.title}</h1>
            <p className="mt-2 text-sm text-muted">{t.intro}</p>
          </div>
          <Link href="/admin" className="rounded-full border border-white/10 px-4 py-2 text-sm font-heading font-semibold text-premium hover:border-[#00DC82]/40">{t.back}</Link>
        </div>

        <div className="mt-8 grid gap-3">
          {leads.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-muted">{t.empty}</div>
          ) : leads.map((lead) => (
            <article key={lead.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="grid gap-3 md:grid-cols-5">
                <div>
                  <p className="text-xs font-bold uppercase text-muted">{t.service}</p>
                  <p className="mt-1 font-semibold text-premium">{lead.requestedService || lead.provider?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted">{t.user}</p>
                  <p className="mt-1 font-semibold text-premium">{lead.userEmail || lead.clientEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted">{t.zone}</p>
                  <p className="mt-1 font-semibold text-premium">{lead.zone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted">{t.status}</p>
                  <p className="mt-1 font-semibold text-premium">{lead.status}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-muted">{t.date}</p>
                  <p className="mt-1 font-semibold text-premium">{lead.createdAt.toLocaleDateString(locale)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
