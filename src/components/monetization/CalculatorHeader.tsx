'use client';

import { usePreferences } from '@/components/AppPreferencesProvider';
import { getMonetizationCopy } from '@/lib/monetization/i18n';

export function CalculatorHeader() {
  const { language } = usePreferences();
  const copy = getMonetizationCopy(language).calculator;
  return (
    <>
      <h1 className="font-heading text-4xl font-bold text-premium">{copy.title}</h1>
      <p className="mt-4 max-w-3xl text-muted">{copy.intro}</p>
    </>
  );
}
