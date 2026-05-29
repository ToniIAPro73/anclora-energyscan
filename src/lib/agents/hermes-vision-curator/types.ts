import type { VisionEntitlementLevel } from '@/lib/vision/vision-entitlements';
import type { VisionAnalysisResult } from '@/lib/vision/types';

export type { VisionEntitlementLevel, VisionAnalysisResult };

export type HermesLocale = 'es' | 'ca' | 'en' | 'de' | 'fr' | 'it' | 'pt';

export interface HermesVisionCuratorInput {
  assessmentId: string;
  locale: HermesLocale;
  entitlementLevel: VisionEntitlementLevel;
  imageAnalyses: VisionAnalysisResult[];
  assessmentContext?: unknown;
}

export interface GroupedFinding {
  category: string;
  title: string;
  findings: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface HermesVisionCuratorResult {
  agent: 'hermes-vision-curator';
  version: string;
  summaryForPdf: string;
  groupedFindings: GroupedFinding[];
  limitations: string[];
  recommendedChecks: string[];
  safePdfDisclaimer: string;
}
