'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, BookOpen, BriefcaseBusiness, Calculator, ChevronDown, ClipboardList, FileText, Home, LayoutDashboard, LogOut, ReceiptText, Settings, UserRound } from 'lucide-react';
import { signOut as clientSignOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { PreferenceToggles } from './PreferenceToggles';
import { usePreferences } from './AppPreferencesProvider';
import { isAdminUser } from '@/lib/auth/roles';

type NavbarMode = 'public' | 'app';

type NavbarProps = {
  mode?: NavbarMode;
  userEmail?: string | null;
  userName?: string | null;
  userImage?: string | null;
  isAdmin?: boolean;
  providerHref?: string;
  professionalHref?: string;
};

export default function Navbar({
  mode = 'public',
  userEmail,
  userName,
  userImage,
  isAdmin = false,
  providerHref = '/provider/dashboard',
  professionalHref = '/profesional',
}: NavbarProps) {
  const { data: liveSession, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { dictionary: t } = usePreferences();
  const [productOpen, setProductOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);
  const desktopAccountRef = useRef<HTMLDivElement>(null);
  const mobileAccountRef = useRef<HTMLDivElement>(null);

  const sessionHasUser = status === 'authenticated' && Boolean(liveSession?.user?.email || liveSession?.user?.name);
  const liveUser = sessionHasUser ? liveSession?.user : null;
  const effectiveUserEmail = liveUser?.email ?? (status === 'loading' ? null : userEmail);
  const effectiveUserName = liveUser?.name ?? (status === 'loading' ? null : userName);
  const effectiveUserImage = liveUser?.image ?? (status === 'loading' ? null : userImage);
  const effectiveIsAdmin = isAdminUser(liveUser) || Boolean(!liveUser && status !== 'loading' && isAdmin);
  const isAppMode = mode === 'app' || (mode === 'public' && sessionHasUser);
  const hasAccount = isAppMode && Boolean(effectiveUserEmail || effectiveUserName);
  const initials = effectiveUserName ? effectiveUserName.slice(0, 2).toUpperCase() : (effectiveUserEmail ? effectiveUserEmail.slice(0, 2).toUpperCase() : '?');
  const logoHref = effectiveIsAdmin && isAppMode ? '/admin' : '/';

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (productRef.current && !productRef.current.contains(e.target as Node)) setProductOpen(false);
      const target = e.target as Node;
      const insideDesktop = Boolean(desktopAccountRef.current?.contains(target));
      const insideMobile = Boolean(mobileAccountRef.current?.contains(target));
      if (!insideDesktop && !insideMobile) setAccountOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  async function handleSignOut() {
    setAccountOpen(false);
    await clientSignOut({ callbackUrl: '/', redirect: true });
    router.refresh();
  }

  const adminLinks = [
    { href: '/admin', label: t.navAdminOverview, Icon: LayoutDashboard },
    { href: '/admin/requests', label: t.navAdminRequests, Icon: ClipboardList },
    { href: '/admin/professionals', label: t.navAdminProfessionals, Icon: UserRound },
    { href: '/admin/providers', label: t.navAdminProviders, Icon: BriefcaseBusiness },
    { href: '/admin/leads', label: t.navAdminLeads, Icon: ReceiptText },
    { href: '/admin/kpis', label: t.navAdminKpis, Icon: BarChart3 },
    { href: '/admin/analytics', label: t.navAdminAnalytics, Icon: BarChart3 },
    { href: '/admin/documentation', label: t.navAdminDocs, Icon: BookOpen },
  ];
  const productLinks = effectiveIsAdmin && isAppMode
    ? adminLinks
    : isAppMode
    ? [
        { href: '/dashboard', label: t.navDashboard, Icon: LayoutDashboard },
        { href: '/wizard', label: t.navAssessment, Icon: FileText },
        { href: '/budget-review', label: t.navBudgetReview, Icon: ReceiptText },
        { href: providerHref, label: t.navProviders, Icon: BriefcaseBusiness },
        { href: professionalHref, label: t.navProfessional, Icon: UserRound },
      ]
    : [
        { href: '/calculadora-ahorro', label: t.navCalculator, Icon: Calculator },
        { href: '/wizard', label: t.navReports, Icon: FileText },
        { href: '/budget-review', label: t.navBudgetReview, Icon: ReceiptText },
        { href: '/#casos-de-uso', label: t.navResidential, Icon: Home },
        { href: '/profesional', label: t.navProfessional, Icon: UserRound },
        { href: '/proveedores', label: t.navProviders, Icon: BriefcaseBusiness },
      ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[8500] glass border-b border-white/5">
      <nav className="mx-auto flex h-16 max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={logoHref} className="flex min-w-0 shrink-0 items-center gap-2 font-heading font-bold text-lg text-premium xl:text-xl">
          <Image
            src="/brand/logo-anclora-energy-scan.png"
            alt="Anclora EnergyScan"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-cover"
            priority
          />
          <span className="hidden whitespace-nowrap min-[430px]:inline">Anclora EnergyScan</span>
        </Link>
        <div className="premium-nav-pill hidden items-center gap-1 rounded-full p-1 text-sm text-muted xl:flex">
          <div className="relative" ref={productRef}>
            <button
              type="button"
              onClick={() => setProductOpen((value) => !value)}
              className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium"
              aria-expanded={productOpen}
              aria-haspopup="menu"
            >
              {isAppMode ? t.navWorkspace : t.navProduct}
              <ChevronDown className={`h-4 w-4 transition ${productOpen ? 'rotate-180' : ''}`} />
            </button>
            {productOpen && (
              <div className="surface absolute left-0 top-[calc(100%+0.85rem)] z-[8600] w-60 rounded-2xl border p-2 shadow-2xl shadow-black/30">
                {productLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setProductOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-premium"
                  >
                    {'Icon' in item && item.Icon ? <item.Icon className="h-4 w-4 text-[#00DC82]" /> : null}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {isAppMode && effectiveIsAdmin ? (
            <>
              <Link href="/admin" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navAdminOverview}</Link>
              <Link href="/admin/professionals" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navAdminProfessionals}</Link>
              <Link href="/admin/providers" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navAdminProviders}</Link>
              <Link href="/admin/leads" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navAdminLeads}</Link>
              <Link href="/admin/kpis" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navAdminKpis}</Link>
              <Link href="/admin/documentation" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navAdminDocs}</Link>
            </>
          ) : isAppMode ? (
            <>
              <Link href="/dashboard" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navDashboard}</Link>
              <Link href="/budget-review" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navBudgetReview}</Link>
              <Link href="/pricing" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navPricing}</Link>
            </>
          ) : (
            <>
              <Link href="/#como-funciona" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navHow}</Link>
              <Link href="/#normativa" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navRegulation}</Link>
              <Link href="/#mejoras" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navImprovements}</Link>
              <Link href="/#precios" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navPricing}</Link>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <PreferenceToggles compact variant="popover" />
          </div>
          {hasAccount ? (
            <div className="relative hidden lg:block" ref={desktopAccountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="inline-flex max-w-[15rem] items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-heading font-semibold text-premium transition hover:border-[#00DC82]/40"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#00DC82]/30 bg-[#00DC82]/10">
                  {effectiveUserImage
                    ? <Image src={effectiveUserImage} alt="" width={28} height={28} className="h-full w-full object-cover" />
                    : <span className="text-[10px] font-black text-[#00DC82]">{initials}</span>}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate">{effectiveUserName || effectiveUserEmail || t.navAccount}</span>
                  {effectiveIsAdmin && (
                    <span className="shrink-0 rounded-full bg-[#00DC82]/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#00DC82]">
                      {t.navAdminRole}
                    </span>
                  )}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountOpen && (
                <div className="surface absolute right-0 top-[calc(100%+0.85rem)] z-[8600] w-72 overflow-hidden rounded-3xl border shadow-2xl shadow-black/40">
                  <div className="border-b border-white/10 p-5">
                    <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#00DC82]">{effectiveIsAdmin ? t.navAdminRole : 'EnergyScan'}</p>
                    <p className="mt-1 truncate font-heading text-lg font-bold text-premium">{effectiveUserName || t.navAccount}</p>
                    {effectiveUserEmail && <p className="truncate text-sm font-semibold text-muted">{effectiveUserEmail}</p>}
                  </div>
                  <div className="p-2">
                    <Link
                      href="/profile"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-heading font-semibold text-muted transition hover:bg-white/5 hover:text-premium"
                    >
                      <UserRound className="h-4 w-4 text-[#00DC82]" />
                      {t.navProfile}
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-heading font-semibold text-muted transition hover:bg-white/5 hover:text-premium"
                    >
                      <Settings className="h-4 w-4 text-[#00DC82]" />
                      {t.navSettings}
                    </Link>
                  </div>
                  <div className="border-t border-white/10 p-2">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-heading font-semibold text-premium transition hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4 text-muted" />
                      {t.navSignOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href={`/auth${pathname ? `?callbackUrl=${encodeURIComponent(pathname)}` : ''}`} className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-heading font-semibold text-premium transition hover:border-[#00DC82]/40 lg:inline-flex">
              {t.access}
            </Link>
          )}
          <Link href={effectiveIsAdmin ? '/admin/requests' : '/wizard'} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#00DC82] px-4 py-2.5 text-sm font-heading font-semibold text-[#0A0A0A] transition hover:brightness-110 sm:px-5">
            {effectiveIsAdmin ? t.navAdminRequests : isAppMode ? t.navNewAssessment : t.start}
          </Link>
        </div>
      </nav>
      <div className="flex items-center justify-between border-t border-white/5 px-3 py-2 md:hidden">
        <PreferenceToggles compact variant="popover" />
        {hasAccount && (
          <div className="relative" ref={mobileAccountRef}>
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-heading font-semibold text-premium"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#00DC82]/30 bg-[#00DC82]/10">
                {effectiveUserImage
                  ? <Image src={effectiveUserImage} alt="" width={24} height={24} className="h-full w-full object-cover" />
                  : <span className="text-[9px] font-black text-[#00DC82]">{initials}</span>}
              </span>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="max-w-[8rem] truncate text-xs">{effectiveUserName || effectiveUserEmail || t.navAccount}</span>
                {effectiveIsAdmin && (
                  <span className="shrink-0 rounded-full bg-[#00DC82]/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#00DC82]">
                    {t.navAdminRole}
                  </span>
                )}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted transition ${accountOpen ? 'rotate-180' : ''}`} />
            </button>
            {accountOpen && (
              <div className="surface absolute bottom-[calc(100%+0.5rem)] right-0 z-[8600] w-64 overflow-hidden rounded-3xl border shadow-2xl shadow-black/40">
                <div className="border-b border-white/10 p-4">
                  <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#00DC82]">{effectiveIsAdmin ? t.navAdminRole : 'EnergyScan'}</p>
                  <p className="mt-1 truncate font-heading text-base font-bold text-premium">{effectiveUserName || t.navAccount}</p>
                  {effectiveUserEmail && <p className="truncate text-xs font-semibold text-muted">{effectiveUserEmail}</p>}
                </div>
                <div className="p-2">
                  <Link
                    href="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-heading font-semibold text-muted transition hover:bg-white/5 hover:text-premium"
                  >
                    <UserRound className="h-4 w-4 text-[#00DC82]" />
                    {t.navProfile}
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-heading font-semibold text-muted transition hover:bg-white/5 hover:text-premium"
                  >
                    <Settings className="h-4 w-4 text-[#00DC82]" />
                    {t.navSettings}
                  </Link>
                </div>
                <div className="border-t border-white/10 p-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-heading font-semibold text-premium transition hover:bg-white/5"
                  >
                    <LogOut className="h-4 w-4 text-muted" />
                    {t.navSignOut}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
