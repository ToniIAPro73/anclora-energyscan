import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { prisma } from '@/lib/prisma';
import { parseStatelessAssessmentId, getPublicAssessmentRef } from '@/lib/stateless-assessment';
import { toPdfLanguage } from '@/lib/preferences';
import { BasicReport, type BasicReportData } from '@/lib/pdf/BasicReport';
import type { EnergyLetter, PropertyType, ConfidenceLevel } from '@/lib/domain/energy-assessment';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function loadLogoDataUri(): Promise<string | undefined> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    const bytes = await readFile(logoPath);
    return `data:image/png;base64,${bytes.toString('base64')}`;
  } catch {
    return undefined;
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    const cookieHeader = req.headers.get('cookie') || '';
    const cookieLanguage = cookieHeader.match(/enerscan-language=(es|ca|en|de|fr|it|pt)/)?.[1];
    const pdfLanguage = toPdfLanguage(url.searchParams.get('lang') || cookieLanguage);

    const statelessPayload = parseStatelessAssessmentId(params.id);

    let reportData: BasicReportData;

    const localeMap: Record<string, string> = {
      es: 'es-ES',
      ca: 'es-ES',
      en: 'en-GB',
      de: 'de-DE',
      fr: 'fr-FR',
      it: 'it-IT',
      pt: 'pt-PT'
    };
    const dateLocale = localeMap[pdfLanguage] ?? 'es-ES';

    if (statelessPayload) {
      const pd = statelessPayload.propertyData;
      const sr = statelessPayload.scoreResult;
      reportData = {
        assessmentRef: getPublicAssessmentRef(params.id),
        date: new Date().toLocaleDateString(dateLocale),
        language: pdfLanguage,
        propertyData: {
          year: pd.year,
          area: pd.area,
          zipcode: pd.zipcode,
          propertyType: pd.propertyType as PropertyType,
        },
        scoreResult: {
          estimatedLetter: sr.estimatedLetter as EnergyLetter,
          confidence: sr.confidence as ConfidenceLevel,
          climateZone: sr.climateZone,
          penalties: sr.penalties,
          strengths: sr.strengths,
        },
        logoDataUri: await loadLogoDataUri(),
      };
    } else {
      const assessment = await prisma.assessment.findUnique({ where: { id: params.id }, include: { cadastralRecord: true } });
      if (!assessment) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }

      reportData = {
        assessmentRef: getPublicAssessmentRef(params.id),
        date: new Date(assessment.createdAt).toLocaleDateString(dateLocale),
        language: pdfLanguage,
        propertyData: {
          year: assessment.year,
          area: assessment.area,
          zipcode: assessment.zipcode,
          propertyType: (assessment.propertyType || 'unknown') as PropertyType,
        },
        scoreResult: {
          estimatedLetter: assessment.estimatedLetter as EnergyLetter,
          confidence: (assessment.confidence || 'Media') as ConfidenceLevel,
          climateZone: assessment.climateZone || 'Desconocida',
          penalties: JSON.parse(assessment.penalties || '[]'),
          strengths: JSON.parse(assessment.strengths || '[]'),
        },
        address: assessment.cadastralRecord?.address ?? undefined,
        logoDataUri: await loadLogoDataUri(),
      };
    }

    const stream = await renderToStream(React.createElement(BasicReport, { data: reportData }) as never);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    const pdfBytes = Buffer.concat(chunks);

    const ref = reportData.assessmentRef.toLowerCase().replace(/\s+/g, '-');
    const filenameMap: Record<string, string> = {
      en: `energyscan-free-report-${ref}.pdf`,
      de: `energyscan-voreinschaetzung-${ref}.pdf`,
      ca: `energyscan-prediagnostic-ca-${ref}.pdf`,
      fr: `energyscan-pre-evaluation-fr-${ref}.pdf`,
      it: `energyscan-pre-valutazione-it-${ref}.pdf`,
      pt: `energyscan-pre-avaliacao-pt-${ref}.pdf`,
    };
    const filename = filenameMap[pdfLanguage] ?? `energyscan-prediagnostico-${ref}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[basic-pdf] error', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
