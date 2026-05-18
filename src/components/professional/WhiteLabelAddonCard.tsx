'use client';

import { useState } from 'react';
import { Palette } from 'lucide-react';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { getMonetizationCopy } from '@/lib/monetization/i18n';

export function WhiteLabelAddonCard() {
  const { language } = usePreferences();
  const copy = getMonetizationCopy(language).professional;

  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handleInterest() {
    setState('sending');
    try {
      const res = await fetch('/api/professional/addon/white-label-interest', { method: 'POST' });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#00DC82]/20 bg-[#00DC82]/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00DC82]/15">
          <Palette className="h-4 w-4 text-[#00DC82]" />
        </div>
        <div className="flex-1">
          <p className="font-heading text-sm font-bold text-premium">{copy.whiteLabelAddonTitle}</p>
          <p className="mt-1 text-xs text-muted">{copy.whiteLabelAddonDesc}</p>

          <ul className="mt-3 space-y-1">
            {copy.whiteLabelAddonFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-muted">
                <span className="mt-0.5 shrink-0 text-[#00DC82]">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-bold text-[#00DC82]">{copy.whiteLabelAddonPrice}</span>

            {state === 'done' ? (
              <span className="text-xs font-bold text-[#00DC82]">✓ {copy.whiteLabelAddonDone}</span>
            ) : (
              <button
                type="button"
                disabled={state === 'sending'}
                onClick={handleInterest}
                className="inline-flex min-h-9 items-center rounded-full bg-[#00DC82] px-5 py-2 text-xs font-bold text-[#07140f] disabled:opacity-60"
              >
                {state === 'sending' ? copy.whiteLabelAddonSending : copy.whiteLabelAddonCta}
              </button>
            )}
          </div>

          {state === 'error' && (
            <p className="mt-2 text-xs text-[#EF4444]">{copy.whiteLabelAddonError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
