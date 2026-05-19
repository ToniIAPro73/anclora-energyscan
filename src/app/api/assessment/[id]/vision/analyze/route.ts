import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readAttachmentBytes, isBlobAttachmentPath } from '@/lib/blob-storage';
import { analyzeImageWithOpenRouter } from '@/lib/vision/openrouter-vision';
import { normalizeLanguage } from '@/lib/preferences';
import { getVisionAnalysisConfig } from '@/lib/vision/vision-config';
import { resolveVisionEntitlement } from '@/lib/vision/vision-entitlements';
import { selectImagesForVisionAnalysis } from '@/lib/vision/select-vision-images';
import { trackEvent } from '@/lib/analytics';
import { Prisma } from '@prisma/client';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({})) as { attachmentId?: string; lang?: string; force?: boolean };
    const lang = normalizeLanguage(body.lang ?? undefined);
    const force = body.force === true;

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      select: { id: true, paidAt: true, isPremium: true, isDemo: true, userId: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const config = getVisionAnalysisConfig();
    const entitlement = resolveVisionEntitlement({ assessment, config });

    const basePayload = {
      assessmentId: params.id,
      entitlementLevel: entitlement.level,
      reason: entitlement.reason,
    };

    if (!entitlement.allowed) {
      trackEvent('vision_analysis_blocked', { ...basePayload, maxImages: 0 });
      return NextResponse.json({
        allowed: false,
        reason: entitlement.reason,
        message:
          lang === 'en'
            ? 'AI visual analysis is available for Premium reports. Your images will be kept as attachments but will not be automatically analysed.'
            : lang === 'de'
            ? 'Die KI-Bildanalyse ist für Premium-Berichte verfügbar. Ihre Bilder werden als Anhang gespeichert, aber nicht automatisch analysiert.'
            : 'El análisis visual IA está disponible para informes Premium. Las imágenes se conservarán como evidencias, pero no se analizarán automáticamente.',
      });
    }

    trackEvent('vision_analysis_allowed', { ...basePayload, maxImages: entitlement.maxImages });

    // Load image attachments for this assessment
    const allAttachments = await prisma.assessmentAttachment.findMany({
      where: {
        assessmentId: params.id,
        ...(body.attachmentId ? { id: body.attachmentId } : {}),
      },
      include: { analysis: true },
    });

    const selectedIds = new Set(
      selectImagesForVisionAnalysis({
        attachments: allAttachments,
        maxImages: entitlement.maxImages,
        force,
      }).map((a) => a.id),
    );

    const selectedAttachments = allAttachments.filter((a) => selectedIds.has(a.id));
    const skippedCount = allAttachments.filter(
      (a) => a.type.startsWith('image/') && !selectedIds.has(a.id),
    ).length;

    if (selectedAttachments.length === 0) {
      return NextResponse.json({
        allowed: true,
        level: entitlement.level,
        maxImages: entitlement.maxImages,
        processed: 0,
        skipped: skippedCount,
        failed: 0,
        results: [],
        message: 'No new image attachments to analyse',
      });
    }

    trackEvent('vision_analysis_started', {
      ...basePayload,
      maxImages: entitlement.maxImages,
      selectedImages: selectedAttachments.length,
    });

    const results: Array<{ id: string; status: string }> = [];
    let failed = 0;

    for (const attachment of selectedAttachments) {
      await prisma.attachmentAnalysis.upsert({
        where: { attachmentId: attachment.id },
        create: { attachmentId: attachment.id, model: 'pending', status: 'PROCESSING' },
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
        failed++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[vision/analyze] attachment=${attachment.id}`, msg);
        await prisma.attachmentAnalysis.update({
          where: { attachmentId: attachment.id },
          data: { status: 'FAILED', errorMessage: msg },
        });
        results.push({ id: attachment.id, status: 'FAILED' });
      }
    }

    const eventName = failed > 0 && failed === results.length
      ? 'vision_analysis_failed'
      : 'vision_analysis_completed';

    trackEvent(eventName, {
      ...basePayload,
      maxImages: entitlement.maxImages,
      selectedImages: selectedAttachments.length,
      processed: results.length - failed,
      failed,
      model: process.env.OPENROUTER_VISION_MODEL ?? 'google/gemini-2.5-flash-lite',
    });

    return NextResponse.json({
      allowed: true,
      level: entitlement.level,
      maxImages: entitlement.maxImages,
      processed: results.length - failed,
      skipped: skippedCount,
      failed,
      results,
    });
  } catch (err) {
    console.error('[vision/analyze]', err);
    return NextResponse.json({ error: 'Vision analysis failed' }, { status: 500 });
  }
}
