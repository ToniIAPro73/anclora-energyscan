import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AccountSettingsPanel } from '@/components/AccountSettingsPanel';
import { SettingsActions } from '@/components/SettingsActions';
import { SettingsFootnote } from '@/components/SettingsFootnote';
import { SettingsHeader, SettingsBackLink } from '@/components/SettingsHeader';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/is-admin';

export default async function SettingsPage() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen app-shell">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 pt-28">
          <div className="surface rounded-3xl border p-6">
            <h1 className="font-heading text-3xl font-bold text-premium">Configuración</h1>
            <p className="mt-3 text-muted">Inicia sesión para gestionar tus preferencias de EnergyScan.</p>
            <Link href="/auth" className="mt-6 inline-flex rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]">Entrar</Link>
          </div>
        </main>
      </div>
    );
  }

  const [providerAccount, professionalRequest] = await Promise.all([
    prisma.providerAccount.findUnique({ where: { userId: session.user.id }, include: { provider: true } }),
    session.user.email
      ? prisma.professionalAccessRequest.findFirst({
          where: { email: session.user.email.toLowerCase() },
          orderBy: { createdAt: 'desc' },
        })
      : null,
  ]);

  return (
    <div className="min-h-screen app-shell">
      <Navbar
        mode="app"
        userEmail={session.user.email}
        userName={session.user.name}
        userImage={session.user.image}
        isAdmin={isAdmin(session.user.email)}
        providerHref={providerAccount ? '/provider/dashboard' : '/provider/register'}
        professionalHref={professionalRequest?.status === 'APPROVED' ? '/profesional/dashboard' : '/profesional/solicitar'}
      />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <SettingsBackLink />

        <div className="mt-6 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <SettingsHeader />
          <SettingsActions />
        </div>

        <div className="mt-8">
          <AccountSettingsPanel />
        </div>

        <SettingsFootnote />
      </main>
    </div>
  );
}
