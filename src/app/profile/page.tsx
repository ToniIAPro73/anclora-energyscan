import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ProfileHero, ProfileBackLink } from '@/components/ProfileContent';
import { ProfileStats } from '@/components/ProfileStats';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { canAccessPremiumContent } from '@/lib/premium-access';

function getInitials(name?: string | null, email?: string | null) {
  const source = (name || email || 'ES').trim();
  return (
    source
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'ES'
  );
}

export default async function ProfilePage() {
  const session = await auth().catch(() => null);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen app-shell">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 pt-28">
          <div className="surface rounded-3xl border p-6">
            <h1 className="font-heading text-3xl font-bold text-premium">EnergyScan Profile</h1>
            <p className="mt-3 text-muted">Sign in to view your profile, assessments and preferences.</p>
            <Link href="/auth" className="mt-6 inline-flex rounded-full bg-[#00DC82] px-6 py-3 font-heading font-bold text-[#07140f]">
              Sign in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const [assessments, budgetReviews, providerAccount, professionalRequest] = await Promise.all([
    prisma.assessment.findMany({
      where: { userId: session.user.id },
      include: { leads: true, cadastralRecord: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.budgetReview.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.providerAccount.findUnique({ where: { userId: session.user.id }, include: { provider: true } }),
    session.user.email
      ? prisma.professionalAccessRequest.findFirst({
          where: { email: session.user.email.toLowerCase() },
          orderBy: { createdAt: 'desc' },
        })
      : null,
  ]);

  const latestAssessment = assessments[0];
  const premiumCount = assessments.filter(
    (a) => canAccessPremiumContent({ paidAt: a.paidAt, isDemo: a.isDemo }).isPaid,
  ).length;
  const leadsCount = assessments.reduce((sum, a) => sum + a.leads.length, 0);
  const location =
    latestAssessment?.cadastralRecord?.municipality ||
    latestAssessment?.cadastralRecord?.province ||
    latestAssessment?.zipcode ||
    'España';
  const memberSinceISO = (latestAssessment?.createdAt ?? new Date()).toISOString();

  return (
    <div className="min-h-screen app-shell">
      <Navbar
        mode="app"
        userEmail={session.user.email}
        userName={session.user.name}
        providerHref={providerAccount ? '/provider/dashboard' : '/provider/register'}
        professionalHref={professionalRequest?.status === 'APPROVED' ? '/profesional/dashboard' : '/profesional/solicitar'}
      />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <ProfileBackLink />
        <ProfileHero
          name={session.user.name ?? null}
          email={session.user.email ?? null}
          image={session.user.image ?? null}
          initials={getInitials(session.user.name, session.user.email)}
          location={location}
          memberSinceISO={memberSinceISO}
        />
        <ProfileStats
          assessmentCount={assessments.length}
          premiumCount={premiumCount}
          budgetCount={budgetReviews.length}
          leadsCount={leadsCount}
          userId={session.user.id}
          hasProvider={!!providerAccount}
          professionalStatus={professionalRequest?.status ?? null}
        />
      </main>
    </div>
  );
}
