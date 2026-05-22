import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  CheckCircle2,
  Coins,
  Info,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/is-admin';

export default async function ProvidersLandingPage() {
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const copy = getMonetizationCopy(language).provider;
  const session = await auth().catch(() => null);

  const userIsAdmin = isAdmin(session?.user?.email);
  const anonymousProviderText = (value: string) => {
    if (session?.user) return value;
    if (language === 'en') return value.replace(/Provider dashboard/g, 'Provider workspace').replace(/provider dashboard/g, 'provider workspace');
    if (language === 'de') return value.replace(/Anbieter-Dashboard/g, 'Anbieterbereich').replace(/Anbieterbereich/g, 'Anbieterbereich');
    return value.replace(/Panel proveedor/g, 'Área de gestión').replace(/panel proveedor/g, 'área de gestión');
  };

  const account = session?.user?.id && !userIsAdmin
    ? await prisma.providerAccount.findUnique({
        where: { userId: session.user.id },
        include: { provider: true },
      })
    : null;

  const isApproved =
    account?.provider.status === 'VERIFIED' ||
    account?.provider.status === 'PREFERRED' ||
    account?.provider.status === 'EXCLUSIVE';

  const primaryHref = isApproved ? '/provider/dashboard' : '/provider/register';
  const primaryLabel = isApproved ? copy.dashboardTitle : copy.registerCta;

  const CATEGORY_ICONS = ['🪟', '🏠', '🌡️', '☀️', '📋', '🔧'];

  return (
    <div className="min-h-screen app-shell">
      {session?.user ? (
        <Navbar
          mode="app"
          userEmail={session.user.email}
          userName={session.user.name}
          userImage={session.user.image as string | null}
          isAdmin={userIsAdmin}
        />
      ) : (
        <Navbar />
      )}

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28">

        {/* HERO */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#00DC82]/15 px-3 py-1 text-xs font-bold text-[#00DC82]">
            {copy.betaBadge}
          </span>
          {isApproved && (
            <span className="rounded-full bg-[#00DC82]/10 px-3 py-1 text-xs font-bold text-[#00DC82]">
              {copy.providerStatusLabel[account!.provider.status as keyof typeof copy.providerStatusLabel]}
            </span>
          )}
        </div>
        <h1 className="mt-3 font-heading text-4xl font-bold text-premium">{copy.landingTitle}</h1>
        <p className="mt-4 max-w-3xl text-muted">{copy.landingIntro}</p>
        <p className="mt-3 text-xs text-muted">{copy.providerLegal}</p>

        {/* CTAs */}
        {!userIsAdmin && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]"
            >
              {primaryLabel}
            </Link>
            <Link
              href="#como-funciona-proveedores"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 font-heading font-bold text-premium"
            >
              {copy.howItWorksTitle}
            </Link>
            {isApproved && (
              <Link
                href="/provider/leads"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 font-heading font-bold text-premium"
              >
                {copy.viewLeads}
              </Link>
            )}
          </div>
        )}

        {/* Access status */}
        {!userIsAdmin && account && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
            <span className="text-xs font-bold uppercase text-[#00DC82]">{copy.status}:</span>
            <span className="font-bold text-premium">
              {copy.providerStatusLabel[account.provider.status as keyof typeof copy.providerStatusLabel] || account.provider.status}
            </span>
          </div>
        )}

        {/* FOR WHOM */}
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-bold text-premium">{copy.forWhomTitle}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {(copy.forWhomCards as string[]).map((card, i) => (
              <div key={card} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <span className="text-2xl">{CATEGORY_ICONS[i]}</span>
                <p className="mt-4 font-heading font-bold text-premium">{anonymousProviderText(card)}</p>
                <p className="mt-2 text-sm text-muted">{anonymousProviderText((copy.forWhomCardCopy as string[])[i])}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="como-funciona-proveedores" className="mt-12 scroll-mt-24">
          <h2 className="font-heading text-2xl font-bold text-premium">{copy.howItWorksTitle}</h2>
          <ol className="mt-6 space-y-3">
            {(copy.howItWorksSteps as string[]).map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00DC82]/15 font-heading text-sm font-bold text-[#00DC82]">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-muted">{anonymousProviderText(step)}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* AVAILABLE NOW / COMING SOON */}
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#00DC82]" />
              <h2 className="font-heading text-lg font-bold text-premium">{copy.availableNowTitle}</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {(copy.availableNow as string[]).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 shrink-0 text-[#00DC82]">✓</span>
                  {anonymousProviderText(item)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-muted" />
              <h2 className="font-heading text-lg font-bold text-premium">{copy.comingSoonTitle}</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {(copy.comingSoon as string[]).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 shrink-0 text-muted">→</span>
                  {anonymousProviderText(item)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CREDITS + CONSENT */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-[#00DC82]" />
              <h2 className="font-heading text-lg font-bold text-premium">{copy.creditsTitle}</h2>
            </div>
            <p className="mt-3 text-sm text-muted">{copy.creditsText}</p>
            <p className="mt-3 text-sm font-bold text-premium">{copy.packTitle(10)} — {copy.packCopy}</p>
            <div className="mt-4 space-y-1">
              {(copy.packIncludes as string[]).map((item) => (
                <span key={item} className="flex items-start gap-2 text-xs text-muted">
                  <span className="shrink-0 text-[#00DC82]">✓</span>{item}
                </span>
              ))}
              {(copy.packNotIncludes as string[]).map((item) => (
                <span key={item} className="flex items-start gap-2 text-xs text-muted">
                  <span className="shrink-0 text-muted">✗</span>{item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#00DC82]" />
              <h2 className="font-heading text-lg font-bold text-premium">{copy.consentTitle}</h2>
            </div>
            <p className="mt-3 text-sm text-muted">{copy.consentText}</p>
          </div>
        </section>

        {/* NOT GUARANTEED */}
        <div className="mt-8 flex items-start gap-3 rounded-3xl border border-[#00DC82]/20 bg-[#00DC82]/5 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#00DC82]" />
          <div>
            <p className="font-heading text-sm font-bold text-premium">{copy.notGuaranteedTitle}</p>
            <p className="mt-1 text-sm text-muted">{copy.notGuaranteedText}</p>
          </div>
        </div>

        {/* PROFESSIONAL DIFFERENCE */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#00DC82]" />
            <h2 className="font-heading text-lg font-bold text-premium">{copy.professionalDiffTitle}</h2>
          </div>
          <p className="mt-3 text-sm text-muted">{copy.professionalDiffText}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!userIsAdmin && (
              <Link
                href={primaryHref}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#00DC82] px-5 py-2 text-sm font-bold text-[#07140f]"
              >
                {primaryLabel}
              </Link>
            )}
            <Link
              href="/profesional"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-5 py-2 text-sm font-bold text-premium"
            >
              {copy.professionalCtaLink as string}
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
