import Anthropic from '@anthropic-ai/sdk';

export type ImageCategory =
  | 'facade'
  | 'windows'
  | 'roof'
  | 'heating'
  | 'insulation'
  | 'interior'
  | 'documentation'
  | 'irrelevant';

export interface ImageAnalysisResult {
  relevant: boolean;
  category: ImageCategory;
  findings: string[];
  warning?: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an expert energy auditor analyzing property photos for an energy assessment tool.
Your task is to determine whether each image is relevant to an energy assessment and extract useful observations.

Relevant categories:
- facade: exterior walls, cladding, visible insulation, building envelope
- windows: window frames, glazing type, seals, shutters
- roof: roof covering, visible insulation, skylights, dormers
- heating: boilers, radiators, heat pumps, HVAC units, pipework
- insulation: loft insulation, wall cavities, visible thermal bridges
- interior: internal walls, ceilings, floor finishes, energy systems
- documentation: energy certificates, invoices, plans, labels

If the image has NOTHING to do with a building or its energy systems (e.g., a person, animal, landscape, food, vehicle, artwork), classify it as irrelevant.

Respond ONLY with valid JSON matching this exact schema:
{
  "relevant": boolean,
  "category": "facade"|"windows"|"roof"|"heating"|"insulation"|"interior"|"documentation"|"irrelevant",
  "findings": string[],  // 0-4 specific observable facts useful for energy assessment (empty if irrelevant)
  "warning": string|null, // null if relevant, short message if irrelevant
  "confidence": "high"|"medium"|"low"
}`;

const LANGUAGE_HINTS: Record<string, string> = {
  es: 'Write findings and warning in Spanish.',
  en: 'Write findings and warning in English.',
  de: 'Write findings and warning in German.',
};

export async function analyzePropertyImage(
  base64Image: string,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
  language: 'es' | 'en' | 'de' = 'es',
): Promise<ImageAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { relevant: true, category: 'facade', findings: [], confidence: 'low' };
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mimeType, data: base64Image },
          },
          {
            type: 'text',
            text: `Analyze this image for an energy assessment. ${LANGUAGE_HINTS[language] ?? LANGUAGE_HINTS.es} Respond with JSON only.`,
          },
        ],
      },
    ],
  });

  const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : '';
  // Strip markdown code fences if present
  const json = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const parsed = JSON.parse(json) as ImageAnalysisResult;
  return parsed;
}
