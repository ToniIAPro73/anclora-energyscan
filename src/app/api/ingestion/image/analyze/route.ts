import { NextResponse } from 'next/server';
import { analyzePropertyImage } from '@/lib/vision/image-analysis';
import { normalizeLanguage } from '@/lib/preferences';
import { logSafeError } from '@/lib/safe-logger';
import { preparePropertyPhoto } from '@/lib/vision/property-photo';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type AllowedMime = typeof ALLOWED_MIME_TYPES[number];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB — Anthropic vision limit

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const lang = normalizeLanguage(formData.get('lang') as string | null ?? undefined);

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Image file required' }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMime)) {
      return NextResponse.json({ ok: false, error: 'Only JPG, PNG, WEBP or GIF images are accepted' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ ok: false, error: 'Image exceeds 5 MB limit' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const safePhoto = await preparePropertyPhoto(Buffer.from(buffer));
    const base64 = safePhoto.toString('base64');
    const result = await analyzePropertyImage(base64, 'image/jpeg', lang);

    return NextResponse.json({ ok: true, result });
  } catch {
    logSafeError('image_analysis_request_failed');
    return NextResponse.json({ ok: false, error: 'Analysis failed' }, { status: 500 });
  }
}
