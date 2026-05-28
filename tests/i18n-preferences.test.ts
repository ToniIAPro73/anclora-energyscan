import { dictionaries, getLegalDisclaimer } from '../src/lib/i18n';
import {
  ACTIVE_APP_LOCALES,
  ANCLORA_LOCALE_META,
  getLanguageToggleMode,
  PREMIUM_LOCALES,
  resolveInitialLocale,
} from '../src/lib/anclora-language-toggle';

describe('i18n dictionaries', () => {
  it('keeps main dictionaries aligned across public languages', () => {
    const esKeys = Object.keys(dictionaries.es).sort();
    expect(Object.keys(dictionaries.en).sort()).toEqual(esKeys);
    expect(Object.keys(dictionaries.de).sort()).toEqual(esKeys);
  });

  it('keeps the official CEE disclaimer explicit in every language', () => {
    expect(getLegalDisclaimer('es')).toContain('Certificado de Eficiencia Energética oficial');
    expect(getLegalDisclaimer('en')).toContain('official Energy Performance Certificate');
    expect(getLegalDisclaimer('de')).toContain('offiziellen Energieausweis');
  });

  it('declares all 7 Premium locales active in governance order', () => {
    expect(PREMIUM_LOCALES).toEqual(['es', 'ca', 'en', 'de', 'fr', 'it', 'pt']);
    expect(ACTIVE_APP_LOCALES).toEqual(['es', 'ca', 'en', 'de', 'fr', 'it', 'pt']);
    expect(ANCLORA_LOCALE_META.ca.status).toBe('active');
    expect(ANCLORA_LOCALE_META.fr.status).toBe('active');
  });

  it('resolves initial locale without invasive geolocation', () => {
    expect(resolveInitialLocale({ browserLocales: ['en-US'] })).toBe('en');
    expect(resolveInitialLocale({ browserLocales: ['de-CH'] })).toBe('de');
    expect(resolveInitialLocale({ persistedLocale: 'de', browserLocales: ['en-US'] })).toBe('de');
    expect(resolveInitialLocale({ urlLocale: 'en', persistedLocale: 'de' })).toBe('en');
    // fr, ca and pt are now active Premium locales — resolveInitialLocale returns them directly
    expect(resolveInitialLocale({ urlLocale: 'fr-CH', persistedLocale: 'ca', browserLocales: ['pt-PT'] })).toBe('fr');
    expect(resolveInitialLocale({ persistedLocale: 'ca', browserLocales: ['en-US'] })).toBe('ca');
    expect(resolveInitialLocale({ browserLocales: ['pt-PT'] })).toBe('pt');
  });

  it('requires modal or popover for Premium language governance', () => {
    expect(getLanguageToggleMode()).toBe('modal-popover');
  });
});
