import { getHermesVisionConfig } from './config';
import { groupAnalysesByCategory } from './normalize';
import { SUMMARIES, LIMITATIONS, RECOMMENDED_CHECKS, DISCLAIMERS, categoryLabel } from './templates';
import type { HermesVisionCuratorInput, HermesVisionCuratorResult } from './types';

export type { HermesVisionCuratorInput, HermesVisionCuratorResult } from './types';

const VERSION = '1.0.0-deterministic';

export function curateVisionFindingsForReport(
  input: HermesVisionCuratorInput,
): HermesVisionCuratorResult | null {
  const config = getHermesVisionConfig();

  if (!config.enabled) return null;
  if (input.imageAnalyses.length === 0) return null;

  const { locale, imageAnalyses } = input;

  const groupedFindings = groupAnalysesByCategory(imageAnalyses, locale, config.maxFindings);

  if (groupedFindings.length === 0) return null;

  const categories = groupedFindings.map((g) => categoryLabel(g.category, locale));
  const summaryForPdf = SUMMARIES[locale](categories);

  return {
    agent: 'hermes-vision-curator',
    version: VERSION,
    summaryForPdf,
    groupedFindings,
    limitations: LIMITATIONS[locale],
    recommendedChecks: RECOMMENDED_CHECKS[locale],
    safePdfDisclaimer: DISCLAIMERS[locale],
  };
}
