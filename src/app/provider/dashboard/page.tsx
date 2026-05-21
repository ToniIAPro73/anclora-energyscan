import Link from 'next/link';
import { cookies } from 'next/headers';
import { BadgeCheck, CircleAlert, Coins, OctagonX, Trophy, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';

const APPROVED_STATUSES = ['VERIFIED', 'PREFERRED', 'EXCLUSIVE'];

export default async function ProviderDashboardPage() {
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const copy = getMonetizationCopy(language).provider;
  const session = await auth().catch(() => null);

  let account = session?.user?.id
    ? await prisma.providerAccount.findUnique({
        where: { userId: session.user.id },
        include: { provider: { include: { leads: true } } },
      })
    : null;

  // Auto-link: if user has no ProviderAccount but registered with their email, link now
  if (!account && session?.user?.id && session.user.email) {
    const unclaimed = await prisma.provider.findFirst({
      where: { email: session.user.email, accounts: { is: null } },
    });
    if (unclaimed) {
      account = await prisma.providerAccount.create({
        data: { userId: session.user.id, providerId: unclaimed.id },
        include: { provider: { include: { leads: true } } },
      });
    }
  }

  const leads = account?.provider.leads || [];
  const unlocked = leads.filter((lead) => lead.contactUnlockedAt).length;
  const pending = leads.filter((lead) => lead.status === 'PENDING').length;
  const won = leads.filter((lead) => lead.status === 'WON').length;
  const lost = leads.filter((lead) => lead.status === 'LOST' || lead.status === 'CANCELLED').length;

  const providerStatus = account?.provider.status;
  const isApproved = providerStatus && APPROVED_STATUSES.includes(providerStatus);
  const isSuspended = providerStatus === 'SUSPENDED';

  const statusLabel = providerStatus
    ? (copy.providerStatusLabel[providerStatus as keyof typeof copy.providerStatusLabel] || providerStatus)
    : '';

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
        <h1 className="font-heading text-4xl font-bold text-premium">{copy.dashboardTitle}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{copy.dashboardDescription as string}</p>

        {/* NO SESSION */}
        {!session?.user && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-muted">{copy.signIn}</p>
            <div className="mt-5 flex gap-3">
              <Link href="/auth?callbackUrl=/provider/dashboard" className="inline-flex rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]">
                {copy.status}
              </Link>
              <Link href="/provider/register" className="inline-flex rounded-full border border-white/10 px-6 py-3 font-heading font-bold text-premium">
                {copy.registerCta}
              </Link>
            </div>
          </div>
        )}

        {/* LOGGED IN BUT NO PROVIDER */}
        {session?.user && !account && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="font-heading text-xl font-bold text-premium">{copy.noProviderTitle as string}</p>
            <p className="mt-2 text-sm text-muted">{copy.noProviderText as string}</p>
            <Link href="/provider/register" className="mt-5 inline-flex rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]">
              {copy.registerCta}
            </Link>
          </div>
        )}

        {/* HAS PROVIDER */}
        {account && (
          <>
            {/* Profile card */}
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-[#00DC82]">{copy.provider}</p>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-premium">{account.provider.name}</h2>
                  <p className="mt-2 text-sm text-muted">{copy.providerLegal}</p>
                </div>
                <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${isSuspended ? 'border-[#EF4444]/30 text-[#EF4444]' : isApproved ? 'border-[#00DC82]/30 text-[#00DC82]' : 'border-white/10 text-premium'}`}>
                  {isSuspended
                    ? <OctagonX className="h-4 w-4" />
                    : isApproved
                    ? <BadgeCheck className="h-4 w-4" />
                    : <CircleAlert className="h-4 w-4 text-[#FFB020]" />}
                  {statusLabel}
                </span>
              </div>

              {/* State-specific notices */}
              {providerStatus === 'PENDING' && (
                <p className="mt-4 rounded-2xl border border-[#FFB020]/30 bg-[#FFB020]/10 p-4 text-sm text-[#FFB020]">
                  {copy.pendingNotice}
                </p>
              )}
              {isSuspended && (
                <div className="mt-4 rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 p-4">
                  <p className="text-sm font-bold text-[#EF4444]">{copy.suspendedTitle as string}</p>
                  <p className="mt-1 text-sm text-[#EF4444]/80">{copy.suspendedText as string}</p>
                </div>
              )}
            </div>

            {/* KPIs — only for approved */}
            {isApproved && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: copy.credits, value: account.provider.leadCreditsBalance, Icon: Coins },
                  { label: copy.totalLeads, value: leads.length, Icon: Users },
                  { label: copy.unlockedLeads, value: unlocked, Icon: BadgeCheck },
                  { label: copy.pendingLeads, value: pending, Icon: CircleAlert },
                  { label: copy.wonLostLeads, value: `${won}/${lost}`, Icon: Trophy },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <Icon className="h-5 w-5 text-[#00DC82]" />
                    <p className="mt-4 font-heading text-3xl font-bold text-premium">{value}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-muted">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isApproved && (
                <Link href="/provider/leads" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]">
                  {copy.viewLeads}
                </Link>
              )}
              {isApproved && (
                <Link href="/provider/billing" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 font-heading font-bold text-premium">
                  {copy.buyCreditsCta}
                </Link>
              )}
              <Link href="/proveedores" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 font-heading font-bold text-premium">
                {copy.landingTitle}
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
