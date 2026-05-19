'use client';

import { Bell, Database, Globe2, Lock, MonitorCog, Shield, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { PreferenceToggles } from './PreferenceToggles';
import { usePreferences } from './AppPreferencesProvider';

type Tab = 'general' | 'notifications' | 'privacy' | 'data';

export function AccountSettingsPanel() {
  const { language, currency, measurementSystem, theme, dictionary: t } = usePreferences();
  const [tab, setTab] = useState<Tab>('general');
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';

  const sideItems: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: 'general', label: t.settingsSideGeneral, Icon: Globe2 },
    { key: 'notifications', label: t.settingsSideNotifications, Icon: Bell },
    { key: 'privacy', label: t.settingsSidePrivacy, Icon: ShieldCheck },
    { key: 'data', label: t.settingsSideData, Icon: Database },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[13rem_1fr]">
      <aside className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {sideItems.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex shrink-0 min-h-11 items-center gap-3 rounded-2xl border px-4 text-left text-sm font-heading font-bold transition lg:w-full ${
              tab === key
                ? 'border-[#00DC82]/35 bg-[#00DC82]/10 text-[#00DC82]'
                : 'border-transparent text-muted hover:border-white/10 hover:bg-white/5 hover:text-premium'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </aside>

      <div>
        {tab === 'general' && (
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
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                    <span className="text-sm font-heading font-semibold text-premium">{timezone}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {language === 'de' ? 'Automatisch' : language === 'en' ? 'Auto-detected' : 'Detectada'}
                    </span>
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
        )}

        {tab === 'notifications' && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <h2 className="font-heading text-lg font-bold text-premium">{t.settingsSideNotifications}</h2>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm text-muted">
                {language === 'de'
                  ? 'Benachrichtigungseinstellungen stehen in Kürze zur Verfügung.'
                  : language === 'en'
                  ? 'Notification preferences are coming soon.'
                  : 'Las preferencias de notificaciones estarán disponibles próximamente.'}
              </p>
              {[
                { label: language === 'en' ? 'New premium report ready' : language === 'de' ? 'Neuer Premium-Bericht verfügbar' : 'Nuevo informe premium disponible', soon: false },
                { label: language === 'en' ? 'Provider contact unlocked' : language === 'de' ? 'Anbieterkontakt freigeschaltet' : 'Contacto de proveedor desbloqueado', soon: false },
                { label: language === 'en' ? 'Regulatory updates' : language === 'de' ? 'Regulatorische Updates' : 'Actualizaciones normativas', soon: true },
                { label: language === 'en' ? 'Weekly activity summary' : language === 'de' ? 'Wöchentliche Aktivitätszusammenfassung' : 'Resumen semanal de actividad', soon: true },
              ].map(({ label, soon }) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-[#00DC82]" />
                    <span className="text-sm font-heading font-bold text-premium">{label}</span>
                  </div>
                  {soon ? (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {language === 'en' ? 'Soon' : language === 'de' ? 'Demnächst' : 'Próximamente'}
                    </span>
                  ) : (
                    <div className="h-5 w-10 rounded-full bg-[#00DC82]/20 border border-[#00DC82]/30 flex items-center justify-end pr-0.5">
                      <div className="h-4 w-4 rounded-full bg-[#00DC82]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'privacy' && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <h2 className="font-heading text-lg font-bold text-premium">{t.settingsSidePrivacy}</h2>
            </div>
            <div className="space-y-4 p-5">
              {[
                {
                  Icon: Shield,
                  title: language === 'en' ? 'Session security' : language === 'de' ? 'Sitzungssicherheit' : 'Seguridad de sesión',
                  desc: language === 'en' ? 'Your session is protected with NextAuth JWT. Each sign-in generates a new token.' : language === 'de' ? 'Ihre Sitzung ist mit NextAuth JWT geschützt. Jede Anmeldung generiert ein neues Token.' : 'Tu sesión está protegida con NextAuth JWT. Cada inicio de sesión genera un nuevo token.',
                },
                {
                  Icon: Lock,
                  title: language === 'en' ? 'Data stored' : language === 'de' ? 'Gespeicherte Daten' : 'Datos almacenados',
                  desc: language === 'en' ? 'EnergyScan stores your assessments, quotes and provider requests in a private database. No data is sold to third parties.' : language === 'de' ? 'EnergyScan speichert Ihre Analysen, Angebote und Anbieteranfragen in einer privaten Datenbank. Keine Daten werden an Dritte verkauft.' : 'EnergyScan almacena tus análisis, presupuestos y solicitudes de proveedores en una base de datos privada. No se venden datos a terceros.',
                },
                {
                  Icon: ShieldCheck,
                  title: language === 'en' ? 'Consent management' : language === 'de' ? 'Einwilligungsverwaltung' : 'Gestión de consentimientos',
                  desc: language === 'en' ? 'Provider contact requests require explicit per-request consent. You can review your cookie preferences at any time.' : language === 'de' ? 'Kontaktanfragen bei Anbietern erfordern eine ausdrückliche Zustimmung pro Anfrage. Sie können Ihre Cookie-Einstellungen jederzeit einsehen.' : 'Las solicitudes de contacto con proveedores requieren consentimiento explícito por solicitud. Puedes revisar tus preferencias de cookies en cualquier momento.',
                },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[#00DC82]" />
                    <p className="font-heading text-sm font-bold text-premium">{title}</p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'data' && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
              <h2 className="font-heading text-lg font-bold text-premium">{t.settingsSideData}</h2>
            </div>
            <div className="space-y-4 p-5">
              {[
                {
                  title: language === 'en' ? 'Export my data' : language === 'de' ? 'Meine Daten exportieren' : 'Exportar mis datos',
                  desc: language === 'en' ? 'Download a summary of your assessments and reports. Coming soon.' : language === 'de' ? 'Laden Sie eine Zusammenfassung Ihrer Analysen und Berichte herunter. Demnächst verfügbar.' : 'Descarga un resumen de tus análisis e informes. Próximamente disponible.',
                  soon: true,
                },
                {
                  title: language === 'en' ? 'Delete account' : language === 'de' ? 'Konto löschen' : 'Eliminar cuenta',
                  desc: language === 'en' ? 'Permanently delete your account and all associated data. This action cannot be undone. Contact support to request deletion.' : language === 'de' ? 'Löschen Sie dauerhaft Ihr Konto und alle zugehörigen Daten. Diese Aktion kann nicht rückgängig gemacht werden. Wenden Sie sich an den Support.' : 'Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer. Contacta con soporte para solicitar la eliminación.',
                  soon: false,
                  danger: true,
                },
              ].map(({ title, desc, soon, danger }) => (
                <div key={title} className={`rounded-2xl border p-4 ${danger ? 'border-red-500/20 bg-red-500/5' : 'border-white/10 bg-black/10'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-heading text-sm font-bold ${danger ? 'text-red-400' : 'text-premium'}`}>{title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{desc}</p>
                    </div>
                    {soon && (
                      <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                        {language === 'en' ? 'Soon' : language === 'de' ? 'Demnächst' : 'Próxim.'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
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
