'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { calculateSavingsRange, HEATING_SYSTEMS } from '@/lib/calculator/savings';
import { trackEvent } from '@/lib/analytics';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import { BillImporter, type SerializableBill } from '@/components/monetization/BillImporter';
import { convertCurrencyFromEur, convertCurrencyToEur } from '@/lib/formatters';

type HeatingSystem = (typeof HEATING_SYSTEMS)[number];

const QUALITY_COLORS: Record<'basic' | 'enhanced' | 'full', string> = {
  basic: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  enhanced: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  full: 'bg-[#00DC82]/20 text-[#00DC82] border-[#00DC82]/30',
};

export function SavingsCalculator() {
  const { language, currency, formatCurrency, formatArea, formatNumber } = usePreferences();
  const copy = getMonetizationCopy(language).calculator;

  const [result, setResult] = useState<ReturnType<typeof calculateSavingsRange> | null>(null);
  const [error, setError] = useState('');
  const [monthlySpendHelpOpen, setMonthlySpendHelpOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [billImportOpen, setBillImportOpen] = useState(false);
  const [billsMonthlySpend, setBillsMonthlySpend] = useState<number | null>(null);
  const [selectedMeasure, setSelectedMeasure] = useState('insulation');
  const [area, setArea] = useState('');
  const [currentLetter, setCurrentLetter] = useState('E');

  // Optional field tracking for badge count
  const [constructionYear, setConstructionYear] = useState('');
  const [occupants, setOccupants] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [heatingSystem, setHeatingSystem] = useState<HeatingSystem | ''>('');

  const filledOptionalCount = [constructionYear, occupants, zipCode, heatingSystem].filter(
    (v) => v !== '',
  ).length;

  const measureLabels = {
    windows: copy.measureWindows,
    insulation: copy.measureInsulation,
    heat_pump: copy.measureHeatPump,
    pv: copy.measurePv,
    deep_retrofit: copy.measureDeepRetrofit,
  } as const;

  const activeMeasureLabel = measureLabels[selectedMeasure as keyof typeof measureLabels] ?? copy.measureInsulation;
  const parsedArea = Number(area);
  const hasAreaContext = Number.isFinite(parsedArea) && parsedArea >= 20;
  const monthlySpendCurrencyLabel = currency === 'GBP' ? '£' : '€';
  const monthlySpendMin = Math.ceil(convertCurrencyFromEur(20, currency));
  const monthlySpendMax = Math.floor(convertCurrencyFromEur(2000, currency));
  const monthlySpendInputValue =
    billsMonthlySpend !== null ? Math.round(convertCurrencyFromEur(billsMonthlySpend, currency)) : undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const next = calculateSavingsRange({
        propertyType: String(form.get('propertyType') || 'flat') as 'flat',
        area: Number(form.get('area')),
        currentLetter: String(form.get('currentLetter') || 'E') as 'E',
        measure: String(form.get('measure') || 'insulation') as 'insulation',
        monthlySpend: billsMonthlySpend ?? convertCurrencyToEur(Number(form.get('monthlySpend')), currency),
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
    splits: copy.heatingSplits,
    heat_pump: copy.heatingHeatPump,
    oil_boiler: copy.heatingOilBoiler,
    pellets: copy.heatingPellets,
    district: copy.heatingDistrict,
    unknown: copy.heatingUnknown,
  };

  function formatMoneyRange(range: readonly [number, number]) {
    return `${formatCurrency(range[0], { maximumFractionDigits: 0 })} - ${formatCurrency(range[1], { maximumFractionDigits: 0 })}`;
  }

  function formatPaybackRange(range: readonly [number | null, number | null]) {
    if (range[0] === null || range[1] === null) return copy.paybackUnavailable;
    return `${range[0].toLocaleString(language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'es-ES')} - ${range[1].toLocaleString(language === 'en' ? 'en-GB' : language === 'de' ? 'de-DE' : 'es-ES')} ${copy.years}`;
  }

  function paybackFooter(category: ReturnType<typeof calculateSavingsRange>['paybackCategory']) {
    switch (category) {
      case 'fast': return copy.paybackFast;
      case 'reasonable': return copy.paybackReasonable;
      case 'long': return copy.paybackLong;
      case 'very_long': return copy.paybackVeryLong;
      case 'not_economic': return copy.paybackNotEconomic;
    }
  }

  function quickRead(category: ReturnType<typeof calculateSavingsRange>['paybackCategory']) {
    switch (category) {
      case 'fast': return copy.quickReadFast;
      case 'reasonable': return copy.quickReadReasonable;
      case 'long': return copy.quickReadLong;
      case 'very_long': return copy.quickReadVeryLong;
      case 'not_economic': return copy.quickReadNotEconomic;
    }
  }

  return (
    <section className="surface border rounded-3xl p-6 lg:p-8">
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="font-heading text-lg font-bold text-premium">{copy.purposeTitle}</p>
        <p className="mt-2 text-sm text-muted">{copy.purposeDescription}</p>
      </div>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <select name="propertyType" className="rounded-xl border border-white/10 bg-black/20 p-3">
          <option value="flat">{copy.propertyFlat}</option>
          <option value="house">{copy.propertyHouse}</option>
          <option value="terraced">{copy.propertyTerraced}</option>
        </select>
        <input name="area" type="number" min="20" max="600" placeholder={copy.areaPlaceholder} value={area} onChange={(event) => setArea(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 p-3" />
        <div className="flex flex-col gap-1">
          <label className="px-1 text-xs text-muted">{copy.currentLetterLabel}</label>
          <select name="currentLetter" value={currentLetter} onChange={(event) => setCurrentLetter(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <option value="E">{copy.letterUnknown}</option>
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) => (
              <option key={letter} value={letter}>{letter}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="px-1 text-xs text-muted">{copy.measureLabel}</label>
          <select name="measure" value={selectedMeasure} onChange={(event) => setSelectedMeasure(event.target.value)} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <option value="windows">{copy.measureWindows}</option>
            <option value="insulation">{copy.measureInsulation}</option>
            <option value="heat_pump">{copy.measureHeatPump}</option>
            <option value="pv">{copy.measurePv}</option>
            <option value="deep_retrofit">{copy.measureDeepRetrofit}</option>
          </select>
        </div>

        <p className="rounded-2xl border border-white/10 bg-black/10 p-3 text-sm text-muted md:col-span-2">
          {hasAreaContext
            ? copy.measureContext(activeMeasureLabel.toLowerCase(), formatArea(parsedArea), currentLetter)
            : copy.measureContextPending(activeMeasureLabel.toLowerCase())}
        </p>

        <div className="relative md:col-span-2">
          <label className="mb-1 block px-1 text-xs text-muted" htmlFor="monthlySpend">
            {copy.monthlySpendLabel.replace('€', monthlySpendCurrencyLabel)}
          </label>
          <input
            id="monthlySpend"
            name="monthlySpend"
            type="number"
            min={monthlySpendMin}
            max={monthlySpendMax}
            placeholder={copy.monthlySpendPlaceholder}
            aria-describedby="monthly-spend-help"
            defaultValue={monthlySpendInputValue}
            key={billsMonthlySpend ?? 'empty'}
            className={`w-full rounded-xl border p-3 pr-24 ${
              billsMonthlySpend !== null
                ? 'border-[#00DC82]/50 bg-[#00DC82]/5 text-[#00DC82]'
                : 'border-white/10 bg-black/20'
            }`}
          />
          <span className="pointer-events-none absolute right-12 top-[2.45rem] text-sm text-muted">
            {monthlySpendCurrencyLabel}/{language === 'en' ? 'month' : language === 'de' ? 'Monat' : 'mes'}
          </span>
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
            className="absolute right-3 top-[2.1rem] inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-muted transition hover:border-[#00DC82]/50 hover:text-[#00DC82] focus:outline-none focus:ring-2 focus:ring-[#00DC82]/40"
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
            <div className="flex flex-col gap-1">
              <label className="px-1 text-xs text-muted">{copy.heatingSystemLabel}</label>
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
            </div>

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
                  onBillsChange={(bills: SerializableBill[]) => {
                    try {
                      if (bills.length > 0) {
                        sessionStorage.setItem('enerscan_bills', JSON.stringify(bills));
                      } else {
                        sessionStorage.removeItem('enerscan_bills');
                      }
                    } catch { /* sessionStorage unavailable (SSR / private mode) */ }
                  }}
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
            {result.inputQuality === 'full' && (
              <span className="text-xs text-muted">{copy.qualityFullNote}</span>
            )}
          </div>

          <p className="font-heading text-lg font-bold text-premium">
            {copy.resultForMeasure(measureLabels[result.input.measure])}
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-heading text-sm font-bold">{copy.annualSavings}</p>
              <p className="mt-1 text-xs text-muted">{copy.annualSavingsSubtitle}</p>
              <p className="mt-3 font-heading text-xl font-bold">{formatMoneyRange(result.annualSavingsRange)}/{language === 'en' ? 'year' : language === 'de' ? 'Jahr' : 'año'}</p>
              <p className="mt-3 text-xs text-muted">
                {copy.annualSavingsFooter(
                  formatNumber(Math.round(result.estimatedSavingsRateRange[0] * 100)),
                  formatNumber(Math.round(result.estimatedSavingsRateRange[1] * 100)),
                )}
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-heading text-sm font-bold">{copy.estimatedCost}</p>
              <p className="mt-1 text-xs text-muted">{copy.estimatedCostSubtitle}</p>
              <p className="mt-3 font-heading text-xl font-bold">{formatMoneyRange(result.costRange)}</p>
              <p className="mt-3 text-xs text-muted">{copy.estimatedCostFooter}</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="font-heading text-sm font-bold">{copy.payback}</p>
              <p className="mt-1 text-xs text-muted">{copy.paybackSubtitle}</p>
              <p className="mt-3 font-heading text-xl font-bold">{formatPaybackRange(result.paybackYearsRange)}</p>
              <p className="mt-3 text-xs text-muted">{paybackFooter(result.paybackCategory)}</p>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((warning) => (
                <div key={warning} className="flex gap-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{copy.warnings[warning]}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="font-heading text-lg font-bold text-premium">{copy.quickReadTitle}</p>
            <p className="mt-2 text-sm text-muted">{quickRead(result.paybackCategory)}</p>
          </div>

          <details className="rounded-2xl border border-white/10 bg-black/10 p-5">
            <summary className="cursor-pointer font-heading text-base font-bold text-premium">{copy.assumptionsTitle}</summary>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>{copy.assumptionsMonthlySpend(formatCurrency(result.assumptionValues.monthlySpend, { maximumFractionDigits: 0 }), formatCurrency(result.annualSpend, { maximumFractionDigits: 0 }))}</li>
              <li>{copy.assumptionsMeasure(measureLabels[result.input.measure])}</li>
              <li>{copy.assumptionsArea(formatArea(result.input.area))}</li>
              <li>{copy.assumptionsSavingsRate(formatNumber(Math.round(result.estimatedSavingsRateRange[0] * 100)), formatNumber(Math.round(result.estimatedSavingsRateRange[1] * 100)))}</li>
              <li>{copy.assumptionsCostRate(formatCurrency(result.assumptionValues.costRateRange[0], { maximumFractionDigits: 0 }), formatCurrency(result.assumptionValues.costRateRange[1], { maximumFractionDigits: 0 }))}</li>
            </ul>
            <p className="mt-3 text-xs text-muted">{copy.assumptionsOptionalHint}</p>
            <p className="mt-2 text-xs text-muted">{result.disclaimer}</p>
          </details>

          {/* Upsell CTA — must remain prominent */}
          <div className="rounded-2xl border border-[#00DC82]/30 bg-[#00DC82]/5 p-5">
            <p className="font-heading text-lg font-bold text-premium">{copy.upsellTitle}</p>
            <p className="mt-2 text-sm text-muted">{copy.upsellCopy}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/wizard?source=calculator"
                onClick={() => trackEvent('seo_cta_clicked', { source: 'calculator_upsell_free' })}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#00DC82] px-6 py-2.5 text-center font-bold text-[#07140f] sm:w-auto"
              >
                {copy.upsellCta}
              </Link>
              <Link
                href="/pricing?source=calculator"
                onClick={() => trackEvent('seo_cta_clicked', { source: 'calculator_upsell_premium' })}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#00DC82]/40 px-6 py-2.5 text-center font-bold text-[#00DC82] hover:bg-[#00DC82]/10 sm:w-auto"
              >
                {copy.upsellPremiumCta}
              </Link>
              <Link
                href="/budget-review?source=calculator"
                onClick={() => trackEvent('seo_cta_clicked', { source: 'calculator_budget_review' })}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 px-6 py-2.5 text-center font-bold text-white hover:bg-white/10 sm:w-auto"
              >
                {copy.budgetReviewCta}
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">{copy.upsellLegal}</p>
          </div>
        </div>
      )}
    </section>
  );
}
