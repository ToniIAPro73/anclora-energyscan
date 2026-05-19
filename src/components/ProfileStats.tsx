'use client';

import { FileText, ReceiptText, ShieldCheck } from 'lucide-react';
import { usePreferences } from '@/components/AppPreferencesProvider';

type ProfileStatsProps = {
  assessmentCount: number;
  premiumCount: number;
  budgetCount: number;
  leadsCount: number;
  userId: string;
  hasProvider: boolean;
  professionalStatus: string | null;
};

export function ProfileStats({
  assessmentCount,
  premiumCount,
  budgetCount,
  leadsCount,
  userId,
  hasProvider,
  professionalStatus,
}: ProfileStatsProps) {
  const { dictionary: t } = usePreferences();

  return (
    <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#00DC82]" />
            <h2 className="font-heading text-2xl font-bold text-premium">{t.profileEnergyTitle}</h2>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">{t.profileEnergyCopy}</p>
        </section>

        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { label: t.profileAssessments, value: assessmentCount, Icon: FileText },
            { label: t.profilePremium, value: premiumCount, Icon: ShieldCheck },
            { label: t.profileBudgets, value: budgetCount, Icon: ReceiptText },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <Icon className="h-5 w-5 text-[#00DC82]" />
              <p className="mt-4 font-heading text-3xl font-black text-premium">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-heading text-xl font-bold text-premium">{t.profileAccountInfo}</h2>
        <div className="mt-6 space-y-5">
          <AccountFact label={t.profileTypeLabel} value={hasProvider ? t.profileTypeProvider : t.profileTypeResidential} />
          <AccountFact label={t.profileAreaPro} value={professionalStatus || t.profileAreaProNone} />
          <AccountFact label={t.profileLeads} value={String(leadsCount)} />
          <AccountFact label={t.profileId} value={userId} mono />
        </div>
      </aside>
    </div>
  );
}

function AccountFact({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#00DC82]">{label}</p>
      <p className={`mt-2 break-words text-sm font-bold text-premium ${mono ? 'font-mono text-xs' : 'font-heading'}`}>{value}</p>
    </div>
  );
}
