'use client';

import { Bell, Database, Globe2, MonitorCog, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { PreferenceToggles } from './PreferenceToggles';
import { usePreferences } from './AppPreferencesProvider';

export function AccountSettingsPanel() {
  const { language, currency, measurementSystem, theme, dictionary: t } = usePreferences();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';

  const sideItems = [
    { label: t.settingsSideGeneral, Icon: Globe2, active: true },
    { label: t.settingsSideNotifications, Icon: Bell },
    { label: t.settingsSidePrivacy, Icon: ShieldCheck },
    { label: t.settingsSideData, Icon: Database },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[13rem_1fr]">
      <aside className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {sideItems.map(({ label, Icon, active }) => (
          <button
            key={label}
            type="button"
            className={`flex shrink-0 min-h-11 items-center gap-3 rounded-2xl border px-4 text-left text-sm font-heading font-bold transition lg:w-full ${
              active
                ? 'border-[#00DC82]/35 bg-[#00DC82]/10 text-[#00DC82]'
                : 'border-transparent text-muted hover:border-white/10 hover:bg-white/5 hover:text-premium'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </aside>

      <div className="space-y-5">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
            <h2 className="font-heading text-lg font-bold text-premium">{t.settingsSectionInterface}</h2>
          </div>
          <div className="space-y-6 p-5">
            <SettingRow title={t.settingsRowPrefs} description={t.settingsRowPrefsDesc}>
              <PreferenceToggles />
            </SettingRow>
            <SettingRow title={t.settingsRowTimezone} description={t.settingsRowTimezoneDesc}>
              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm font-heading font-semibold text-premium">
                {timezone}
              </div>
            </SettingRow>
            <SettingRow title={t.settingsRowState} description={t.settingsRowStateDesc}>
              <div className="grid gap-2 text-xs font-bold uppercase text-muted sm:grid-cols-2 lg:grid-cols-4">
                <span className="rounded-2xl border border-white/10 px-3 py-2">{t.settingsLangLabel}: {language}</span>
                <span className="rounded-2xl border border-white/10 px-3 py-2">{t.settingsCurrencyLabel}: {currency}</span>
                <span className="rounded-2xl border border-white/10 px-3 py-2">{t.settingsUnitsLabel}: {measurementSystem}</span>
                <span className="rounded-2xl border border-white/10 px-3 py-2">{t.settingsThemeLabel}: {theme}</span>
              </div>
            </SettingRow>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
            <h2 className="font-heading text-lg font-bold text-premium">{t.settingsSectionExperience}</h2>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {t.settingsFeatures.map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <MonitorCog className="h-4 w-4 text-[#00DC82]" />
                <p className="mt-3 font-heading text-sm font-bold text-premium">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[12rem_1fr] lg:items-start">
      <div>
        <p className="font-heading text-sm font-bold text-premium">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}
