'use client';

import { FormEvent, useState } from 'react';
import Navbar from '@/components/Navbar';
import { usePreferences } from '@/components/AppPreferencesProvider';
import { useSession } from 'next-auth/react';
import { getMonetizationCopy } from '@/lib/monetization/i18n';

export default function ProviderRegisterPage() {
  const { language } = usePreferences();
  const { data: session } = useSession();
  const copy = getMonetizationCopy(language).provider;
  const [message, setMessage] = useState('');
  const [termsError, setTermsError] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTermsError('');
    const form = new FormData(event.currentTarget);
    if (!form.get('termsAccepted')) {
      setTermsError(copy.termsRequired as string);
      return;
    }
    if (selectedCategories.length === 0) {
      setTermsError(copy.categoriesLabel as string);
      return;
    }
    const response = await fetch('/api/provider/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        website: form.get('website'),
        categories: selectedCategories,
        zones: String(form.get('zones') || '').split(',').map((z) => z.trim()).filter(Boolean),
      }),
    });
    setMessage(response.ok ? (copy.registerOk as string) : (copy.registerError as string));
  }

  return (
    <div className="min-h-screen app-shell">
      {session?.user ? (
        <Navbar
          mode="app"
          userEmail={session.user.email}
          userName={session.user.name}
          userImage={session.user.image as string | null}
        />
      ) : (
        <Navbar />
      )}
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <h1 className="font-heading text-4xl font-bold text-premium">{copy.registerTitle}</h1>
        <p className="mt-3 text-sm text-muted">{copy.registerIntro as string}</p>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <input
            name="name"
            required
            placeholder={copy.company}
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
            name="phone"
            placeholder={copy.phone}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />
          <input
            name="website"
            placeholder={copy.website}
            className="rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
          />

          {/* Categories */}
          <div>
            <p className="mb-2 text-sm font-bold text-premium">{copy.categoriesLabel as string}</p>
            <div className="flex flex-wrap gap-2">
              {(copy.categoryOptions as string[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'border-[#00DC82] bg-[#00DC82]/15 text-[#00DC82]'
                      : 'border-white/10 bg-black/10 text-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Coverage zones */}
          <div>
            <p className="mb-2 text-sm font-bold text-premium">{copy.zonesLabel as string}</p>
            <input
              name="zones"
              required
              placeholder={copy.zones}
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 placeholder:text-muted"
            />
          </div>

          {/* Terms */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <input
              type="checkbox"
              name="termsAccepted"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#00DC82]"
            />
            <span className="text-xs leading-relaxed text-muted">{copy.termsProviderLabel as string}</span>
          </label>
          {termsError && <p className="text-xs text-[#EF4444]">{termsError}</p>}

          <button
            type="submit"
            className="rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]"
          >
            {copy.submitRegister}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-[#00DC82]">{message}</p>}

        <p className="mt-6 text-xs text-muted">{copy.providerLegal}</p>
      </main>
    </div>
  );
}
