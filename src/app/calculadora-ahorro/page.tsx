import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SavingsCalculator } from '@/components/monetization/SavingsCalculator';
import { CalculatorHeader } from '@/components/monetization/CalculatorHeader';
import { getMonetizationCopy } from '@/lib/monetization/i18n';

export const metadata = {
  title: getMonetizationCopy('es').calculator.metadataTitle,
  description: getMonetizationCopy('es').calculator.metadataDescription,
};

export default function SavingsCalculatorPage() {
  return (
    <div className="min-h-screen app-shell">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28">
        <CalculatorHeader />
        <div className="mt-8"><SavingsCalculator /></div>
      </main>
      <Footer />
    </div>
  );
}
