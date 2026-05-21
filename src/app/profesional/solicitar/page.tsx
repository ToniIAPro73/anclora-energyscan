'use client';

import { FormEvent, useState } from 'react';
import Navbar from '@/components/Navbar';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { useSession } from 'next-auth/react';
import { getMonetizationCopy } from '@/lib/monetization/i18n';

export default function ProfessionalRequestPage() {
  const { language } = usePreferences();
  const { data: session } = useSession();
  const copy = getMonetizationCopy(language).professional;
  const [message, setMessage] = useState('');
  const [termsError, setTermsError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTermsError('');
    const form = new FormData(event.currentTarget);
    if (!form.get('termsAccepted')) {
      setTermsError(copy.termsRequired as string);
      return;
    }
    const response = await fetch('/api/professional-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        company: form.get('company'),
        role: form.get('profileType') || form.get('role'),
        message: [form.get('useCase'), form.get('volume'), form.get('message')]
          .filter(Boolean)
          .join(' | '),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    setMessage(response.ok ? (payload.duplicate ? copy.requestDuplicate : copy.requestOk) : copy.requestError);
  }

  return (
    <div className="min-h-screen app-shell">
      {session?.user ? (
        <Navbar mode="app" userEmail={session.user.email} userName={session.user.name} userImage={session.user.image as string | null} />
      ) : (
        <Navbar />
      )}
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <h1 className="font-heading text-4xl font-bold text-premium">{copy.requestTitle}</h1>
        <p className="mt-3 text-sm text-muted">{copy.requestIntro}</p>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <input
            name="name"
            placeholder={copy.name}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />
          <input
            name="email"
            type="email"
            required
            defaultValue={session?.user?.email ?? ''}
            placeholder={copy.email}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />
          <input
            name="company"
            placeholder={copy.company}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />
          <select
            name="profileType"
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-premium"
          >
            <option value="">{copy.profileTypePlaceholder as string}</option>
            {(copy.profileTypes as string[]).map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
          <input
            name="useCase"
            placeholder={copy.useCasePlaceholder as string}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />
          <input
            name="volume"
            placeholder={copy.volumePlaceholder as string}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />
          <textarea
            name="message"
            placeholder={copy.message}
            rows={3}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />

          {/* Terms */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <input
              type="checkbox"
              name="termsAccepted"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#00DC82]"
            />
            <span className="text-xs text-muted leading-relaxed">{copy.termsLabel as string}</span>
          </label>
          {termsError && <p className="text-xs text-[#EF4444]">{termsError}</p>}

          <button
            type="submit"
            className="rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]"
          >
            {copy.submit}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-[#00DC82]">{message}</p>}

        <p className="mt-6 text-xs text-muted">{copy.legal}</p>
      </main>
    </div>
  );
}
