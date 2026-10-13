import sharp from 'sharp';

const PROPERTY_PHOTO_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type AttachmentPrivacyInput = {
  type: string;
  category: string | null;
  ocrStatus: string;
  ocrData: unknown;
};

function getOcrText(value: unknown): string | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;
  if (typeof payload.text === 'string') return payload.text;
  if (typeof payload.detectedText === 'string') return payload.detectedText;
  if (typeof payload.extracted === 'object' && payload.extracted !== null && !Array.isArray(payload.extracted)) {
    const extracted = payload.extracted as Record<string, unknown>;
    if (typeof extracted.detectedText === 'string') return extracted.detectedText;
  }
  return null;
}

/** Fail closed unless OCR has confirmed the raster attachment contains no readable text. */
export function isEligiblePropertyPhoto(input: AttachmentPrivacyInput): boolean {
  if (!PROPERTY_PHOTO_MIME_TYPES.has(input.type)) return false;
  if (input.category !== 'EXTERIOR' && input.category !== 'INTERIOR') return false;
  if (input.ocrStatus !== 'done') return false;
  const text = getOcrText(input.ocrData);
  return text !== null && text.trim().length === 0;
}

/** Applies orientation, bounds the image, and strips EXIF and other source metadata. */
export async function preparePropertyPhoto(imageBytes: Buffer): Promise<Buffer> {
  return sharp(imageBytes, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
}
