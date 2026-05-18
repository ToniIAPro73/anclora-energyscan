'use client';

import { useRef, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import type { ParsedBillData } from '@/lib/ocr/bill-parser';

export interface BillImporterCopy {
  billElectricitySection: string;
  billGasSection: string;
  billAddBtn: string;
  billMaxReached: string;
  billProcessing: string;
  billAmountLabel: string;
  billConsumptionLabel: string;
  billDaysLabel: string;
  billDistributorLabel: string;
  billRemove: string;
  billErrorOcr: string;
  billMissingFields: string;
  billCalculateAvg: string;
  billAvgResult: (eur: number) => string;
  billApplied: string;
  billImportDesc: string;
}

export interface SerializableBill {
  supplyType: 'electricity' | 'gas';
  amountEur?: number;
  consumptionValue?: number; // kWh for electricity, m³ for gas
  billingDays?: number;
  distributorName?: string;
}

interface BillImporterProps {
  onMonthlySpendChange: (value: number) => void;
  onBillsChange?: (bills: SerializableBill[]) => void;
  copy: BillImporterCopy;
}

type BillEntry = {
  id: string;
  supplyType: 'electricity' | 'gas';
  status: 'idle' | 'processing' | 'done' | 'error';
  extracted: Partial<ParsedBillData>;
  // User-editable overrides for missing fields
  amountEur?: number;
  consumptionValue?: number;
  billingDays?: number;
};

const MAX_BILLS = 3;

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function getConsumptionValue(entry: BillEntry): number | undefined {
  if (entry.consumptionValue !== undefined) return entry.consumptionValue;
  if (entry.extracted.consumptionKwh !== undefined) return entry.extracted.consumptionKwh;
  if (entry.extracted.consumptionM3 !== undefined) return entry.extracted.consumptionM3;
  return undefined;
}

function getAmountEur(entry: BillEntry): number | undefined {
  return entry.amountEur ?? entry.extracted.amountEur;
}

function getBillingDays(entry: BillEntry): number | undefined {
  return entry.billingDays ?? entry.extracted.billingDays;
}

function computeMonthlyAmount(entry: BillEntry): number | undefined {
  const amount = getAmountEur(entry);
  if (amount === undefined) return undefined;
  const days = getBillingDays(entry) ?? 30;
  return amount / (days / 30.44);
}

function toSerializable(bills: BillEntry[]): SerializableBill[] {
  return bills
    .filter((b) => b.status !== 'error')
    .map((b) => ({
      supplyType: b.supplyType,
      amountEur: getAmountEur(b),
      consumptionValue: getConsumptionValue(b),
      billingDays: getBillingDays(b),
      distributorName: b.extracted.distributorName,
    }));
}

export function BillImporter({ onMonthlySpendChange, onBillsChange, copy }: BillImporterProps) {
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [avgResult, setAvgResult] = useState<number | null>(null);
  const electricityInputRef = useRef<HTMLInputElement>(null);
  const gasInputRef = useRef<HTMLInputElement>(null);

  const electricityBills = bills.filter((b) => b.supplyType === 'electricity');
  const gasBills = bills.filter((b) => b.supplyType === 'gas');

  function notifyBillsChange(nextBills: BillEntry[]) {
    onBillsChange?.(toSerializable(nextBills));
  }

  async function handleFileAdd(supplyType: 'electricity' | 'gas', file: File) {
    const id = generateId();
    const entry: BillEntry = {
      id,
      supplyType,
      status: 'processing',
      extracted: {},
    };
    const withEntry = (prev: BillEntry[]) => [...prev, entry];
    setBills(withEntry);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('supplyType', supplyType);

      const res = await fetch('/api/calculator/parse-bill', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json() as { ok: boolean; data?: ParsedBillData; error?: string };

      if (json.ok && json.data) {
        setBills((prev) => {
          const next = prev.map((b) =>
            b.id === id ? { ...b, status: 'done' as const, extracted: json.data! } : b,
          );
          notifyBillsChange(next);
          return next;
        });
      } else {
        setBills((prev) => {
          const next = prev.map((b) => (b.id === id ? { ...b, status: 'error' as const } : b));
          notifyBillsChange(next);
          return next;
        });
      }
    } catch {
      setBills((prev) => {
        const next = prev.map((b) => (b.id === id ? { ...b, status: 'error' as const } : b));
        notifyBillsChange(next);
        return next;
      });
    }
  }

  function handleFileInput(supplyType: 'electricity' | 'gas', files: FileList | null) {
    if (!files) return;
    const current = bills.filter((b) => b.supplyType === supplyType).length;
    const remaining = MAX_BILLS - current;
    const toProcess = Array.from(files).slice(0, remaining);
    for (const file of toProcess) {
      handleFileAdd(supplyType, file);
    }
  }

  function removeBill(id: string) {
    setBills((prev) => {
      const next = prev.filter((b) => b.id !== id);
      notifyBillsChange(next);
      return next;
    });
    setAvgResult(null);
  }

  function updateBillField(id: string, field: 'amountEur' | 'consumptionValue' | 'billingDays', raw: string) {
    const value = raw === '' ? undefined : parseFloat(raw);
    setBills((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, [field]: value } : b));
      notifyBillsChange(next);
      return next;
    });
  }

  function calculateAvg() {
    const billsWithAmount = bills.filter((b) => getAmountEur(b) !== undefined);
    if (billsWithAmount.length === 0) return;

    const total = billsWithAmount.reduce((sum, b) => {
      const monthly = computeMonthlyAmount(b);
      return sum + (monthly ?? 0);
    }, 0);

    setAvgResult(total);
    onMonthlySpendChange(total);
  }

  const hasEnoughForCalc = bills.some((b) => getAmountEur(b) !== undefined);

  function renderBillList(filtered: BillEntry[], supplyType: 'electricity' | 'gas') {
    const maxReached = filtered.length >= MAX_BILLS;
    const inputRef = supplyType === 'electricity' ? electricityInputRef : gasInputRef;

    return (
      <div className="flex flex-col gap-3">
        {filtered.map((bill) => (
          <div key={bill.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
            <div className="mb-2 flex items-center gap-2">
              {bill.status === 'processing' && (
                <Loader2 className="h-4 w-4 animate-spin text-[#00DC82]" />
              )}
              {bill.status === 'done' && (
                <CheckCircle2 className="h-4 w-4 text-[#00DC82]" />
              )}
              {bill.status === 'error' && (
                <XCircle className="h-4 w-4 text-[#EF4444]" />
              )}
              <span className="text-xs text-muted">
                {bill.status === 'processing' ? copy.billProcessing : bill.extracted.distributorName ?? '—'}
              </span>
              <button
                type="button"
                onClick={() => removeBill(bill.id)}
                className="ml-auto text-muted hover:text-[#EF4444] transition"
                aria-label={copy.billRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {bill.status === 'error' && (
              <p className="mb-2 text-xs text-[#EF4444]">{copy.billErrorOcr}</p>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted">{copy.billAmountLabel}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  readOnly={bill.extracted.amountEur !== undefined}
                  value={getAmountEur(bill) ?? ''}
                  onChange={(e) => updateBillField(bill.id, 'amountEur', e.target.value)}
                  placeholder="—"
                  className={`mt-0.5 w-full rounded-lg border p-1.5 text-xs ${
                    bill.extracted.amountEur !== undefined
                      ? 'border-white/10 bg-black/30 text-white/70'
                      : 'border-[#00DC82]/40 bg-black/20'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-muted">{copy.billConsumptionLabel}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  readOnly={getConsumptionValue(bill) !== undefined && bill.consumptionValue === undefined}
                  value={getConsumptionValue(bill) ?? ''}
                  onChange={(e) => updateBillField(bill.id, 'consumptionValue', e.target.value)}
                  placeholder="—"
                  className={`mt-0.5 w-full rounded-lg border p-1.5 text-xs ${
                    getConsumptionValue(bill) !== undefined && bill.consumptionValue === undefined
                      ? 'border-white/10 bg-black/30 text-white/70'
                      : 'border-[#00DC82]/40 bg-black/20'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs text-muted">{copy.billDaysLabel}</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="400"
                  readOnly={bill.extracted.billingDays !== undefined}
                  value={getBillingDays(bill) ?? ''}
                  onChange={(e) => updateBillField(bill.id, 'billingDays', e.target.value)}
                  placeholder="30"
                  className={`mt-0.5 w-full rounded-lg border p-1.5 text-xs ${
                    bill.extracted.billingDays !== undefined
                      ? 'border-white/10 bg-black/30 text-white/70'
                      : 'border-[#00DC82]/40 bg-black/20'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFileInput(supplyType, e.target.files)}
        />
        {maxReached ? (
          <p className="text-xs text-muted">{copy.billMaxReached}</p>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-dashed border-white/20 p-3 text-xs text-muted transition hover:border-[#00DC82]/40 hover:text-[#00DC82]"
          >
            + {copy.billAddBtn}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted">{copy.billImportDesc}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#00DC82]">{copy.billElectricitySection}</p>
          {renderBillList(electricityBills, 'electricity')}
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-[#00DC82]">{copy.billGasSection}</p>
          {renderBillList(gasBills, 'gas')}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!hasEnoughForCalc}
          onClick={calculateAvg}
          className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold transition hover:bg-[#00DC82]/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copy.billCalculateAvg}
        </button>
        {avgResult !== null && (
          <p className="text-sm font-semibold text-[#00DC82]">
            {copy.billAvgResult(avgResult)}
          </p>
        )}
      </div>
    </div>
  );
}
