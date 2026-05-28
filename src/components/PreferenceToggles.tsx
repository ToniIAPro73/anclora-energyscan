'use client';

import type React from 'react';
import { ChevronDown, Globe, Monitor, Moon, Sun, X } from 'lucide-react';
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

const currencyLabels: Record<AppCurrency, { label: string; symbol: string }> = {
  EUR: { label: 'Euro', symbol: '€' },
  USD: { label: 'US Dollar', symbol: '$' },
  GBP: { label: 'Pound sterling', symbol: '£' },
  CHF: { label: 'Swiss franc', symbol: 'CHF' },
  SEK: { label: 'Swedish krona', symbol: 'SEK kr' },
  DKK: { label: 'Danish krone', symbol: 'DKK kr' },
  NOK: { label: 'Norwegian krone', symbol: 'NOK kr' },
};

const measurementLabels: Record<MeasurementSystem, string> = {
  metric: 'm²',
  imperial: 'Sqft',
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
  const controls = (
    <>
      <ThemePreference theme={theme} setTheme={setTheme} />
      <GlobalPreferencesTrigger
        language={language}
        currency={currency}
        measurementSystem={measurementSystem}
        setLanguage={setLanguage}
        setCurrency={setCurrency}
        setMeasurementSystem={setMeasurementSystem}
        compact={compact}
      />
    </>
  );

  if (variant === 'popover') return <div className="flex items-center gap-2">{controls}</div>;

  return (
    <div className={`flex max-w-full ${compact ? 'flex-wrap items-center justify-center gap-1.5' : 'flex-wrap items-center gap-3'}`}>
      {controls}
    </div>
  );
}

function ThemePreference({ theme, setTheme }: { theme: AppTheme; setTheme: (theme: AppTheme) => void }) {
  return (
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
  );
}

function GlobalPreferencesTrigger({
  language,
  currency,
  measurementSystem,
  setLanguage,
  setCurrency,
  setMeasurementSystem,
  compact,
}: {
  language: ActiveAncloraLocale;
  currency: AppCurrency;
  measurementSystem: MeasurementSystem;
  setLanguage: (language: ActiveAncloraLocale) => void;
  setCurrency: (currency: AppCurrency) => void;
  setMeasurementSystem: (measurementSystem: MeasurementSystem) => void;
  compact: boolean;
}) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selected = ANCLORA_LOCALE_META[language];
  const summary = `${selected.nativeName} · ${currency} · ${measurementLabels[measurementSystem]}`;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="premium-toggle min-h-[40px] max-w-full px-3 text-xs font-bold"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Global preferences"
      >
        <Globe className="h-3.5 w-3.5 text-[#00DC82]" aria-hidden="true" />
        <span className="truncate">{compact ? `${selected.nativeName} · ${currency} · ${measurementLabels[measurementSystem]}` : summary}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="surface absolute right-0 top-[calc(100%+0.6rem)] z-[8700] w-[min(22rem,calc(100vw-2rem))] rounded-3xl border p-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
          role="dialog"
          aria-label="Global preferences settings"
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Ajustes</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-premium" aria-label="Close preferences">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">Language</p>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as ActiveAncloraLocale)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-premium"
            aria-label="Language"
          >
            {PREMIUM_LOCALES.map((locale) => {
              const meta = ANCLORA_LOCALE_META[locale];
              const active = meta.status === 'active';
              return (
                <option
                  key={locale}
                  disabled={!active}
                  value={locale}
                >
                  {meta.nativeName} - {meta.englishName}{active ? '' : ' - Localization pending'}
                </option>
              );
            })}
          </select>

          <p className="mb-2 mt-4 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">Currency</p>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as AppCurrency)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-premium"
            aria-label="Currency"
          >
            {currencies.map((item) => (
              <option key={item} value={item}>
                {currencyLabels[item].label} - {item} {currencyLabels[item].symbol}
              </option>
            ))}
          </select>

          <p className="mb-2 mt-4 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">Measure Units</p>
          <select
            value={measurementSystem}
            onChange={(event) => setMeasurementSystem(event.target.value as MeasurementSystem)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-premium"
            aria-label="Measure units"
          >
            {measurementSystems.map((item) => (
              <option key={item} value={item}>
                {item === 'metric' ? 'Square Meter - m² / Hectare - Ha' : 'Square Foot - sqft / Acre - ac'}
              </option>
            ))}
          </select>

          <button type="button" className="mt-4 w-full rounded-2xl bg-[#00DC82] px-4 py-2 text-sm font-black text-[#06130f]" onClick={() => setOpen(false)}>
            Save and close
          </button>
        </div>
      )}
    </div>
  );
}
