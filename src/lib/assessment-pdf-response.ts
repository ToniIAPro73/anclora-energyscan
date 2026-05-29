import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { generateScenarios } from '@/lib/simulator';
import { REGULATORY_TIMELINE } from '@/lib/regulatory';
import { getRelevantSubsidies } from '@/lib/subsidies';
import { renderToStream } from '@react-pdf/renderer';
import { EnerScanReport } from '@/lib/pdf/EnerScanReport';
import { AssessmentAttachment, PremiumReportData, PropertyDataV2, ScoreResultV2, EnergyLetter, PropertyType, HeatingSystem, CoolingSystem, WaterHeatingSystem, WindowType, RenewableSystem, InsulationLevel, BudgetRange, AssessmentObjective, ConfidenceLevel, PropertyOrientation, RoofType, VentilationType, TimelineHorizon } from '@/lib/domain/energy-assessment';
import { getPreferencesForLanguage, normalizeCurrency, normalizeLanguage, normalizeMeasurementSystem, normalizeSelectedLocale, toPdfLanguage } from '@/lib/preferences';
import { createReportDataFromPayload, getPublicAssessmentRef, parseStatelessAssessmentId } from '@/lib/stateless-assessment';
import { isBlobAttachmentPath, readAttachmentBytes } from '@/lib/blob-storage';
import React from 'react';
import { appendPdfAnnexes, PdfAnnex } from '@/lib/pdf/append-pdf-annex';
import { getScenarioCostEstimate } from '@/lib/costs/cost-engine';
import { prismaCertificateToDto } from '@/lib/ingestion/persistence';
import type { RehabBudgetAnalysis } from '@/lib/ingestion/types';
import { assertCanDownloadPremiumPdf, canAccessPremiumContent } from '@/lib/premium-access';
import { trackEvent } from '@/lib/analytics';
import { buildEvidenceMatrix } from '@/lib/evidence/evidence-matrix';
import { buildConditionRiskItems } from '@/lib/condition-risk/rules';
import { fetchCatastroImages } from '@/lib/catastro/images';
import type { UtilityBillData } from '@/lib/domain/energy-assessment';
import { getVisionAnalysisConfig } from '@/lib/vision/vision-config';
import { resolveVisionEntitlement } from '@/lib/vision/vision-entitlements';
import { curateVisionFindingsForReport } from '@/lib/agents/hermes-vision-curator';
import type { VisionAnalysisResult } from '@/lib/vision/types';

let cachedLogoDataUri: string | undefined;

function isPdfAttachment(attachment: { type: string; name: string }) {
  return attachment.type === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf');
}

async function getReportLogoDataUri() {
  if (cachedLogoDataUri) return cachedLogoDataUri;

  const logoPath = path.join(process.cwd(), 'public', 'brand', 'logo-anclora-energy-scan.png');
  const logo = await readFile(logoPath);
  cachedLogoDataUri = `data:image/png;base64,${logo.toString('base64')}`;
  return cachedLogoDataUri;
}

async function enrichAttachmentsForPdf(
  attachments: AssessmentAttachment[]
) {
  return Promise.all(attachments.map(async (attachment) => {
    if (!attachment.path) return attachment;

    if (attachment.path.startsWith('demo://')) {
      return {
        ...attachment,
        previewText: [
          '# Documentación demo Anclora EnergyScan',
          '',
          'Este archivo simula la documentación aportada por el usuario para ilustrar el anexo del informe premium.',
          '',
          '- Fotografía de fachada: no incluida en esta demo.',
          '- Certificado energético anterior: no aportado.',
          '- Notas del propietario: vivienda adosada de 1988 con cubierta inclinada y calefacción de gas.',
        ].join('\n'),
      };
    }

    try {
      const attachmentPath = path.isAbsolute(attachment.path)
        ? attachment.path
        : path.join(process.cwd(), 'public', attachment.path);
      const file = isBlobAttachmentPath(attachment.path)
        ? (await readAttachmentBytes(attachment.path)).bytes
        : await readFile(attachmentPath);
      
      if (attachment.type.startsWith('image/')) {
        return {
          ...attachment,
          previewDataUri: `data:${attachment.type};base64,${file.toString('base64')}`,
        };
      }

      const lowerName = attachment.name.toLowerCase();
      if (attachment.type.startsWith('text/') || lowerName.endsWith('.md')) {
        return {
          ...attachment,
          previewText: file.toString('utf8').slice(0, 6000),
        };
      }

      // PDFs will be handled by appending them at the end, but we can still provide a note
      if (isPdfAttachment(attachment)) {
        return {
          ...attachment,
          annexNote: `Documento PDF aportado por el usuario. Después de este resumen se incorporan todas sus páginas en formato original, sin sustituir el CEE oficial ni validar administrativamente su contenido.`,
        };
      }
    } catch (error) {
      console.error(`Could not read attachment for PDF annex: ${attachment.name}`, error);
      return {
        ...attachment,
        annexNote: 'No se pudo leer el archivo desde el almacenamiento temporal al generar el PDF.',
      };
    }

    return {
      ...attachment,
      annexNote: 'Formato registrado en el expediente. Anclora EnergyScan no convierte ni analiza automáticamente el contenido de este documento.',
    };
  }));
}

