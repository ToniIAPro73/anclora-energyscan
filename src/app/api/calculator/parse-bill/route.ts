import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdf } from '@/lib/ocr/pdf-extractor';
import { extractTextFromImage } from '@/lib/ocr/image-ocr';
import { parseUtilityBillText } from '@/lib/ocr/bill-parser';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const supplyTypeHint = formData.get('supplyType');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No file provided' }, { status: 400 });
    }

    const mimeType = file.type;
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { ok: false, error: 'Unsupported file type. Use PDF, JPEG, PNG or WebP.' },
        { status: 415 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, error: 'File too large (max 10 MB)' }, { status: 413 });
    }

    const bytes = new Uint8Array(arrayBuffer);

    let extractedText = '';

    if (mimeType === 'application/pdf') {
      const { fullText } = await extractTextFromPdf(bytes);
      extractedText = fullText;
    } else {
      const imageData = await extractTextFromImage(Buffer.from(bytes));
      extractedText = imageData.detectedText ?? '';
    }

    const parsed = parseUtilityBillText(extractedText);

    // Override supply type if hint provided and parser couldn't determine it
    if (
      supplyTypeHint &&
      typeof supplyTypeHint === 'string' &&
      (supplyTypeHint === 'electricity' || supplyTypeHint === 'gas') &&
      parsed.supplyType === 'unknown'
    ) {
      parsed.supplyType = supplyTypeHint;
    }

    // Store data point non-blocking (best-effort)
    if (parsed.amountEur !== undefined) {
      prisma.energyBillDataPoint
        .create({
          data: {
            supplyType: parsed.supplyType,
            amountEur: parsed.amountEur,
            consumptionKwh: parsed.consumptionKwh,
            consumptionM3: parsed.consumptionM3,
            billingDays: parsed.billingDays,
            zipCode: parsed.zipCode,
            distributorName: parsed.distributorName,
            source: 'calculator_import',
          },
        })
        .catch(() => null);
    }

    return NextResponse.json({ ok: true, data: parsed });
  } catch (err) {
    console.error('[parse-bill] Error:', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
