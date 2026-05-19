'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarDays, Mail, MapPin, UserRound, Zap } from 'lucide-react';
import { usePreferences } from '@/components/AppPreferencesProvider';

type ProfileContentProps = {
  name: string | null;
  email: string | null;
  initials: string;
  location: string;
  memberSinceISO: string;
};

export function ProfileHero({ name, email, initials: inits, location, memberSinceISO }: ProfileContentProps) {
  const { dictionary: t, language } = usePreferences();
  const locale = language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'es-ES';
  const memberSince = new Date(memberSinceISO).toLocaleDateString(locale);

  return (
    <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 sm:p-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center">
        <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-[#00DC82]/30 bg-[#00DC82]/10">
          <span className="font-heading text-4xl font-black text-[#00DC82]">{inits}</span>
          <span className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#00DC82] text-[#07140f]">
            <Zap className="h-5 w-5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#00DC82]">{t.profileRole}</p>
          <h1 className="mt-2 break-words font-heading text-4xl font-black text-premium sm:text-5xl">{name || email}</h1>
          <p className="mt-2 text-lg font-heading font-semibold text-muted">{t.profileSubtitle}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-muted">
            {email && (
              <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-[#00DC82]" />{email}</span>
            )}
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#00DC82]" />{location}</span>
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#00DC82]" />{t.profileActiveSince} {memberSince}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/settings" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#00DC82] px-5 py-2 font-heading font-bold text-[#07140f]">
              <UserRound className="h-4 w-4" />
              {t.profileEditPrefs}
            </Link>
            <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-5 py-2 font-heading font-bold text-premium hover:border-[#00DC82]/40">
              {t.profileViewPanel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileBackLink() {
  const { dictionary: t } = usePreferences();
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-muted hover:text-premium">
      <ArrowLeft className="h-4 w-4" />
      {t.profileBack}
    </Link>
  );
}
