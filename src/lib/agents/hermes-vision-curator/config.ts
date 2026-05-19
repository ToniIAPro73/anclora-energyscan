function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

export interface HermesVisionConfig {
  enabled: boolean;
  llmCurationEnabled: boolean;
  maxFindings: number;
}

export function getHermesVisionConfig(): HermesVisionConfig {
  return {
    enabled: process.env.ENABLE_HERMES_VISION_CURATOR !== 'false',
    llmCurationEnabled: process.env.ENABLE_HERMES_VISION_LLM_CURATION === 'true',
    maxFindings: parsePositiveInt(process.env.HERMES_VISION_MAX_FINDINGS, 8),
  };
}
