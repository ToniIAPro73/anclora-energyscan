export type VisionImageType =
  | 'facade'
  | 'windows'
  | 'roof'
  | 'heating'
  | 'insulation'
  | 'interior'
  | 'documentation'
  | 'irrelevant'
  | 'unknown';

export type VisionConfidence = 'high' | 'medium' | 'low';

export interface VisionAnalysisResult {
  imageType: VisionImageType;
  relevant: boolean;
  confidence: VisionConfidence;
  findings: string[];
  warnings: string[];
  reportSummary: string | null;
  model: string;
  rawJson?: unknown;
}

export type VisionStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
