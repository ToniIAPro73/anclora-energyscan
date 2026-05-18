'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { calculateSavingsRange, HEATING_SYSTEMS } from '@/lib/calculator/savings';
import { trackEvent } from '@/lib/analytics';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import { BillImporter } from '@/components/monetization/BillImporter';

type HeatingSystem = (typeof HEATING_SYSTEMS)[number];

const QUALITY_COLORS: Record<'basic' | 'enhanced' | 'full', string> = {
  basic: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  enhanced: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  full: 'bg-[#00DC82]/20 text-[#00DC82] border-[#00DC82]/30',
};

export function SavingsCalculator() {
  const { language } = usePreferences();
  const copy = getMonetizationCopy(language).calculator;

  const [result, setResult] = useState<ReturnType<typeof calculateSavingsRange> | null>(null);
  const [error, setError] = useState('');
  const [monthlySpendHelpOpen, setMonthlySpendHelpOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [billImportOpen, setBillImportOpen] = useState(false);
  const [billsMonthlySpend, setBillsMonthlySpend] = useState<number | null>(null);

  // Optional field tracking for badge count
  const [constructionYear, setConstructionYear] = useState('');
  const [occupants, setOccupants] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [heatingSystem, setHeatingSystem] = useState<HeatingSystem | ''>('');

  const filledOptionalCount = [constructionYear, occupants, zipCode, heatingSystem].filter(
    (v) => v !== '',
  ).length;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const next = calculateSavingsRange({
        propertyType: String(form.get('propertyType') || 'flat') as 'flat',
        area: Number(form.get('area')),
        currentLetter: String(form.get('currentLetter') || 'E') as 'E',
        measure: String(form.get('measure') || 'insulation') as 'insulation',
        monthlySpend: billsMonthlySpend ?? Number(form.get('monthlySpend')),
        city: String(form.get('city') || ''),
        constructionYear: constructionYear ? Number(constructionYear) : undefined,
        occupants: occupants ? Number(occupants) : undefined,
        zipCode: zipCode || undefined,
        heatingSystem: (heatingSystem as HeatingSystem) || undefined,
      });
      setResult(next);
      setError('');
      trackEvent('calculator_used', {
        propertyType: next.input.propertyType,
        currentLetter: next.input.currentLetter,
        measure: next.input.measure,
        source: 'public_calculator',
        inputQuality: next.inputQuality,
      });
    } catch {
      setError(copy.invalid);
    }
  }

  const heatingSystemLabels: Record<HeatingSystem, string> = {
    gas_boiler: copy.heatingGasBoiler,
    electric_resistance: copy.heatingElectricResistance,
    heat_pump: copy.heatingHeatPump,
    oil_boiler: copy.heatingOilBoiler,
    pellets: copy.heatingPellets,
    district: copy.heatingDistrict,
    unknown: copy.heatingUnknown,
  };

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
            defaultValue={billsMonthlySpend ?? undefined}
            key={billsMonthlySpend ?? 'empty'}
            className={`w-full rounded-xl border p-3 pr-12 ${
              billsMonthlySpend !== null
                ? 'border-[#00DC82]/50 bg-[#00DC82]/5 text-[#00DC82]'
                : 'border-white/10 bg-black/20'
            }`}
          />
          {billsMonthlySpend !== null && (
            <span className="absolute left-3 top-[calc(100%+2px)] text-xs text-[#00DC82]">
              {copy.billApplied}
            </span>
          )}
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

        {/* Advanced options toggle */}
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"
          >
            {advancedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {advancedOpen ? copy.advancedToggleClose : copy.advancedToggle}
            {!advancedOpen && filledOptionalCount > 0 && (
              <span className="ml-1 rounded-full bg-[#00DC82]/20 px-2 py-0.5 text-xs text-[#00DC82]">
                {copy.advancedFilledCount(filledOptionalCount)}
              </span>
            )}
          </button>
        </div>

        {advancedOpen && (
          <>
            <input
              type="number"
              min="1900"
              max="2026"
              placeholder={copy.constructionYearPlaceholder}
              value={constructionYear}
              onChange={(e) => setConstructionYear(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            />
            <input
              type="number"
              min="1"
              max="20"
              placeholder={copy.occupantsPlaceholder}
              value={occupants}
              onChange={(e) => setOccupants(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            />
            <input
              type="text"
              maxLength={10}
              placeholder={copy.zipCodePlaceholder}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            />
            <select
              value={heatingSystem}
              onChange={(e) => setHeatingSystem(e.target.value as HeatingSystem | '')}
              className="rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <option value="">{copy.heatingSystemDefault}</option>
              {HEATING_SYSTEMS.map((hs) => (
                <option key={hs} value={hs}>
                  {heatingSystemLabels[hs]}
                </option>
              ))}
            </select>

            {/* Bill importer toggle */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setBillImportOpen((o) => !o)}
                className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-white"
              >
                {billImportOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {billImportOpen ? copy.billImportToggleClose : copy.billImportToggle}
              </button>
            </div>

            {billImportOpen && (
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/10 p-4">
                <BillImporter
                  onMonthlySpendChange={(val) => setBillsMonthlySpend(Math.round(val))}
                  copy={copy}
                />
              </div>
            )}
          </>
        )}

        <button className="min-h-12 rounded-full bg-[#00DC82] px-6 font-bold text-[#07140f] md:col-span-2">
          {copy.submit}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-[#EF4444]">{error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Input quality badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${QUALITY_COLORS[result.inputQuality]}`}
            >
              {result.inputQuality === 'basic' && copy.qualityBasic}
              {result.inputQuality === 'enhanced' && copy.qualityEnhanced}
              {result.inputQuality === 'full' && copy.qualityFull}
            </span>
            {result.inputQuality !== 'full' && (
              <span className="text-xs text-muted">{copy.qualityHint}</span>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-muted">{copy.annualSavings}</p>
              <p className="font-heading text-xl font-bold">{result.annualSavingsRange[0]} - {result.annualSavingsRange[1]} EUR</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-muted">{copy.estimatedCost}</p>
              <p className="font-heading text-xl font-bold">{result.costRange[0]} - {result.costRange[1]} EUR</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-muted">{copy.payback}</p>
              <p className="font-heading text-xl font-bold">{result.paybackYearsRange[0]} - {result.paybackYearsRange[1]} {copy.years}</p>
            </div>
            <p className="md:col-span-3 text-xs text-muted">{result.disclaimer}</p>
          </div>

          {/* Upsell CTA — must remain prominent */}
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
