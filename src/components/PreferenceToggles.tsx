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

const preferenceCopy: Record<ActiveAncloraLocale, {
  trigger: string;
  dialog: string;
  eyebrow: string;
  close: string;
  language: string;
  currency: string;
  units: string;
  pending: string;
  save: string;
  currencies: Record<AppCurrency, string>;
  unitsMap: Record<MeasurementSystem, string>;
}> = {
  es: {
    trigger: 'Preferencias globales',
    dialog: 'Ajustes de preferencias globales',
    eyebrow: 'Ajustes',
    close: 'Cerrar preferencias',
    language: 'Idioma',
    currency: 'Moneda',
    units: 'Unidades de medida',
    pending: 'Localización pendiente',
    save: 'Guardar y cerrar',
    currencies: {
      EUR: 'Euro',
      USD: 'Dólar estadounidense',
      GBP: 'Libra esterlina',
      CHF: 'Franco suizo',
      SEK: 'Corona sueca',
      DKK: 'Corona danesa',
      NOK: 'Corona noruega',
    },
    unitsMap: {
      metric: 'Metro cuadrado - m² / Hectárea - ha',
      imperial: 'Pie cuadrado - ft² / Acre - ac',
    },
  },
  en: {
    trigger: 'Global preferences',
    dialog: 'Global preferences settings',
    eyebrow: 'Settings',
    close: 'Close preferences',
    language: 'Language',
    currency: 'Currency',
    units: 'Measure units',
    pending: 'Localization pending',
    save: 'Save and close',
    currencies: {
      EUR: 'Euro',
      USD: 'US dollar',
      GBP: 'Pound sterling',
      CHF: 'Swiss franc',
      SEK: 'Swedish krona',
      DKK: 'Danish krone',
      NOK: 'Norwegian krone',
    },
    unitsMap: {
      metric: 'Square meter - m² / Hectare - ha',
      imperial: 'Square foot - ft² / Acre - ac',
    },
  },
  de: {
    trigger: 'Globale Einstellungen',
    dialog: 'Globale Präferenzeinstellungen',
    eyebrow: 'Einstellungen',
    close: 'Einstellungen schließen',
    language: 'Sprache',
    currency: 'Währung',
    units: 'Maßeinheiten',
    pending: 'Lokalisierung ausstehend',
    save: 'Speichern und schließen',
    currencies: {
      EUR: 'Euro',
      USD: 'US-Dollar',
      GBP: 'Pfund Sterling',
      CHF: 'Schweizer Franken',
      SEK: 'Schwedische Krone',
      DKK: 'Dänische Krone',
      NOK: 'Norwegische Krone',
    },
    unitsMap: {
      metric: 'Quadratmeter - m² / Hektar - ha',
      imperial: 'Quadratfuß - ft² / Acre - ac',
    },
  },
  ca: {
    trigger: 'Preferències globals',
    dialog: 'Ajustos de preferències globals',
    eyebrow: 'Ajustos',
    close: 'Tancar preferències',
    language: 'Idioma',
    currency: 'Moneda',
    units: 'Unitats de mesura',
    pending: 'Localització pendent',
    save: 'Desar i tancar',
    currencies: {
      EUR: 'Euro',
      USD: 'Dòlar estatunidenc',
      GBP: 'Lliura esterlina',
      CHF: 'Franc suís',
      SEK: 'Corona sueca',
      DKK: 'Corona danesa',
      NOK: 'Corona noruega',
    },
    unitsMap: {
      metric: 'Metre quadrat - m² / Hectàrea - ha',
      imperial: 'Peu quadrat - ft² / Acre - ac',
    },
  },
  fr: {
    trigger: 'Préférences globales',
    dialog: 'Paramètres des préférences globales',
    eyebrow: 'Paramètres',
    close: 'Fermer les préférences',
    language: 'Langue',
    currency: 'Devise',
    units: 'Unités de mesure',
    pending: 'Localisation en attente',
    save: 'Enregistrer et fermer',
    currencies: {
      EUR: 'Euro',
      USD: 'Dollar américain',
      GBP: 'Livre sterling',
      CHF: 'Franc suisse',
      SEK: 'Couronne suédoise',
      DKK: 'Couronne danoise',
      NOK: 'Couronne norvégienne',
    },
    unitsMap: {
      metric: 'Mètre carré - m² / Hectare - ha',
      imperial: 'Pied carré - ft² / Acre - ac',
    },
  },
  it: {
    trigger: 'Preferenze globali',
    dialog: 'Impostazioni preferenze globali',
    eyebrow: 'Impostazioni',
    close: 'Chiudi preferenze',
    language: 'Lingua',
    currency: 'Valuta',
    units: 'Unità di misura',
    pending: 'Localizzazione in attesa',
    save: 'Salva e chiudi',
    currencies: {
      EUR: 'Euro',
      USD: 'Dollaro americano',
      GBP: 'Sterlina britannica',
      CHF: 'Franco svizzero',
      SEK: 'Corona svedese',
      DKK: 'Corona danese',
      NOK: 'Corona norvegese',
    },
    unitsMap: {
      metric: 'Metro quadrato - m² / Ettaro - ha',
      imperial: 'Piede quadrato - ft² / Acro - ac',
    },
  },
  pt: {
    trigger: 'Preferências globais',
    dialog: 'Definições de preferências globais',
    eyebrow: 'Definições',
    close: 'Fechar preferências',
    language: 'Idioma',
    currency: 'Moeda',
    units: 'Unidades de medida',
    pending: 'Localização pendente',
    save: 'Guardar e fechar',
    currencies: {
      EUR: 'Euro',
      USD: 'Dólar americano',
      GBP: 'Libra esterlina',
      CHF: 'Franco suíço',
      SEK: 'Coroa sueca',
      DKK: 'Coroa dinamarquesa',
      NOK: 'Coroa norueguesa',
    },
    unitsMap: {
      metric: 'Metro quadrado - m² / Hectare - ha',
      imperial: 'Pé quadrado - ft² / Acre - ac',
    },
  },
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
  const copy = preferenceCopy[language];

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
        aria-label={copy.trigger}
      >
        <Globe className="h-3.5 w-3.5 text-[#00DC82]" aria-hidden="true" />
        <span className="truncate">{compact ? `${selected.nativeName} · ${currency} · ${measurementLabels[measurementSystem]}` : summary}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="surface absolute right-0 top-[calc(100%+0.6rem)] z-[8700] w-[min(22rem,calc(100vw-2rem))] rounded-3xl border p-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
          role="dialog"
          aria-label={copy.dialog}
        >
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{copy.eyebrow}</p>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-premium" aria-label={copy.close}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">{copy.language}</p>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as ActiveAncloraLocale)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-premium"
            aria-label={copy.language}
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
                  {meta.nativeName} - {meta.englishName}{active ? '' : ` - ${copy.pending}`}
                </option>
              );
            })}
          </select>

          <p className="mb-2 mt-4 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">{copy.currency}</p>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as AppCurrency)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-premium"
            aria-label={copy.currency}
          >
            {currencies.map((item) => (
              <option key={item} value={item}>
                {copy.currencies[item]} - {item} {currencyLabels[item].symbol}
              </option>
            ))}
          </select>

          <p className="mb-2 mt-4 px-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">{copy.units}</p>
          <select
            value={measurementSystem}
            onChange={(event) => setMeasurementSystem(event.target.value as MeasurementSystem)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-premium"
            aria-label={copy.units}
          >
            {measurementSystems.map((item) => (
              <option key={item} value={item}>
                {copy.unitsMap[item]}
              </option>
            ))}
          </select>

          <button type="button" className="mt-4 w-full rounded-2xl bg-[#00DC82] px-4 py-2 text-sm font-black text-[#06130f]" onClick={() => setOpen(false)}>
            {copy.save}
          </button>
        </div>
      )}
    </div>
  );
}
