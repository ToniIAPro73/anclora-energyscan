import { getMonetizationCopy } from '@/lib/monetization/i18n';
import type { AppLanguage } from '@/lib/preferences';

describe('calculator decision potential i18n', () => {
  const languages: AppLanguage[] = ['es', 'en', 'de'];

  it.each(languages)('includes decision potential copy for %s', (language) => {
    const calculator = getMonetizationCopy(language).calculator;

    expect(calculator.decisionPotentialTitle).toBeTruthy();
    expect(calculator.decisionPotentialFavorable).toBeTruthy();
    expect(calculator.decisionPotentialReview).toBeTruthy();
    expect(calculator.decisionPotentialFullAnalysis).toBeTruthy();
    expect(calculator.decisionPotentialNotEnoughData).toBeTruthy();
    expect(calculator.decisionNoticeFullAnalysis).toBeTruthy();
    expect(calculator.quickReadPremiumBridge).toBeTruthy();
    expect(calculator.technicalPaybackToggle).toBeTruthy();
  });
});
