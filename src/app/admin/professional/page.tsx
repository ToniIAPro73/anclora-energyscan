import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';
import { ProfessionalStatusChanger } from '@/components/admin/ProfessionalStatusChanger';
import { isAdmin } from '@/lib/is-admin';

export const dynamic = 'force-dynamic';

const statusColors: Record<string, string> = {
  PENDING: 'bg-[#FFB020]/20 text-[#FFB020]',
  APPROVED: 'bg-[#00DC82]/20 text-[#00DC82]',
  REJECTED: 'bg-[#EF4444]/20 text-[#EF4444]',
};

const copy = {
  es: {
    title: 'Solicitudes de Acceso Profesional',
    roleLabel: 'Administrador',
    forbidden: 'Acceso no autorizado',
    forbiddenCopy: 'Solo los administradores pueden acceder a esta sección.',
    noRequests: 'No hay solicitudes registradas.',
    back: 'Volver a métricas',
    navProviders: 'Proveedores',
    navKnowledge: 'Base de conocimiento',
    navOverview: 'Resumen',
    name: 'Nombre',
    email: 'Email',
    company: 'Empresa',
    role: 'Rol',
    message: 'Mensaje',
    date: 'Fecha',
    save: 'Guardar',
    saving: '…',
    saved: '✓ Guardado',
    saveError: 'Error',
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  },
  en: {
    title: 'Professional Access Requests',
    roleLabel: 'Administrator',
    forbidden: 'Unauthorized access',
    forbiddenCopy: 'Only administrators can access this section.',
    noRequests: 'No requests registered.',
    back: 'Back to metrics',
    navProviders: 'Providers',
    navKnowledge: 'Knowledge base',
    navOverview: 'Overview',
    name: 'Name',
    email: 'Email',
    company: 'Company',
    role: 'Role',
    message: 'Message',
    date: 'Date',
    save: 'Save',
    saving: '…',
    saved: '✓ Saved',
    saveError: 'Error',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  },
  de: {
    title: 'Anfragen für professionellen Zugang',
    roleLabel: 'Administrator',
    forbidden: 'Kein Zugriff',
    forbiddenCopy: 'Nur Administratoren können auf diesen Bereich zugreifen.',
    noRequests: 'Keine Anfragen registriert.',
    back: 'Zurück zu Metriken',
    navProviders: 'Anbieter',
    navKnowledge: 'Wissensdatenbank',
    navOverview: 'Übersicht',
    name: 'Name',
    email: 'E-Mail',
    company: 'Unternehmen',
    role: 'Rolle',
    message: 'Nachricht',
    date: 'Datum',
    save: 'Speichern',
    saving: '…',
    saved: '✓ Gespeichert',
    saveError: 'Fehler',
    pending: 'Ausstehend',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt',
  },
};

export default async function AdminProfessionalPage() {
  const session = await auth().catch(() => null);
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const t = copy[language] ?? copy.es;

  if (!isAdmin(session?.user?.email)) {
    return (
      <div className="min-h-screen app-shell">
        <Navbar mode="app" userEmail={session?.user?.email} userName={session?.user?.name} userImage={session?.user?.image} isAdmin />
        <main className="mx-auto max-w-3xl px-4 pb-16 pt-28">
          <h1 className="font-heading text-4xl font-bold text-premium">{t.forbidden}</h1>
          <p className="mt-4 text-muted">{t.forbiddenCopy}</p>
        </main>
      </div>
    );
  }

  const requests = await prisma.professionalAccessRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const locale = language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'es-ES';

  const counts = {
    PENDING: requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    REJECTED: requests.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div className="min-h-screen app-shell">
      <Navbar mode="app" userEmail={session?.user?.email} userName={session?.user?.name} userImage={session?.user?.image} isAdmin />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-heading font-semibold uppercase tracking-wider text-[#00DC82]">{t.roleLabel}</p>
            <h1 className="mt-2 font-heading text-4xl font-bold text-premium">{t.title}</h1>
          </div>
          <div className="flex gap-2">
            <a href="/admin" className="rounded-full border border-white/10 px-4 py-2 text-sm font-heading font-semibold text-premium hover:border-[#00DC82]/40">{t.navOverview}</a>
            <a href="/admin/providers" className="rounded-full border border-white/10 px-4 py-2 text-sm font-heading font-semibold text-premium hover:border-[#00DC82]/40">{t.navProviders}</a>
            <a href="/admin/knowledge" className="rounded-full border border-white/10 px-4 py-2 text-sm font-heading font-semibold text-premium hover:border-[#00DC82]/40">{t.navKnowledge}</a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <span key={s} className={`rounded-full px-3 py-1 ${statusColors[s] ?? 'bg-white/5 text-muted'}`}>
              {s}: {counts[s]}
            </span>
          ))}
        </div>

        {requests.length === 0 ? (
          <p className="mt-8 text-muted">{t.noRequests}</p>
        ) : (
          <div className="mt-8 grid gap-4">
            {requests.map((req) => (
              <article key={req.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <ProfessionalStatusChanger
                        requestId={req.id}
                        currentStatus={req.status}
                        labels={{ save: t.save, saving: t.saving, saved: t.saved, saveError: t.saveError }}
                      />
                      <span className="text-xs text-muted">{req.createdAt.toLocaleDateString(locale)}</span>
                    </div>
                    <h2 className="mt-2 font-heading text-xl font-bold text-premium">{req.name || '—'}</h2>
                    <p className="mt-1 text-sm text-muted">{req.email}</p>
                    {req.company && <p className="text-sm text-muted">{req.company} {req.role ? `· ${req.role}` : ''}</p>}
                    {req.message && (
                      <p className="mt-2 text-sm text-muted italic">&ldquo;{req.message}&rdquo;</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