async function getAttachmentBytes(attachment: AssessmentAttachment): Promise<Buffer | null> {
  if (!attachment.path) return null;
  try {
    const attachmentPath = path.isAbsolute(attachment.path)
      ? attachment.path
      : path.join(process.cwd(), 'public', attachment.path);
    
    if (isBlobAttachmentPath(attachment.path)) {
      return (await readAttachmentBytes(attachment.path)).bytes;
    } else {
      return await readFile(attachmentPath);
    }
  } catch (error) {
    console.error(`Error reading attachment bytes for ${attachment.name}:`, error);
    return null;
  }
}

async function loadPremiumSourcesForAssessment(assessmentId: string) {
  try {
    const [energyCertificates, rehabBudgets, dataFieldSources] = await Promise.all([
      prisma.energyCertificate.findMany({ where: { assessmentId }, orderBy: { createdAt: 'desc' } }),
      prisma.rehabBudget.findMany({ where: { assessmentId }, orderBy: { createdAt: 'desc' } }),
      prisma.dataFieldSource.findMany({ where: { assessmentId }, orderBy: { createdAt: 'desc' } }),
    ]);

    return { energyCertificates, rehabBudgets, dataFieldSources };
  } catch (error) {
    console.warn('Premium sources unavailable for PDF report:', error);
    return { energyCertificates: [], rehabBudgets: [], dataFieldSources: [] };
  }
}

function buildReportFilename(reportData: PremiumReportData, reportRef: string) {
  if (reportData.isDemo && reportRef.startsWith('DEMO-')) {
    const demoRef = reportRef.slice('DEMO-'.length);
    const timestamp = formatDownloadTimestamp();
    if (reportData.language === 'en') return `energyscan-report-demo-en-${demoRef}-${timestamp}.pdf`;
    if (reportData.language === 'de') return `energyscan-bericht-demo-de-${demoRef}-${timestamp}.pdf`;
    if (reportData.language === 'ca') return `energyscan-informe-demo-ca-${demoRef}-${timestamp}.pdf`;
    if (reportData.language === 'fr') return `energyscan-rapport-demo-fr-${demoRef}-${timestamp}.pdf`;
    if (reportData.language === 'it') return `energyscan-rapporto-demo-it-${demoRef}-${timestamp}.pdf`;
    if (reportData.language === 'pt') return `energyscan-relatorio-demo-pt-${demoRef}-${timestamp}.pdf`;
    return `energyscan-informe-demo-es-${demoRef}-${timestamp}.pdf`;
  }

  if (reportData.language === 'en') return `energyscan-report-${reportRef}.pdf`;
  if (reportData.language === 'de') return `energyscan-bericht-${reportRef}.pdf`;
  if (reportData.language === 'ca') return `energyscan-informe-ca-${reportRef}.pdf`;
  if (reportData.language === 'fr') return `energyscan-rapport-fr-${reportRef}.pdf`;
  if (reportData.language === 'it') return `energyscan-rapporto-it-${reportRef}.pdf`;
  if (reportData.language === 'pt') return `energyscan-relatorio-pt-${reportRef}.pdf`;
  return `energyscan-informe-${reportRef}.pdf`;
}

function formatDownloadTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '00';
  return `${value('day')}${value('month')}${value('year')}${value('hour')}${value('minute')}${value('second')}`;
}

export async function buildAssessmentPdfResponse(
  req: Request,
  assessmentId: string,
  options: { allowDemoPremium?: boolean; utilityBills?: UtilityBillData[] } = {}
) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookieLanguage = cookieHeader.match(/enerscan-language=(es|ca|en|de|fr|it|pt)/)?.[1];
    const cookieCurrency = cookieHeader.match(/enerscan-currency=(EUR|GBP)/)?.[1];
    const cookieUnits = cookieHeader.match(/enerscan-measurement-system=(metric|imperial)/)?.[1];
    const url = new URL(req.url);
    const pdfLanguage = toPdfLanguage(normalizeSelectedLocale(url.searchParams.get('lang') || cookieLanguage));
    const language = normalizeLanguage(pdfLanguage);
    const languageDefaults = getPreferencesForLanguage(language);
    const currency = normalizeCurrency(url.searchParams.get('currency') || cookieCurrency || languageDefaults.currency);
    const measurementSystem = normalizeMeasurementSystem(url.searchParams.get('units') || cookieUnits || languageDefaults.measurementSystem);
    const statelessPayload = parseStatelessAssessmentId(assessmentId);
    let reportData: PremiumReportData;
    let rawAttachments: AssessmentAttachment[] = [];

    if (statelessPayload) {
      const isAllowedExplicitDemo = options.allowDemoPremium === true && statelessPayload.isDemo === true;
      const access = canAccessPremiumContent({
        isDemo: statelessPayload.isDemo,
        statelessPayload,
      });
      if (!isAllowedExplicitDemo && !assertCanDownloadPremiumPdf(access)) {
        return NextResponse.json(
          {
            error: 'premium_required',
            message: 'El informe PDF Premium requiere pago previo.',
            checkoutRequired: true,
          },
          { status: 402 }
        );
      }

      reportData = createReportDataFromPayload(assessmentId, statelessPayload, pdfLanguage, currency, measurementSystem);
      rawAttachments = statelessPayload.attachments || [];
    } else {
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: { attachments: { include: { analysis: true } }, cadastralRecord: true }
      });

      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      }

      const access = canAccessPremiumContent({
        paidAt: assessment.paidAt,
        isPremium: assessment.isPremium,
        isDemo: assessment.isDemo,
      });
      if (!assertCanDownloadPremiumPdf(access)) {
        return NextResponse.json(
          {
            error: 'premium_required',
            message: 'El informe PDF Premium requiere pago previo.',
            checkoutRequired: true,
          },
          { status: 402 }
        );
      }

      const premiumSources = await loadPremiumSourcesForAssessment(assessment.id);

      const propertyData: PropertyDataV2 = {
        year: assessment.year,
        area: assessment.area,
        zipcode: assessment.zipcode,
        propertyType: (assessment.propertyType || 'unknown') as PropertyType,
        orientation: (assessment.orientation || 'unknown') as PropertyOrientation,
        roofType: (assessment.roofType || 'unknown') as RoofType,
        heating: (assessment.heating || 'unknown') as HeatingSystem,
        cooling: (assessment.cooling || 'unknown') as CoolingSystem,
        waterHeating: (assessment.waterHeating || 'unknown') as WaterHeatingSystem,
        ventilation: (assessment.ventilation || 'unknown') as VentilationType,
        windows: (assessment.windows || 'unknown') as WindowType,
        renewables: (assessment.renewables || 'unknown') as RenewableSystem,
        facadeInsulation: (assessment.facadeInsulation || 'unknown') as InsulationLevel,
        roofInsulation: (assessment.roofInsulation || 'unknown') as InsulationLevel,
        budgetRange: (assessment.budgetRange || 'unknown') as BudgetRange,
        timelineHorizon: (assessment.timelineHorizon || 'unknown') as TimelineHorizon,
        targetLetter: (assessment.targetLetter || 'G') as EnergyLetter,
        objective: (assessment.objective || 'unknown') as AssessmentObjective,
      };

      const scoreResult: ScoreResultV2 = {
        score: assessment.score || 0,
        estimatedLetter: assessment.estimatedLetter as EnergyLetter,
        confidence: (assessment.confidence || 'Media') as ConfidenceLevel,
        climateZone: assessment.climateZone || 'Desconocida',
        penalties: JSON.parse(assessment.penalties || '[]'),
        strengths: JSON.parse(assessment.strengths || '[]'),
        missingData: JSON.parse(assessment.missingData || '[]'),
        explanation: assessment.explanation || '',
      };

      const rawScenarios = generateScenarios(propertyData, scoreResult);
      const scenarios = rawScenarios.map(s => ({
        ...s,
        costEstimate: getScenarioCostEstimate(s.id, propertyData) || undefined
      }));

      rawAttachments = assessment.attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        category: att.category as AssessmentAttachment['category'],
        size: att.size,
        path: att.path,
        createdAt: att.createdAt.toISOString(),
        visionAnalysis: att.analysis?.status === 'DONE' ? {
          imageType: att.analysis.imageType ?? 'unknown',
          relevant: att.analysis.imageType !== 'irrelevant',
          confidence: att.analysis.confidence ?? 'low',
          findings: Array.isArray(att.analysis.detectedJson)
            ? []
            : ((att.analysis.detectedJson as Record<string, unknown> | null)?.findings as string[] | undefined) ?? [],
          warnings: Array.isArray(att.analysis.warnings)
            ? (att.analysis.warnings as string[])
            : [],
          reportSummary: att.analysis.reportSummary ?? null,
        } : undefined,
      }));

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

      reportData = {
        id: assessment.id,
        date: new Date(assessment.createdAt).toLocaleDateString(dateLocale),
        propertyData,
        scoreResult,
        scenarios,
        regulatoryContext: REGULATORY_TIMELINE,
        subsidies: getRelevantSubsidies(propertyData),
        providerCategories: ["aislamiento", "ventanas", "climatización", "acs", "fotovoltaica", "solar térmica", "certificador"],
        attachments: rawAttachments,
        energyCertificates: premiumSources.energyCertificates.map(prismaCertificateToDto),
        rehabBudgets: premiumSources.rehabBudgets.map((budget) => ({
          extractionStatus: budget.extractionStatus as RehabBudgetAnalysis['extractionStatus'],
          extractionConfidence: budget.extractionConfidence || undefined,
          providerName: budget.providerName || undefined,
          budgetDate: budget.budgetDate?.toISOString(),
          totalAmount: budget.totalAmount || undefined,
          currency: (budget.currency || 'EUR') as RehabBudgetAnalysis['currency'],
          vatIncluded: budget.vatIncluded || undefined,
          lineItems: Array.isArray(budget.lineItemsJson) ? budget.lineItemsJson as RehabBudgetAnalysis['lineItems'] : [],
          detectedMeasures: Array.isArray(budget.detectedMeasuresJson) ? budget.detectedMeasuresJson as RehabBudgetAnalysis['detectedMeasures'] : [],
          estimatedCurrentLetter: budget.estimatedCurrentLetter as RehabBudgetAnalysis['estimatedCurrentLetter'],
          estimatedPostBudgetLetter: budget.estimatedPostBudgetLetter as RehabBudgetAnalysis['estimatedPostBudgetLetter'],
          targetLetter: budget.targetLetter as RehabBudgetAnalysis['targetLetter'],
          targetReached: budget.targetReached || undefined,
          impactConfidence: (budget.impactConfidence || 'LOW') as RehabBudgetAnalysis['impactConfidence'],
          missingMeasures: Array.isArray(budget.missingMeasuresJson) ? budget.missingMeasuresJson as RehabBudgetAnalysis['missingMeasures'] : [],
          analysisSummary: budget.analysisSummary || '',
          summary: budget.analysisSummary || '',
          assumptions: [],
          warnings: [],
        })),
        dataFieldSources: premiumSources.dataFieldSources.map((source) => ({
          fieldName: source.fieldName,
          value: source.valueJson,
          sourceType: source.sourceType as import('@/lib/ingestion/types').DataSourceType,
          sourceLabel: source.sourceType,
          confidence: source.confidence || undefined,
          requiresReview: source.requiresReview,
          appliedToWizard: source.appliedToWizard,
        })),
        cadastralRecord: assessment.cadastralRecord ? {
          cadastralReference: assessment.cadastralRecord.cadastralReference || '',
          parcelReference: assessment.cadastralRecord.parcelReference || undefined,
          province: assessment.cadastralRecord.province || '',
          municipality: assessment.cadastralRecord.municipality || '',
          address: assessment.cadastralRecord.address || '',
          postalCode: assessment.cadastralRecord.postalCode || '',
          block: assessment.cadastralRecord.internalBlock || undefined,
          staircase: assessment.cadastralRecord.internalStaircase || undefined,
          floor: assessment.cadastralRecord.internalFloor || undefined,
          door: assessment.cadastralRecord.internalDoor || undefined,
          propertyUse: assessment.cadastralRecord.propertyUse || undefined,
          participationCoefficient: assessment.cadastralRecord.participationPct || undefined,
          surfaceBuiltM2: assessment.cadastralRecord.surfaceBuiltM2 || undefined,
          surfacePlotM2: assessment.cadastralRecord.surfacePlotM2 || undefined,
          yearBuilt: assessment.cadastralRecord.yearBuilt || undefined,
          lat: assessment.cadastralRecord.lat || undefined,
          lng: assessment.cadastralRecord.lng || undefined,
          source: assessment.cadastralRecord.sourceSystem,
          confidence: assessment.cadastralRecord.confidence || 1,
        } : undefined,
        language: pdfLanguage,
        currency,
        measurementSystem,
        isDemo: assessment.isDemo,
      };

      // Inject white label branding if the assessment owner has an active addon
      if (assessment.userId) {
        const branding = await prisma.professionalBranding.findUnique({
          where: { userId: assessment.userId },
          select: { brandName: true, addonActive: true },
        }).catch(() => null);
        if (branding?.addonActive && branding.brandName != null) {
          reportData.brandName = branding.brandName;
        }
      }
    }

    // Inject session utility bills if provided (from calculator, same browser session)
    if (options.utilityBills?.length) {
      reportData.utilityBills = options.utilityBills;
    }

    // Fetch Catastro images on-demand for PDF — never stored in DB
    if (reportData.cadastralRecord) {
      const cr = reportData.cadastralRecord;
      reportData.catastroImages = await fetchCatastroImages(
        cr.cadastralReference,
        cr.lat,
        cr.lng,
      );
    }

    reportData.attachments = await enrichAttachmentsForPdf(reportData.attachments || []);
    reportData.logoDataUri = await getReportLogoDataUri();

    // Hermes Vision Curator — enrich PDF with curated visual analysis (premium only, non-blocking)
    if (!statelessPayload) {
      try {
        const visionConfig = getVisionAnalysisConfig();
        // Use the assessment object we already loaded (block-scoped above, hoist reference here)
        const assessment = await prisma.assessment.findUnique({
          where: { id: reportData.id },
          select: { paidAt: true, isPremium: true, isDemo: true },
        });
        const visionEntitlement = resolveVisionEntitlement({ assessment: assessment ?? {}, config: visionConfig });

        if (visionEntitlement.allowed) {
          const completedAnalyses = await prisma.attachmentAnalysis.findMany({
            where: { attachment: { assessmentId: reportData.id }, status: 'DONE' },
          });

          if (completedAnalyses.length > 0) {
            const analysisInputs: VisionAnalysisResult[] = completedAnalyses.map((a) => ({
              imageType: (a.imageType ?? 'unknown') as VisionAnalysisResult['imageType'],
              relevant: a.imageType !== 'irrelevant',
              confidence: (a.confidence ?? 'low') as VisionAnalysisResult['confidence'],
              findings: Array.isArray(
                (a.detectedJson as Record<string, unknown> | null)?.findings,
              )
                ? ((a.detectedJson as Record<string, unknown>).findings as string[])
                : [],
              warnings: Array.isArray(a.warnings) ? (a.warnings as string[]) : [],
              reportSummary: a.reportSummary ?? null,
              model: a.model,
            }));

            trackEvent('hermes_vision_curator_started', {
              assessmentId: reportData.id,
              entitlementLevel: visionEntitlement.level,
              inputAnalyses: analysisInputs.length,
            });

            const curated = curateVisionFindingsForReport({
              assessmentId: reportData.id,
              locale: reportData.language ?? 'es',
              entitlementLevel: visionEntitlement.level,
              imageAnalyses: analysisInputs,
            });

            if (curated) {
              reportData.hermesVision = curated;
              trackEvent('hermes_vision_curator_completed', {
                assessmentId: reportData.id,
                entitlementLevel: visionEntitlement.level,
                inputAnalyses: analysisInputs.length,
                groupedFindings: curated.groupedFindings.length,
                llmCurationEnabled: false,
              });
            } else {
              trackEvent('hermes_vision_curator_skipped', { assessmentId: reportData.id });
            }
          }
        }
      } catch (hermesErr) {
        // Hermes failure must never block PDF generation
        console.warn('[pdf] hermes-vision-curator failed:', hermesErr instanceof Error ? hermesErr.message : hermesErr);
        trackEvent('hermes_vision_curator_failed', { assessmentId: reportData.id });
      }
    }

    // Derive Evidence Matrix and Condition & Risk items for PDF Premium
    const attachmentList = reportData.attachments || [];
    const photoCount = attachmentList.filter(a => a.category === 'EXTERIOR' || a.category === 'INTERIOR').length;
    const hasCeeDocument = attachmentList.some(a => a.category === 'CEE') || (reportData.energyCertificates?.length ?? 0) > 0;
    const hasBudgetDocument = (reportData.rehabBudgets?.length ?? 0) > 0;
    const pd = reportData.propertyData;
    const cr = reportData.cadastralRecord;

    reportData.evidenceItems = buildEvidenceMatrix({
      assessment: {
        year: pd.year,
        area: pd.area,
        zipcode: pd.zipcode,
        propertyType: pd.propertyType,
        windows: pd.windows,
        facadeInsulation: pd.facadeInsulation,
        roofInsulation: pd.roofInsulation,
        heating: pd.heating,
        waterHeating: pd.waterHeating,
        cooling: pd.cooling,
        renewables: pd.renewables,
      },
      cadastralRecord: cr ? {
        cadastralReference: cr.cadastralReference,
        address: cr.address,
        postalCode: cr.postalCode,
        yearBuilt: cr.yearBuilt,
        surfaceBuiltM2: cr.surfaceBuiltM2,
      } : null,
      hasCeeDocument,
      hasBudgetDocument,
      photoCount,
    });

    const isMultiFamily = ['flat', 'penthouse', 'ground_floor'].includes(pd.propertyType);
    reportData.conditionRiskItems = buildConditionRiskItems({
      year: pd.year,
      propertyType: pd.propertyType,
      roofType: pd.roofType,
      windows: pd.windows,
      facadeInsulation: pd.facadeInsulation,
      roofInsulation: pd.roofInsulation,
      ventilation: pd.ventilation,
      heating: pd.heating,
      waterHeating: pd.waterHeating,
      cooling: pd.cooling,
      renewables: pd.renewables,
      hasCeeDocument,
      hasBudgetDocument,
      hasCatastro: Boolean(cr),
      isMultiFamily,
      photoCount,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = await renderToStream(React.createElement(EnerScanReport, { data: reportData }) as any);
    
    // Convert stream to Buffer
    const chunks: Uint8Array[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }
    const mainPdfBytes = Buffer.concat(chunks);

    // Find PDF attachments to append
    const pdfAnnexes: PdfAnnex[] = [];
    for (const attachment of rawAttachments) {
      if (isPdfAttachment(attachment)) {
        const bytes = await getAttachmentBytes(attachment);
        if (bytes) {
          pdfAnnexes.push({
            name: attachment.name,
            bytes,
            category: attachment.category
          });
        }
      }
    }

    let finalPdfBytes: Uint8Array = mainPdfBytes;
    if (pdfAnnexes.length > 0) {
      finalPdfBytes = await appendPdfAnnexes(mainPdfBytes, pdfAnnexes);
    }

    const reportRef = reportData.publicRef || getPublicAssessmentRef(assessmentId);
    const filename = buildReportFilename(reportData, reportRef);
    trackEvent('pdf_downloaded', { assessmentId });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(finalPdfBytes as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
