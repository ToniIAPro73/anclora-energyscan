import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readAttachmentBytes, isBlobAttachmentPath } from '@/lib/blob-storage';
import { analyzeImageWithOpenRouter } from '@/lib/vision/openrouter-vision';
import { normalizeLanguage } from '@/lib/preferences';
import { Prisma } from '@prisma/client';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({})) as { attachmentId?: string; lang?: string };
    const lang = normalizeLanguage(body.lang ?? undefined);

    const whereClause: Prisma.AssessmentAttachmentWhereInput = {
      assessmentId: params.id,
      type: { in: IMAGE_MIME_TYPES },
    };

    if (body.attachmentId) {
      whereClause.id = body.attachmentId;
    } else {
      // Only process attachments without an analysis or with FAILED status
      whereClause.analysis = {
        is: null,
      };
    }

    const attachments = await prisma.assessmentAttachment.findMany({
      where: whereClause,
      include: { analysis: true },
    });

    if (attachments.length === 0) {
      return NextResponse.json({ message: 'No image attachments to analyze', results: [] });
    }

    const results: Array<{ id: string; status: string }> = [];

    for (const attachment of attachments) {
      // Upsert PROCESSING record
      await prisma.attachmentAnalysis.upsert({
        where: { attachmentId: attachment.id },
        create: {
          attachmentId: attachment.id,
          model: 'pending',
          status: 'PROCESSING',
        },
        update: { status: 'PROCESSING', errorMessage: null },
      });

      try {
        if (!isBlobAttachmentPath(attachment.path)) {
          throw new Error('Only blob-stored attachments are supported for vision analysis');
        }

        const { bytes } = await readAttachmentBytes(attachment.path);
        const base64 = bytes.toString('base64');

        const result = await analyzeImageWithOpenRouter(base64, attachment.type, lang);

        await prisma.attachmentAnalysis.update({
          where: { attachmentId: attachment.id },
          data: {
            model: result.model,
            status: 'DONE',
            imageType: result.imageType,
            detectedJson: result.rawJson as Prisma.InputJsonValue ?? Prisma.JsonNull,
            confidence: result.confidence,
            reportSummary: result.reportSummary,
            warnings: result.warnings as unknown as Prisma.InputJsonValue,
            errorMessage: null,
            analyzedAt: new Date(),
          },
        });

        results.push({ id: attachment.id, status: 'DONE' });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[vision/analyze] attachment=${attachment.id}`, msg);

        await prisma.attachmentAnalysis.update({
          where: { attachmentId: attachment.id },
          data: { status: 'FAILED', errorMessage: msg },
        });

        results.push({ id: attachment.id, status: 'FAILED' });
      }
    }

    return NextResponse.json({ message: 'Vision analysis completed', results });
  } catch (err) {
    console.error('[vision/analyze]', err);
    return NextResponse.json({ error: 'Vision analysis failed' }, { status: 500 });
  }
}
