import { dictionaries } from './i18n';
import type { Dictionary } from './i18n';
import { dictionaryCA } from './i18n-ca';
import { dictionaryFR } from './i18n-fr';
import { dictionaryIT } from './i18n-it';
import { dictionaryPT } from './i18n-pt';

export type ExtendedLocale = 'es' | 'ca' | 'en' | 'de' | 'fr' | 'it' | 'pt';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extendedDictionaries = {
  es: dictionaries.es as unknown as Dictionary,
  ca: dictionaryCA,
  en: dictionaries.en as unknown as Dictionary,
  de: dictionaries.de as unknown as Dictionary,
  fr: dictionaryFR,
  it: dictionaryIT,
  pt: dictionaryPT,
};

export function getExtendedDictionary(locale: string): Dictionary {
  const key = (locale.slice(0, 2).toLowerCase()) as ExtendedLocale;
  return extendedDictionaries[key] ?? dictionaries.en;
}
