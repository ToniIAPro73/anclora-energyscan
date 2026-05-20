'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';

export function ProviderLinkUser({ providerId, labels }: {
  providerId: string;
  labels: { link: string; linking: string; linked: string; noUser: string; error: string };
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'linked' | 'no_user' | 'error'>('idle');

  async function handleLink() {
    setState('loading');
    try {
      const res = await fetch(`/api/admin/providers/${providerId}/link-user`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setState('linked');
      } else if (data.error === 'no_user_with_provider_email') {
        setState('no_user');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'linked') {
    return <span className="rounded-full bg-[#00DC82]/20 px-3 py-1 text-xs font-bold text-[#00DC82]">{labels.linked}</span>;
  }
  if (state === 'no_user') {
    return <span className="rounded-full bg-[#FFB020]/20 px-3 py-1 text-xs font-bold text-[#FFB020]">{labels.noUser}</span>;
  }
  if (state === 'error') {
    return <span className="rounded-full bg-[#EF4444]/20 px-3 py-1 text-xs font-bold text-[#EF4444]">{labels.error}</span>;
  }

  return (
    <button
      type="button"
      onClick={handleLink}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#FFB020]/40 bg-[#FFB020]/10 px-3 py-1 text-xs font-bold text-[#FFB020] transition hover:bg-[#FFB020]/20 disabled:opacity-50"
    >
      <Link2 className="h-3 w-3" />
      {state === 'loading' ? labels.linking : labels.link}
    </button>
  );
}
