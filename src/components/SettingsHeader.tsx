'use client';

import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { usePreferences } from './AppPreferencesProvider';

export function SettingsHeader() {
  const { dictionary: t } = usePreferences();
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#00DC82]/30 bg-[#00DC82]/10">
        <Settings className="h-6 w-6 text-[#00DC82]" />
      </span>
      <div>
        <h1 className="font-heading text-4xl font-black text-premium">{t.settingsTitle}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{t.settingsSubtitle}</p>
      </div>
    </div>
  );
}

export function SettingsBackLink() {
  const { dictionary: t } = usePreferences();
  return (
    <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-wider text-muted hover:text-premium">
      <ArrowLeft className="h-4 w-4" />
      {t.settingsBack}
    </Link>
  );
}
