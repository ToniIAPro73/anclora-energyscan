import { ActiveAncloraLocale, normalizeActiveLocale } from './anclora-language-toggle';

export type AppTheme = "dark" | "light" | "system";
export type ThemeMode = AppTheme;
/** 3-locale type for dictionary access. The user's full selection is stored separately. */
export type AppLanguage = "es" | "en" | "de";
/** 7-locale type used by the PDF and document layer — covers all active app locales. */
export type PdfLanguage = "es" | "ca" | "en" | "de" | "fr" | "it" | "pt";
export type AppCurrency = "EUR" | "USD" | "GBP" | "CHF" | "SEK" | "DKK" | "NOK";
export type MeasurementSystem = "metric" | "imperial";

export type AppPreferences = {
  theme: AppTheme;
  language: AppLanguage;
  currency: AppCurrency;
  measurementSystem: MeasurementSystem;
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: "dark",
  language: "es",
  currency: "EUR",
  measurementSystem: "metric",
};

export const themeModes: AppTheme[] = ["dark", "light", "system"];
export const languages: ActiveAncloraLocale[] = ["es", "ca", "en", "de", "fr", "it", "pt"];
export const currencies: AppCurrency[] = ["EUR", "USD", "GBP", "CHF", "SEK", "DKK", "NOK"];
export const measurementSystems: MeasurementSystem[] = ["metric", "imperial"];

export const PREFERENCE_COOKIE_NAMES = {
  theme: "enerscan-theme",
  language: "enerscan-language",
  currency: "enerscan-currency",
  measurementSystem: "enerscan-measurement-system",
} as const;

/** Maps a full Premium locale to AppLanguage for dictionary access. */
export function toDictLanguage(lang: ActiveAncloraLocale): AppLanguage {
  if (lang === "es" || lang === "en" || lang === "de") return lang;
  if (lang === "ca") return "es";
  return "en"; // fr, it, pt → en
}

/** Maps any locale to PdfLanguage (all 7 supported). */
export function toPdfLanguage(lang: unknown): PdfLanguage {
  const valid: PdfLanguage[] = ["es", "ca", "en", "de", "fr", "it", "pt"];
  return valid.includes(lang as PdfLanguage) ? (lang as PdfLanguage) : "es";
}

export function getPreferencesForLanguage(language: ActiveAncloraLocale): Pick<AppPreferences, "currency" | "measurementSystem"> {
  if (language === "en") return { currency: "GBP", measurementSystem: "imperial" };
  return { currency: "EUR", measurementSystem: "metric" };
}

export function normalizeTheme(value: unknown): AppTheme {
  return value === "light" || value === "system" ? value : DEFAULT_PREFERENCES.theme;
}

/** Returns the AppLanguage (es/en/de) for dictionary access. */
export function normalizeLanguage(value: unknown): AppLanguage {
  const locale = normalizeActiveLocale(value);
  return toDictLanguage(locale);
}

/** Returns the full ActiveAncloraLocale including ca/fr/it/pt. */
export function normalizeSelectedLocale(value: unknown): ActiveAncloraLocale {
  return normalizeActiveLocale(value);
}

export function normalizeCurrency(value: unknown): AppCurrency {
  return typeof value === "string" && (currencies as string[]).includes(value) ? value as AppCurrency : DEFAULT_PREFERENCES.currency;
}

export function normalizeMeasurementSystem(value: unknown): MeasurementSystem {
  return value === "imperial" ? "imperial" : DEFAULT_PREFERENCES.measurementSystem;
}

export function normalizePreferences(value: Partial<Record<keyof AppPreferences, unknown>>): AppPreferences {
  return {
    theme: normalizeTheme(value.theme),
    language: normalizeLanguage(value.language),
    currency: normalizeCurrency(value.currency),
    measurementSystem: normalizeMeasurementSystem(value.measurementSystem),
  };
}
