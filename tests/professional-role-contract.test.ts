import { getMonetizationCopy } from '@/lib/monetization/i18n';

describe('professional role contract', () => {
  const langs = ['es', 'en', 'de'] as const;

  describe('role separation: professional ≠ residential ≠ provider', () => {
    it('professional copy does not promise official CEE', () => {
      for (const lang of langs) {
        const copy = getMonetizationCopy(lang).professional;
        const relevant = [copy.legal, copy.notIncluded, copy.noCeeOfficial].join(' ').toLowerCase();
        expect(relevant).toMatch(/cee|epc|energieausweis/i);
        expect(relevant).toMatch(/no|not|kein/i);
      }
    });

    it('professional copy mentions beta / access under review', () => {
      for (const lang of langs) {
        const copy = getMonetizationCopy(lang).professional;
        const relevant = [copy.betaNotice, copy.betaBadge, copy.gatedTitle].join(' ').toLowerCase();
        expect(relevant).toMatch(/beta/i);
      }
    });

    it('professional copy explains provider difference', () => {
      for (const lang of langs) {
        const copy = getMonetizationCopy(lang).professional;
        const text = copy.providerDifferenceText as string;
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(20);
      }
    });

    it('professional copy does not mention direct commercial guarantees', () => {
      for (const lang of langs) {
        const copy = getMonetizationCopy(lang).professional;
        const legalText = copy.legal.toLowerCase();
        // Must say reports are indicative / orientative
        expect(legalText).toMatch(/orientativ|indicative|orientierend/i);
      }
    });
  });

  describe('professional i18n keys — ES', () => {
    const copy = getMonetizationCopy('es').professional;

    it('has forWhom block', () => {
      expect(copy.forWhomTitle).toBeTruthy();
      expect(copy.forCertifiers).toBeTruthy();
      expect(copy.forAdvisors).toBeTruthy();
      expect(copy.forRealEstate).toBeTruthy();
      expect(copy.forAssetManagers).toBeTruthy();
    });

    it('has availableNow list with at least 4 items', () => {
      const list = copy.availableNow as string[];
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(4);
    });

    it('has notIncluded text', () => {
      expect(typeof copy.notIncluded).toBe('string');
      expect((copy.notIncluded as string).length).toBeGreaterThan(10);
    });

    it('has betaNotice', () => {
      expect(typeof copy.betaNotice).toBe('string');
      expect((copy.betaNotice as string).length).toBeGreaterThan(10);
    });

    it('has providerDifference keys', () => {
      expect(copy.providerDifferenceTitle).toBeTruthy();
      expect(copy.providerDifferenceText).toBeTruthy();
    });

    it('has profileTypes list', () => {
      const types = copy.profileTypes as string[];
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThanOrEqual(5);
    });

    it('has budgetReview professional keys', () => {
      expect(copy.budgetReviewTitle).toBeTruthy();
      expect(copy.budgetReviewDescription).toBeTruthy();
      expect(copy.reviewClientBudget).toBeTruthy();
    });

    it('has howToUse list', () => {
      const steps = copy.howToUse as string[];
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThanOrEqual(4);
    });

    it('has terms and login context keys', () => {
      expect(copy.termsLabel).toBeTruthy();
      expect(copy.termsRequired).toBeTruthy();
      expect(copy.loginContextTitle).toBeTruthy();
      expect(copy.loginContextCta).toBeTruthy();
    });
  });

  describe('professional i18n keys — EN', () => {
    const copy = getMonetizationCopy('en').professional;

    it('has forWhom block in English', () => {
      expect(copy.forWhomTitle).not.toBe(getMonetizationCopy('es').professional.forWhomTitle);
      expect(copy.forCertifiers).toBeTruthy();
    });

    it('has availableNow list in English', () => {
      const list = copy.availableNow as string[];
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(4);
    });

    it('has profileTypes in English', () => {
      const types = copy.profileTypes as string[];
      expect(Array.isArray(types)).toBe(true);
    });
  });

  describe('professional i18n keys — DE', () => {
    const copy = getMonetizationCopy('de').professional;

    it('has forWhom block in German', () => {
      expect(copy.forWhomTitle).toBeTruthy();
      expect(copy.forCertifiers).toBeTruthy();
    });

    it('has availableNow list in German', () => {
      const list = copy.availableNow as string[];
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('status states contract', () => {
    it('all status labels exist in ES', () => {
      const copy = getMonetizationCopy('es').professional;
      expect(copy.statusLabel.NONE).toBeTruthy();
      expect(copy.statusLabel.PENDING).toBeTruthy();
      expect(copy.statusLabel.APPROVED).toBeTruthy();
      expect(copy.statusLabel.REJECTED).toBeTruthy();
    });

    it('gated state copy exists for each non-approved status', () => {
      const copy = getMonetizationCopy('es').professional;
      expect(copy.noRequestCopy).toBeTruthy();
      expect(copy.pendingCopy).toBeTruthy();
      expect(copy.rejectedCopy).toBeTruthy();
      expect(copy.pendingCopyExtended).toBeTruthy();
      expect(copy.rejectedCopyExtended).toBeTruthy();
    });

    it('login gate copy exists', () => {
      const copy = getMonetizationCopy('es').professional;
      expect(copy.loginRequired).toBeTruthy();
      expect(copy.loginCta).toBeTruthy();
    });
  });

  describe('budget review professional contract', () => {
    it('budget review is described as orientative / second opinion', () => {
      for (const lang of langs) {
        const copy = getMonetizationCopy(lang).professional;
        const desc = (copy.budgetReviewDescription as string).toLowerCase();
        expect(desc).toMatch(/orientat|second opinion|zweite meinung/i);
      }
    });

    it('budget review disclaimer mentions it does not replace professional review', () => {
      for (const lang of langs) {
        const copy = getMonetizationCopy(lang).professional;
        const disclaimer = (copy.budgetReviewDisclaimer as string).toLowerCase();
        expect(disclaimer).toMatch(/no |not |nicht|keine/i);
      }
    });
  });
});
