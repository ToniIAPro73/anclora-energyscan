'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { getMonetizationCopy } from '@/lib/monetization/i18n';

const SERVICES = [
  'CEE', 'AUDIT', 'WINDOWS', 'INSULATION', 'HVAC', 'SOLAR', 'REFORM', 'REAL_ESTATE_VALUATION', 'OTHER',
] as const;

export function IncludeInMarketplaceButton({ assessmentId }: { assessmentId: string }) {
  const { language } = usePreferences();
  const copy = getMonetizationCopy(language).professional;

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consentChecked) { setError(copy.includeConsentRequired); return; }
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/professional/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId,
          clientName: String(form.get('clientName') || ''),
          clientEmail: String(form.get('clientEmail') || ''),
          clientPhone: String(form.get('clientPhone') || '') || undefined,
          requestedService: String(form.get('requestedService') || '') || undefined,
          consentConfirmed: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'already_registered') { setError(copy.includeAlreadyDone); return; }
        throw new Error(data.error || copy.includeError);
      }
      setDone(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.includeError);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00DC82]/15 px-3 py-1.5 text-xs font-bold text-[#00DC82]">
        <Users className="h-3 w-3" />
        {copy.includeSuccess}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#00DC82]/30 px-4 py-2 text-xs font-bold text-[#00DC82] hover:bg-[#00DC82]/10"
      >
        <Users className="h-3 w-3" />
        {copy.includeInMarketplaceBtn}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A1F14] p-6 shadow-2xl">
            <h2 className="font-heading text-xl font-bold text-premium">{copy.includeModalTitle}</h2>
            <p className="mt-2 text-sm text-muted">{copy.includeModalIntro}</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input
                name="clientName"
                required
                placeholder={copy.includeClientName}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-premium placeholder:text-muted"
              />
              <input
                name="clientEmail"
                type="email"
                required
                placeholder={copy.includeClientEmail}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-premium placeholder:text-muted"
              />
              <input
                name="clientPhone"
                type="tel"
                placeholder={copy.includeClientPhone}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-premium placeholder:text-muted"
              />
              <select
                name="requestedService"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-premium"
              >
                <option value="">{copy.includeRequestedService}</option>
                {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#00DC82]"
                />
                <span className="text-xs text-muted leading-relaxed">{copy.includeConsentCheck}</span>
              </label>

              {error && <p className="text-xs text-[#EF4444]">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-[#00DC82] py-2.5 text-sm font-bold text-[#07140f] disabled:opacity-60"
                >
                  {submitting ? copy.includeSubmitting : copy.includeSubmit}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-bold text-muted"
                >
                  ✕
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
