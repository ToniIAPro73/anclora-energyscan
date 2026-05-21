import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  BriefcaseBusiness,
  FileText,
  History,
  ShieldCheck,
  Users,
  Building2,
  Layers,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { lightAuth as auth } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';

export default async function ProfessionalPage() {
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const copy = getMonetizationCopy(language).professional;
  const session = await auth().catch(() => null);
  const request = session?.user?.email ? await prisma.professionalAccessRequest.findFirst({
    where: { email: session.user.email.toLowerCase() },
    orderBy: { createdAt: 'desc' },
  }) : null;

  const isApproved = request?.status === 'APPROVED';
  const isLoggedIn = !!session?.user;

  const primaryHref = isApproved ? '/profesional/dashboard' : '/profesional/solicitar';

  const primaryLabel = isApproved ? copy.dashboardCta : copy.cta;

  return (
    <div className="min-h-screen app-shell">
      {isLoggedIn ? (
        <Navbar
          mode="app"
          userEmail={session!.user!.email}
          userName={session!.user!.name}
          userImage={session!.user!.image}
        />
      ) : (
        <Navbar />
      )}
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28">
        {/* Hero */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#00DC82]/15 px-3 py-1 text-xs font-bold text-[#00DC82]">{copy.betaBadge}</span>
          {isApproved && (
            <span className="rounded-full bg-[#00DC82]/10 px-3 py-1 text-xs font-bold text-[#00DC82]">{copy.accessApproved}</span>
          )}
        </div>
        <h1 className="mt-3 font-heading text-4xl font-bold text-premium">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-muted">{copy.intro}</p>
        <p className="mt-3 text-xs text-muted">{copy.legal}</p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]"
          >
            {primaryLabel}
          </Link>
        </div>

        {/* Access status */}
        {request && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
            <span className="text-xs font-bold uppercase text-[#00DC82]">{copy.accessStatus}:</span>
            <span className="font-bold text-premium">{copy.statusLabel[request.status as keyof typeof copy.statusLabel] || request.status}</span>
          </div>
        )}

        {/* For whom */}
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-bold text-premium">{copy.forWhomTitle}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { icon: ShieldCheck, title: copy.forCertifiers, text: copy.forCertifiersText },
              { icon: BriefcaseBusiness, title: copy.forAdvisors, text: copy.forAdvisorsText },
              { icon: Building2, title: copy.forRealEstate, text: copy.forRealEstateText },
              { icon: Layers, title: copy.forAssetManagers, text: copy.forAssetManagersText },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <Icon className="h-6 w-6 text-[#00DC82]" />
                <p className="mt-4 font-heading font-bold text-premium">{title}</p>
                <p className="mt-2 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Available now */}
        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#00DC82]" />
              <h2 className="font-heading text-lg font-bold text-premium">{copy.availableNowTitle}</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {(copy.availableNow as string[]).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 shrink-0 text-[#00DC82]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-muted" />
              <h2 className="font-heading text-lg font-bold text-premium">{copy.notIncludedTitle}</h2>
            </div>
            <p className="mt-4 text-sm text-muted">{copy.notIncluded}</p>
          </div>
        </section>

        {/* Feature cards (MVP capabilities) */}
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            [copy.featureCases, BriefcaseBusiness],
            [copy.featurePdfBranding, FileText],
            [copy.featureClientPrecheck, ShieldCheck],
            [copy.featureHistory, History],
          ].map(([label, Icon]) => (
            <div key={String(label)} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <Icon className="h-6 w-6 text-[#00DC82]" />
              <p className="mt-4 font-heading font-bold text-premium">{label as string}</p>
            </div>
          ))}
        </div>

        {/* Beta notice */}
        <div className="mt-10 flex items-start gap-3 rounded-3xl border border-[#00DC82]/20 bg-[#00DC82]/5 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#00DC82]" />
          <p className="text-sm text-muted">{copy.betaNotice}</p>
        </div>

        {/* Provider difference */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#00DC82]" />
            <h2 className="font-heading text-lg font-bold text-premium">{copy.providerDifferenceTitle}</h2>
          </div>
          <p className="mt-3 text-sm text-muted">{copy.providerDifferenceText}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#00DC82] px-5 py-2 text-sm font-bold text-[#07140f]"
            >
              {primaryLabel}
            </Link>
            <Link
              href="/proveedores"
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-5 py-2 text-sm font-bold text-premium"
            >
              {copy.providerCtaLink}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
