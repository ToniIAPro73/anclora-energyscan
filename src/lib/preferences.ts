import { DEFAULT_APP_LOCALE, normalizeActiveLocale } from './anclora-language-toggle';

export type AppTheme = "dark" | "light" | "system";
export type ThemeMode = AppTheme;
export type AppLanguage = "es" | "en" | "de";
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
  language: DEFAULT_APP_LOCALE as AppLanguage,
  currency: "EUR",
  measurementSystem: "metric",
};

export const themeModes: AppTheme[] = ["dark", "light", "system"];
export const languages: AppLanguage[] = ["es", "en", "de"];
export const currencies: AppCurrency[] = ["EUR", "USD", "GBP", "CHF", "SEK", "DKK", "NOK"];
export const measurementSystems: MeasurementSystem[] = ["metric", "imperial"];

export const PREFERENCE_COOKIE_NAMES = {
  theme: "enerscan-theme",
  language: "enerscan-language",
  currency: "enerscan-currency",
  measurementSystem: "enerscan-measurement-system",
} as const;

export function getPreferencesForLanguage(language: AppLanguage): Pick<AppPreferences, "currency" | "measurementSystem"> {
  if (language === "en") return { currency: "GBP", measurementSystem: "imperial" };
  // ca, fr, it, pt: EUR + metric
  return { currency: "EUR", measurementSystem: "metric" };
}

export function normalizeTheme(value: unknown): AppTheme {
  return value === "light" || value === "system" ? value : DEFAULT_PREFERENCES.theme;
}

export function normalizeLanguage(value: unknown): AppLanguage {
  const locale = normalizeActiveLocale(value);
  if (locale === "es" || locale === "en" || locale === "de") return locale;
  if (locale === "ca") return "es";
  return "en"; // fr, it, pt → en for dictionary access
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
