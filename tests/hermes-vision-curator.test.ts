import { curateVisionFindingsForReport } from '@/lib/agents/hermes-vision-curator';
import type { VisionAnalysisResult } from '@/lib/vision/types';

const windowsAnalysis: VisionAnalysisResult = {
  imageType: 'windows',
  relevant: true,
  confidence: 'high',
  findings: ['Se observan marcos de aluminio sin rotura de puente térmico', 'Acristalamiento aparentemente simple'],
  warnings: [],
  reportSummary: 'Carpinterías con posible pérdida energética por falta de rotura de puente térmico.',
  model: 'test-model',
};

const facadeAnalysis: VisionAnalysisResult = {
  imageType: 'facade',
  relevant: true,
  confidence: 'medium',
  findings: ['Fachada sin aislamiento exterior visible'],
  warnings: [],
  reportSummary: 'Fachada sin sistema de aislamiento exterior aparente.',
  model: 'test-model',
};

const irrelevantAnalysis: VisionAnalysisResult = {
  imageType: 'irrelevant',
  relevant: false,
  confidence: 'high',
  findings: [],
  warnings: ['Imagen no relacionada con la edificación.'],
  reportSummary: null,
  model: 'test-model',
};

describe('curateVisionFindingsForReport', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ENABLE_HERMES_VISION_CURATOR = 'true';
    process.env.HERMES_VISION_MAX_FINDINGS = '8';
    delete process.env.ENABLE_HERMES_VISION_LLM_CURATION;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns null when no analyses provided', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [],
    });
    expect(result).toBeNull();
  });

  it('returns null when ENABLE_HERMES_VISION_CURATOR=false', () => {
    process.env.ENABLE_HERMES_VISION_CURATOR = 'false';
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis],
    });
    expect(result).toBeNull();
  });

  it('returns null when all analyses are irrelevant', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [irrelevantAnalysis],
    });
    expect(result).toBeNull();
  });

  it('returns curated result with agent identifier', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis],
    });
    expect(result).not.toBeNull();
    expect(result!.agent).toBe('hermes-vision-curator');
    expect(result!.version).toMatch(/deterministic/);
  });

  it('generates grouped findings', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis, facadeAnalysis],
    });
    expect(result!.groupedFindings.length).toBeGreaterThan(0);
    const categories = result!.groupedFindings.map((g) => g.category);
    expect(categories).toContain('windows');
    expect(categories).toContain('facade');
  });

  it('respects HERMES_VISION_MAX_FINDINGS limit', () => {
    process.env.HERMES_VISION_MAX_FINDINGS = '2';
    const manyFindings: VisionAnalysisResult = {
      imageType: 'windows',
      relevant: true,
      confidence: 'high',
      findings: ['f1', 'f2', 'f3', 'f4', 'f5'],
      warnings: [],
      reportSummary: null,
      model: 'test',
    };
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [manyFindings],
    });
    const totalFindings = result!.groupedFindings.reduce((acc, g) => acc + g.findings.length, 0);
    expect(totalFindings).toBeLessThanOrEqual(2);
  });

  it('deduplicates identical findings across analyses', () => {
    const dup: VisionAnalysisResult = {
      imageType: 'windows',
      relevant: true,
      confidence: 'high',
      findings: ['Marcos de aluminio sin rotura de puente térmico'],
      warnings: [],
      reportSummary: null,
      model: 'test',
    };
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [dup, dup],
    });
    const windowsGroup = result!.groupedFindings.find((g) => g.category === 'windows');
    expect(windowsGroup!.findings.length).toBe(1);
  });

  it('includes limitations and recommended checks', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis],
    });
    expect(result!.limitations.length).toBeGreaterThan(0);
    expect(result!.recommendedChecks.length).toBeGreaterThan(0);
  });

  it('includes safe disclaimer', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis],
    });
    expect(result!.safePdfDisclaimer).toBeTruthy();
    expect(result!.safePdfDisclaimer.length).toBeGreaterThan(20);
  });

  it('does not produce forbidden assertive language', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'es',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis, facadeAnalysis],
    });
    const allText = [
      result!.summaryForPdf,
      ...result!.groupedFindings.flatMap((g) => g.findings),
    ].join(' ');
    expect(allText).not.toMatch(/ahorrará/i);
    expect(allText).not.toMatch(/sin duda/i);
    expect(allText).not.toMatch(/definitivamente/i);
  });

  it('sanitizeFinding replaces concluyente phrases with hedged equivalents', () => {
    const { sanitizeFinding } = require('@/lib/agents/hermes-vision-curator/safety');
    expect(sanitizeFinding('La cubierta consta de tejas cerámicas.')).toMatch(/parece estar resuelta con/i);
    expect(sanitizeFinding('La ventana es de doble acristalamiento.')).toMatch(/podría corresponder a/i);
    expect(sanitizeFinding('Lo cual es beneficioso para la eficiencia.')).toMatch(/puede ser relevante/i);
    expect(sanitizeFinding('El sistema está equipado con radiadores.')).toMatch(/podría estar equipad/i);
    expect(sanitizeFinding('The roof consists of ceramic tiles.')).toMatch(/appears to feature/i);
    expect(sanitizeFinding('The window is double-glazed.')).toMatch(/may correspond to/i);
  });

  it('sanitizeFinding still discards fully forbidden findings after hedging', () => {
    const { sanitizeFinding } = require('@/lib/agents/hermes-vision-curator/safety');
    expect(sanitizeFinding('Ahorrará 500 € al año.')).toBe('');
    expect(sanitizeFinding('Definitivamente no tiene aislamiento.')).toBe('');
  });

  it('respects locale (en)', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'en',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis],
    });
    expect(result!.safePdfDisclaimer).toContain('visual analysis');
    expect(result!.groupedFindings[0].title).toContain('Windows');
  });

  it('respects locale (de)', () => {
    const result = curateVisionFindingsForReport({
      assessmentId: 'test',
      locale: 'de',
      entitlementLevel: 'premium',
      imageAnalyses: [windowsAnalysis],
    });
    expect(result!.safePdfDisclaimer).toContain('Energieausweis');
  });
});
