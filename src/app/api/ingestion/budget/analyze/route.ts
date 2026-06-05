import { NextResponse } from 'next/server';
import { DocumentParserService } from '@/lib/document-parsing/service';
import type { DocumentParserEngine } from '@/lib/document-parsing/types';
import { parseBudgetAnalysisText } from '@/lib/ocr/budget-parser';
import type { EnergyLetter } from '@/lib/ingestion/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const runtime = 'nodejs';

const parserService = new DocumentParserService();

async function readInput(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await req.json();
    return {
      text: typeof body.text === 'string' ? body.text : undefined,
      currentLetter: body.currentLetter as EnergyLetter | undefined,
      targetLetter: body.targetLetter as EnergyLetter | undefined,
      currentNonRenewableEP: typeof body.currentNonRenewableEP === 'number' ? body.currentNonRenewableEP : undefined,
      currentEmissions: typeof body.currentEmissions === 'number' ? body.currentEmissions : undefined,
      usefulAreaM2: typeof body.usefulAreaM2 === 'number' ? body.usefulAreaM2 : undefined,
      propertyType: typeof body.propertyType === 'string' ? body.propertyType : undefined,
      climateZone: typeof body.climateZone === 'string' ? body.climateZone : undefined,
      fileName: typeof body.fileName === 'string' ? body.fileName : 'presupuesto.pdf',
      engine: (typeof body.engine === 'string' ? body.engine : 'auto') as DocumentParserEngine,
    };
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!(file instanceof File)) throw new Error('Presupuesto PDF requerido');
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('El presupuesto debe ser un PDF');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('El PDF supera el limite de 10 MB');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const parsedDocument = await parserService.parsePdf({
    buffer: bytes,
    fileName: file.name,
    mimeType: file.type,
    engine: (formData.get('engine')?.toString() ?? 'auto') as DocumentParserEngine,
  });
  return {
    text: parsedDocument.text || parsedDocument.markdown || '',
    parserWarnings: parsedDocument.warnings,
    parserEngine: parsedDocument.engine,
    textQuality: parsedDocument.metadata?.textQuality,
    currentLetter: formData.get('currentLetter') as EnergyLetter | null || undefined,
    targetLetter: formData.get('targetLetter') as EnergyLetter | null || undefined,
    usefulAreaM2: Number(formData.get('usefulAreaM2')) || undefined,
    propertyType: formData.get('propertyType')?.toString(),
    climateZone: formData.get('climateZone')?.toString(),
    fileName: file.name,
  };
}

export async function POST(req: Request) {
  try {
    const input = await readInput(req);
    const budget = parseBudgetAnalysisText(input.text || '', {
      currentLetter: input.currentLetter,
      targetLetter: input.targetLetter,
      currentNonRenewableEP: input.currentNonRenewableEP,
      currentEmissions: input.currentEmissions,
      usefulAreaM2: input.usefulAreaM2,
      propertyType: input.propertyType,
      climateZone: input.climateZone,
    });
    const warnings = [...(input.parserWarnings ?? []), ...budget.warnings];
    if (input.textQuality === 'weak') warnings.push('La extraccion de texto del PDF es parcial. Revisa las partidas detectadas.');
    if (budget.extractionStatus === 'NEEDS_REVIEW') warnings.push('El presupuesto se ha analizado parcialmente y requiere revision.');

    return NextResponse.json({
      ok: true,
      fileName: input.fileName,
      parserEngine: input.parserEngine,
      budget,
      warnings,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'No se pudo analizar el presupuesto',
    }, { status: 400 });
  }
}
