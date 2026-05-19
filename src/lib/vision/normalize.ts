import type { VisionAnalysisResult, VisionConfidence, VisionImageType } from './types';

const VALID_IMAGE_TYPES: VisionImageType[] = [
  'facade', 'windows', 'roof', 'heating', 'insulation', 'interior', 'documentation', 'irrelevant', 'unknown',
];
const VALID_CONFIDENCE: VisionConfidence[] = ['high', 'medium', 'low'];

export function normalizeVisionOutput(raw: unknown, model: string): VisionAnalysisResult {
  if (typeof raw !== 'object' || raw === null) {
    return fallback(model);
  }

  const obj = raw as Record<string, unknown>;

  const imageType: VisionImageType = VALID_IMAGE_TYPES.includes(obj.imageType as VisionImageType)
    ? (obj.imageType as VisionImageType)
    : 'unknown';

  const relevant = typeof obj.relevant === 'boolean' ? obj.relevant : imageType !== 'irrelevant' && imageType !== 'unknown';
  const confidence: VisionConfidence = VALID_CONFIDENCE.includes(obj.confidence as VisionConfidence)
    ? (obj.confidence as VisionConfidence)
    : 'low';

  const findings = Array.isArray(obj.findings)
    ? (obj.findings as unknown[]).filter((f): f is string => typeof f === 'string').slice(0, 4)
    : [];

  const warnings = Array.isArray(obj.warnings)
    ? (obj.warnings as unknown[]).filter((w): w is string => typeof w === 'string')
    : [];

  const reportSummary = typeof obj.reportSummary === 'string' && obj.reportSummary.length > 0
    ? obj.reportSummary
    : null;

  return { imageType, relevant, confidence, findings, warnings, reportSummary, model, rawJson: raw };
}

function fallback(model: string): VisionAnalysisResult {
  return {
    imageType: 'unknown',
    relevant: false,
    confidence: 'low',
    findings: [],
    warnings: ['No se pudo analizar la imagen correctamente.'],
    reportSummary: null,
    model,
  };
}

export function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}
