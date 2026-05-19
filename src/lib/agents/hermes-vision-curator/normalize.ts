import type { VisionAnalysisResult } from '@/lib/vision/types';
import type { GroupedFinding, HermesLocale } from './types';
import { deduplicateFindings, sanitizeFinding } from './safety';
import { categoryLabel } from './templates';

// Image types with high energy relevance — listed in priority order
const HIGH_VALUE_TYPES = ['windows', 'facade', 'roof', 'heating', 'insulation'];

export function groupAnalysesByCategory(
  analyses: VisionAnalysisResult[],
  locale: HermesLocale,
  maxFindings: number,
): GroupedFinding[] {
  const relevantAnalyses = analyses.filter((a) => a.relevant && a.imageType !== 'irrelevant');

  // Collect all findings per imageType
  const byType = new Map<string, { findings: string[]; confidence: string[] }>();
  for (const analysis of relevantAnalyses) {
    const key = analysis.imageType;
    if (!byType.has(key)) byType.set(key, { findings: [], confidence: [] });
    const entry = byType.get(key)!;
    entry.findings.push(...analysis.findings);
    entry.confidence.push(analysis.confidence);
  }

  // Sort by priority: high-value types first
  const sorted = Array.from(byType.entries()).sort(([a], [b]) => {
    const ai = HIGH_VALUE_TYPES.indexOf(a);
    const bi = HIGH_VALUE_TYPES.indexOf(b);
    const aRank = ai === -1 ? 99 : ai;
    const bRank = bi === -1 ? 99 : bi;
    return aRank - bRank;
  });

  const result: GroupedFinding[] = [];
  let remaining = maxFindings;

  for (const [imageType, { findings, confidence }] of sorted) {
    if (remaining <= 0) break;

    const deduped = deduplicateFindings(findings.map(sanitizeFinding).filter(Boolean));
    const capped = deduped.slice(0, remaining);
    remaining -= capped.length;

    if (capped.length === 0) continue;

    const dominantConfidence = confidenceMajority(confidence);

    result.push({
      category: imageType,
      title: categoryLabel(imageType, locale),
      findings: capped,
      confidence: dominantConfidence,
    });
  }

  return result;
}

function confidenceMajority(confidences: string[]): 'low' | 'medium' | 'high' {
  const counts = { high: 0, medium: 0, low: 0 };
  for (const c of confidences) {
    if (c === 'high') counts.high++;
    else if (c === 'medium') counts.medium++;
    else counts.low++;
  }
  if (counts.high >= counts.medium && counts.high >= counts.low) return 'high';
  if (counts.medium >= counts.low) return 'medium';
  return 'low';
}
