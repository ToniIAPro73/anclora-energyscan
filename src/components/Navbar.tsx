'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BriefcaseBusiness, ChevronDown, FileText, LayoutDashboard, LogOut, ReceiptText, Settings, UserRound } from 'lucide-react';
import { signOut as clientSignOut } from 'next-auth/react';
import { useState } from 'react';
import { PreferenceToggles } from './PreferenceToggles';
import { usePreferences } from './AppPreferencesProvider';

type NavbarMode = 'public' | 'app';

type NavbarProps = {
  mode?: NavbarMode;
  userEmail?: string | null;
  userName?: string | null;
  providerHref?: string;
  professionalHref?: string;
};

export default function Navbar({
  mode = 'public',
  userEmail,
  userName,
  providerHref = '/provider/register',
  professionalHref = '/profesional',
}: NavbarProps) {
  const { dictionary: t } = usePreferences();
  const [productOpen, setProductOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const isAppMode = mode === 'app';
  const productLinks = isAppMode
    ? [
        { href: '/dashboard', label: t.navDashboard, Icon: LayoutDashboard },
        { href: '/wizard', label: t.navAssessment, Icon: FileText },
        { href: '/budget-review', label: t.navBudgetReview, Icon: ReceiptText },
        { href: providerHref, label: t.navProviders, Icon: BriefcaseBusiness },
        { href: professionalHref, label: t.navProfessional, Icon: UserRound },
      ]
    : [
        { href: '/#como-funciona', label: t.navHow },
        { href: '/calculadora-ahorro', label: t.navCalculator },
        { href: '/budget-review', label: t.navBudgetReview },
        { href: '/proveedores', label: t.navProviders },
        { href: '/profesional', label: t.navProfessional },
      ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[8500] glass border-b border-white/5">
      <nav className="mx-auto flex h-16 max-w-[96rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 font-heading font-bold text-lg text-premium xl:text-xl">
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
          <div className="relative">
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
          {isAppMode ? (
            <>
              <Link href="/dashboard" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navDashboard}</Link>
              <Link href="/budget-review" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navBudgetReview}</Link>
              <Link href="/pricing" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navPricing}</Link>
            </>
          ) : (
            <>
              <Link href="/#normativa" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navRegulation}</Link>
              <Link href="/pricing" className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3 font-semibold transition hover:bg-white/5 hover:text-premium">{t.navPricing}</Link>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <PreferenceToggles compact variant="popover" />
          </div>
          {isAppMode ? (
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="inline-flex max-w-[15rem] items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-heading font-semibold text-premium transition hover:border-[#00DC82]/40"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#00DC82]/30 bg-[#00DC82]/10">
                  <UserRound className="h-4 w-4 text-[#00DC82]" />
                </span>
                <span className="truncate">{userName || userEmail || t.navAccount}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountOpen && (
                <div className="surface absolute right-0 top-[calc(100%+0.85rem)] z-[8600] w-72 overflow-hidden rounded-3xl border shadow-2xl shadow-black/40">
                  <div className="border-b border-white/10 p-5">
                    <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#00DC82]">EnergyScan</p>
                    <p className="mt-1 truncate font-heading text-lg font-bold text-premium">{userName || t.navAccount}</p>
                    {userEmail && <p className="truncate text-sm font-semibold text-muted">{userEmail}</p>}
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
                      onClick={() => clientSignOut({ callbackUrl: '/' })}
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
            <Link href="/auth" className="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-heading font-semibold text-premium transition hover:border-[#00DC82]/40 lg:inline-flex">
              {t.access}
            </Link>
          )}
          <Link href="/wizard" className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#00DC82] px-4 py-2.5 text-sm font-heading font-semibold text-[#0A0A0A] transition hover:brightness-110 sm:px-5">
            {isAppMode ? t.navNewAssessment : t.start}
          </Link>
        </div>
      </nav>
      <div className="flex items-center justify-between border-t border-white/5 px-3 py-2 md:hidden">
        <PreferenceToggles compact variant="popover" />
        {isAppMode && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-heading font-semibold text-premium"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00DC82]/30 bg-[#00DC82]/10">
                <UserRound className="h-3.5 w-3.5 text-[#00DC82]" />
              </span>
              <span className="max-w-[8rem] truncate text-xs">{userName || userEmail || t.navAccount}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted transition ${accountOpen ? 'rotate-180' : ''}`} />
            </button>
            {accountOpen && (
              <div className="surface absolute bottom-[calc(100%+0.5rem)] right-0 z-[8600] w-64 overflow-hidden rounded-3xl border shadow-2xl shadow-black/40">
                <div className="border-b border-white/10 p-4">
                  <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#00DC82]">EnergyScan</p>
                  <p className="mt-1 truncate font-heading text-base font-bold text-premium">{userName || t.navAccount}</p>
                  {userEmail && <p className="truncate text-xs font-semibold text-muted">{userEmail}</p>}
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
                    onClick={() => clientSignOut({ callbackUrl: '/' })}
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
