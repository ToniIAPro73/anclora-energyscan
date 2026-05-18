import { cookies } from 'next/headers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { normalizeLanguage, PREFERENCE_COOKIE_NAMES } from '@/lib/preferences';
import { getMonetizationCopy } from '@/lib/monetization/i18n';
import { getSupportEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export default function LeadWithdrawPage({ searchParams }: { searchParams: { success?: string; error?: string } }) {
  const language = normalizeLanguage(cookies().get(PREFERENCE_COOKIE_NAMES.language)?.value);
  const copy = getMonetizationCopy(language).professional;
  const supportEmail = getSupportEmail();
  const isSuccess = searchParams.success === '1';
  const isError = Boolean(searchParams.error);

  return (
    <div className="min-h-screen app-shell">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 pb-16 pt-28">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          {isSuccess && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00DC82]/20">
                <span className="text-2xl text-[#00DC82]">✓</span>
              </div>
              <h1 className="font-heading text-2xl font-bold text-premium">{copy.withdrawTitle}</h1>
              <p className="mt-3 text-muted">{copy.withdrawCopy}</p>
              <p className="mt-4 text-xs text-muted">{copy.withdrawLegal} <a href={`mailto:${supportEmail}`} className="text-[#00DC82]">{supportEmail}</a></p>
            </>
          )}
          {(isError || (!isSuccess && !isError)) && (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EF4444]/20">
                <span className="text-2xl text-[#EF4444]">✕</span>
              </div>
              <h1 className="font-heading text-2xl font-bold text-premium">{copy.withdrawError}</h1>
              <p className="mt-4 text-xs text-muted">{copy.withdrawLegal} <a href={`mailto:${supportEmail}`} className="text-[#00DC82]">{supportEmail}</a></p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
