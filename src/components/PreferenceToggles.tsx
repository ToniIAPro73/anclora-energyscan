'use client';

import type React from 'react';
import { Coins, Languages, Monitor, Moon, Ruler, Settings2, Sun } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  AppCurrency,
  AppTheme,
  currencies,
  MeasurementSystem,
  measurementSystems,
  themeModes,
} from '@/lib/preferences';
import { ANCLORA_LOCALE_META, PREMIUM_LOCALES, type ActiveAncloraLocale } from '@/lib/anclora-language-toggle';
import { usePreferences } from './AppPreferencesProvider';

const themeLabels: Record<AppTheme, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  dark: { label: 'Dark', icon: Moon },
  light: { label: 'Light', icon: Sun },
  system: { label: 'System', icon: Monitor },
};

const currencyLabels: Record<AppCurrency, string> = {
  EUR: '€',
  GBP: '£',
};

const measurementLabels: Record<MeasurementSystem, string> = {
  metric: 'm²',
  imperial: 'sq ft',
};

export function PreferenceToggles({ compact = false, variant = 'inline' }: { compact?: boolean; variant?: 'inline' | 'popover' }) {
  const {
    theme,
    language,
    currency,
    measurementSystem,
    setTheme,
    setLanguage,
    setCurrency,
    setMeasurementSystem,
  } = usePreferences();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const groups = (
    <div className={`flex max-w-full ${compact ? 'flex-wrap items-center justify-center gap-1.5' : 'flex-wrap items-center gap-3'}`}>
      <div className="premium-toggle" role="group" aria-label="Theme selector">
        {themeModes.map((mode) => {
          const Icon = themeLabels[mode].icon;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={`premium-toggle-option ${theme === mode ? 'is-active' : ''}`}
              aria-pressed={theme === mode}
              title={themeLabels[mode].label}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{themeLabels[mode].label}</span>
            </button>
          );
        })}
      </div>

      <LanguagePreference language={language} setLanguage={setLanguage} compact={compact} />

      <PreferenceGroup icon={Coins} label="Currency selector" compact={compact}>
        {currencies.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCurrency(item)}
            className={`premium-toggle-option text-sm font-bold ${currency === item ? 'is-active' : ''}`}
            aria-pressed={currency === item}
            title={item}
          >
            {currencyLabels[item]}
          </button>
        ))}
      </PreferenceGroup>

      <PreferenceGroup icon={Ruler} label="Measurement selector" compact={compact}>
        {measurementSystems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMeasurementSystem(item)}
            className={`premium-toggle-option px-2 text-[11px] font-bold ${measurementSystem === item ? 'is-active' : ''}`}
            aria-pressed={measurementSystem === item}
            title={measurementLabels[item]}
          >
            {measurementLabels[item]}
          </button>
        ))}
      </PreferenceGroup>
    </div>
  );

  if (variant === 'popover') {
    return (
      <div className="relative" ref={popoverRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-bold text-premium transition hover:border-[#00DC82]/40"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <Settings2 className="h-4 w-4 text-[#00DC82]" />
          <span>{ANCLORA_LOCALE_META[language].short} · {currencyLabels[currency]} · {measurementLabels[measurementSystem]}</span>
        </button>
        {open && (
          <div className="surface absolute right-0 top-[calc(100%+0.75rem)] z-[8600] rounded-3xl border p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {groups}
          </div>
        )}
      </div>
    );
  }

  return groups;
}

function LanguagePreference({
  language,
  setLanguage,
  compact,
}: {
  language: ActiveAncloraLocale;
  setLanguage: (language: ActiveAncloraLocale) => void;
  compact: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = ANCLORA_LOCALE_META[language];
  const pendingLabel = language === 'en' ? 'Localization pending' : language === 'de' ? 'Lokalisierung ausstehend' : 'Localización pendiente';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="premium-toggle h-[40px] px-2 text-xs font-bold"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Language selector"
      >
        {!compact && <Languages className="h-3.5 w-3.5 text-muted" aria-hidden="true" />}
        <span>{selected.short}</span>
        <span className="hidden text-muted sm:inline">{selected.nativeName}</span>
      </button>
      {open && (
        <div
          className="surface absolute right-0 top-[calc(100%+0.6rem)] z-[8700] w-[min(19rem,calc(100vw-2rem))] rounded-3xl border p-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
          role="dialog"
          aria-label="Language settings"
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Idioma</p>
            <button type="button" onClick={() => setOpen(false)} className="text-xs font-bold text-premium">
              Cerrar
            </button>
          </div>
          <div className="grid gap-1.5">
            {PREMIUM_LOCALES.map((locale) => {
              const meta = ANCLORA_LOCALE_META[locale];
              const active = meta.status === 'active';
              const current = locale === language;
              return (
                <button
                  key={locale}
                  type="button"
                  disabled={!active}
                  onClick={() => {
                    if (!active) return;
                    setLanguage(locale as ActiveAncloraLocale);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                    current
                      ? 'border-[#00DC82]/50 bg-[#00DC82]/10 text-premium'
                      : 'border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-premium'
                  } ${!active ? 'cursor-not-allowed opacity-55' : ''}`}
                  aria-pressed={current}
                >
                  <span>
                    <span className="block font-bold">{meta.nativeName}</span>
                    <span className="text-xs">{meta.englishName}</span>
                  </span>
                  <span className="text-xs font-black">{active ? meta.short : pendingLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PreferenceGroup({
  icon: Icon,
  label,
  compact,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="premium-toggle" role="group" aria-label={label}>
      {!compact && (
        <span className="flex h-7 w-7 items-center justify-center text-muted" aria-hidden="true">
          <Icon className="h-3.5 w-3.5" />
        </span>
      )}
      {children}
    </div>
  );
}
