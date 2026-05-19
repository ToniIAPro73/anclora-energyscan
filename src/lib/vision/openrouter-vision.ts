import { normalizeVisionOutput, stripCodeFences } from './normalize';
import { VISION_SYSTEM_PROMPT, buildVisionUserPrompt } from './prompts';
import type { VisionAnalysisResult } from './types';

const PRIMARY_MODEL = process.env.OPENROUTER_VISION_MODEL ?? 'google/gemini-2.5-flash-lite';
const FALLBACK_MODEL = process.env.OPENROUTER_VISION_FALLBACK_MODEL ?? 'qwen/qwen2.5-vl-72b-instruct';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const MAX_TOKENS = 512;
const TIMEOUT_MS = 28_000;

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; [key: string]: unknown }>;
}

async function callOpenRouter(
  model: string,
  messages: OpenRouterMessage[],
  apiKey: string,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://energyscan.anclora.com',
        'X-Title': 'Anclora EnergyScan',
      },
      body: JSON.stringify({ model, messages, max_tokens: MAX_TOKENS }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? '';
    if (!content) throw new Error('Empty response from OpenRouter');
    return content;
  } finally {
    clearTimeout(timer);
  }
}

function buildMessages(
  base64Image: string,
  mimeType: string,
  language: 'es' | 'en' | 'de',
): OpenRouterMessage[] {
  return [
    { role: 'system', content: VISION_SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${base64Image}` },
        },
        { type: 'text', text: buildVisionUserPrompt(language) },
      ],
    },
  ];
}

export async function analyzeImageWithOpenRouter(
  base64Image: string,
  mimeType: string,
  language: 'es' | 'en' | 'de' = 'es',
): Promise<VisionAnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      imageType: 'unknown',
      relevant: true,
      confidence: 'low',
      findings: [],
      warnings: ['Análisis visual no disponible (clave de API no configurada).'],
      reportSummary: null,
      model: 'none',
    };
  }

  const messages = buildMessages(base64Image, mimeType, language);

  // Try primary model, fall back on error
  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      const raw = await callOpenRouter(model, messages, apiKey);
      const json = stripCodeFences(raw);
      const parsed = JSON.parse(json) as unknown;
      return normalizeVisionOutput(parsed, model);
    } catch (err) {
      console.warn(`[openrouter-vision] model=${model} failed:`, err instanceof Error ? err.message : err);
    }
  }

  return {
    imageType: 'unknown',
    relevant: false,
    confidence: 'low',
    findings: [],
    warnings: ['El análisis visual no pudo completarse tras varios intentos.'],
    reportSummary: null,
    model: 'failed',
  };
}
