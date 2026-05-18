'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { calculateSavingsRange } from '@/lib/calculator/savings';
import { trackEvent } from '@/lib/analytics';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { getMonetizationCopy } from '@/lib/monetization/i18n';

export function SavingsCalculator() {
  const { language } = usePreferences();
  const copy = getMonetizationCopy(language).calculator;
  const [result, setResult] = useState<ReturnType<typeof calculateSavingsRange> | null>(null);
  const [error, setError] = useState('');
  const [monthlySpendHelpOpen, setMonthlySpendHelpOpen] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const next = calculateSavingsRange({
        propertyType: String(form.get('propertyType') || 'flat') as 'flat',
        area: Number(form.get('area')),
        currentLetter: String(form.get('currentLetter') || 'E') as 'E',
        measure: String(form.get('measure') || 'insulation') as 'insulation',
        monthlySpend: Number(form.get('monthlySpend')),
        city: String(form.get('city') || ''),
      });
      setResult(next);
      setError('');
      trackEvent('calculator_used', {
        propertyType: next.input.propertyType,
        currentLetter: next.input.currentLetter,
        measure: next.input.measure,
        source: 'public_calculator',
      });
    } catch {
      setError(copy.invalid);
    }
  }

  return (
    <section className="surface border rounded-3xl p-6 lg:p-8">
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <select name="propertyType" className="rounded-xl border border-white/10 bg-black/20 p-3">
          <option value="flat">{copy.propertyFlat}</option>
          <option value="house">{copy.propertyHouse}</option>
          <option value="terraced">{copy.propertyTerraced}</option>
        </select>
        <input name="area" type="number" min="20" max="600" placeholder={copy.areaPlaceholder} className="rounded-xl border border-white/10 bg-black/20 p-3" />
        <select name="currentLetter" className="rounded-xl border border-white/10 bg-black/20 p-3">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) => <option key={letter}>{letter}</option>)}
        </select>
        <select name="measure" className="rounded-xl border border-white/10 bg-black/20 p-3">
          <option value="windows">{copy.measureWindows}</option>
          <option value="insulation">{copy.measureInsulation}</option>
          <option value="heat_pump">{copy.measureHeatPump}</option>
          <option value="pv">{copy.measurePv}</option>
          <option value="deep_retrofit">{copy.measureDeepRetrofit}</option>
        </select>
        <div className="relative md:col-span-2">
          <input
            name="monthlySpend"
            type="number"
            min="20"
            max="2000"
            placeholder={copy.monthlySpendPlaceholder}
            aria-describedby="monthly-spend-help"
            className="w-full rounded-xl border border-white/10 bg-black/20 p-3 pr-12"
          />
          <button
            type="button"
            aria-label={copy.monthlySpendHelpLabel}
            aria-expanded={monthlySpendHelpOpen}
            aria-controls="monthly-spend-help"
            onClick={() => setMonthlySpendHelpOpen((open) => !open)}
            className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-[#00DC82]/50 hover:text-[#00DC82] focus:outline-none focus:ring-2 focus:ring-[#00DC82]/40"
          >
            <Info className="h-4 w-4" />
          </button>
          {monthlySpendHelpOpen && (
            <div id="monthly-spend-help" role="status" className="monthly-spend-help absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-[#00DC82]/30 bg-[#07140f] p-4 text-sm text-[#d8e7df] shadow-2xl shadow-black/40">
              <p className="font-heading font-bold text-[#00DC82]">{copy.monthlySpendHelpTitle}</p>
              <p className="mt-2 text-muted">{copy.monthlySpendHelpText}</p>
            </div>
          )}
        </div>
        <button className="min-h-12 rounded-full bg-[#00DC82] px-6 font-bold text-[#07140f] md:col-span-2">{copy.submit}</button>
      </form>
      {error && <p className="mt-4 text-sm text-[#EF4444]">{error}</p>}
      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-muted">{copy.annualSavings}</p><p className="font-heading text-xl font-bold">{result.annualSavingsRange[0]} - {result.annualSavingsRange[1]} EUR</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-muted">{copy.estimatedCost}</p><p className="font-heading text-xl font-bold">{result.costRange[0]} - {result.costRange[1]} EUR</p></div>
            <div className="rounded-2xl bg-white/5 p-4"><p className="text-xs text-muted">{copy.payback}</p><p className="font-heading text-xl font-bold">{result.paybackYearsRange[0]} - {result.paybackYearsRange[1]} {copy.years}</p></div>
            <p className="md:col-span-3 text-xs text-muted">{result.disclaimer}</p>
          </div>

          <div className="rounded-2xl border border-[#00DC82]/30 bg-[#00DC82]/5 p-5">
            <p className="font-heading text-lg font-bold text-premium">{copy.upsellTitle}</p>
            <p className="mt-2 text-sm text-muted">{copy.upsellCopy}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/wizard?source=calculator"
                onClick={() => trackEvent('seo_cta_clicked', { source: 'calculator_upsell_free' })}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#00DC82] px-6 py-2.5 font-bold text-[#07140f]"
              >
                {copy.upsellCta}
              </Link>
              <Link
                href="/wizard?source=calculator&premium=1"
                onClick={() => trackEvent('seo_cta_clicked', { source: 'calculator_upsell_premium' })}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#00DC82]/40 px-6 py-2.5 font-bold text-[#00DC82] hover:bg-[#00DC82]/10"
              >
                {copy.upsellPremiumCta}
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">{copy.upsellLegal}</p>
          </div>
        </div>
      )}
    </section>
  );
}
