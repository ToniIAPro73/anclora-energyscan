function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

export interface VisionAnalysisConfig {
  enabled: boolean;
  freeEnabled: boolean;
  includedInPremium: boolean;
  maxImagesPremium: number;
  maxImagesPro: number;
  defaultMaxImages: number;
}

export function getVisionAnalysisConfig(): VisionAnalysisConfig {
  return {
    enabled: process.env.ENABLE_VISION_ANALYSIS === 'true',
    freeEnabled: process.env.ENABLE_FREE_VISION_ANALYSIS === 'true',
    includedInPremium: process.env.VISION_ANALYSIS_INCLUDED_IN_PREMIUM !== 'false',
    maxImagesPremium: parsePositiveInt(process.env.VISION_MAX_IMAGES_PREMIUM, 3),
    maxImagesPro: parsePositiveInt(process.env.VISION_MAX_IMAGES_PRO, 8),
    defaultMaxImages: 0,
  };
}
