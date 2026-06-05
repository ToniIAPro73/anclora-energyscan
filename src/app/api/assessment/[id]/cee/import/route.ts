import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readAttachmentBytes } from '@/lib/blob-storage';
import { DocumentParserService } from '@/lib/document-parsing/service';
import { parseCeeToCertificate } from '@/lib/ocr/cee-parser';
import { certificateToPrismaCreate, fieldsToPrismaCreateMany } from '@/lib/ingestion/persistence';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const runtime = 'nodejs';

const parserService = new DocumentParserService();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const attachmentId = typeof body.attachmentId === 'string' ? body.attachmentId : undefined;
    if (!attachmentId) return NextResponse.json({ error: 'attachmentId requerido' }, { status: 400 });

    const attachment = await prisma.assessmentAttachment.findFirst({
      where: { id: attachmentId, assessmentId: params.id },
    });
    if (!attachment) return NextResponse.json({ error: 'Adjunto no encontrado' }, { status: 404 });
    if (attachment.type !== 'application/pdf' && !attachment.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'El adjunto debe ser un PDF' }, { status: 400 });
    }

    const { bytes } = await readAttachmentBytes(attachment.path);
    const parsedDocument = await parserService.parsePdf({
      buffer: new Uint8Array(bytes),
      fileName: attachment.name,
      mimeType: attachment.type,
      engine: typeof body.engine === 'string' ? body.engine : 'auto',
    });
    const textQuality = parsedDocument.metadata?.textQuality;
    const certificate = parseCeeToCertificate(parsedDocument.text || parsedDocument.markdown || '', {
      sourceFormat: parsedDocument.engine === 'mineru' || textQuality === 'empty' ? 'PDF_OCR' : 'PDF_TEXT',
    });
    const created = await prisma.energyCertificate.create({
      data: certificateToPrismaCreate({ assessmentId: params.id, attachmentId, certificate }),
    });
    if (certificate.extractedFields?.length) {
      await prisma.dataFieldSource.createMany({
        data: fieldsToPrismaCreateMany(params.id, created.id, certificate.extractedFields),
      });
    }
    await prisma.assessmentAttachment.update({
      where: { id: attachmentId },
      data: {
        ocrStatus: certificate.extractionStatus === 'PARSED' ? 'done' : 'done',
        ocrData: {
          sourceKind: 'cee_pdf',
          parserEngine: parsedDocument.engine,
          parserWarnings: parsedDocument.warnings,
          extracted: { normalizedCertificate: certificate },
          processedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
        ocrProcessedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      parserEngine: parsedDocument.engine,
      certificate,
      appliedFields: certificate.extractedFields || [],
      warnings: parsedDocument.warnings,
    });
  } catch (error) {
    console.error('CEE import failed:', error);
    return NextResponse.json({ error: 'Failed to import CEE' }, { status: 500 });
  }
}
