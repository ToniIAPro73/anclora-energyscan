import AssessmentWizard from '@/components/AssessmentWizard';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';
import { auth } from '@/auth';

export default async function WizardPage() {
  const session = await auth().catch(() => null);

  return (
    <div className="min-h-screen app-shell overflow-x-hidden lg:h-screen lg:overflow-hidden">
      {session?.user ? (
        <Navbar
          mode="app"
          userEmail={session.user.email}
          userName={session.user.name}
          userImage={session.user.image}
        />
      ) : (
        <Navbar />
      )}
      <div className="pt-20 lg:h-[calc(100vh-4rem)] lg:pt-16 lg:overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center text-muted">Cargando wizard...</div>}>
          <AssessmentWizard />
        </Suspense>
      </div>
    </div>
  );
}
