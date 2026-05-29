import React from 'react';
import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './styles';
import { AssessmentAttachment, PremiumReportData } from '../domain/energy-assessment';
import { getEvidenceFieldLabel, getEvidenceSourceLabel, getEvidenceConfidenceLabel } from '../evidence/evidence-matrix';
import { getElementLabel, getCategoryLabel } from '../condition-risk/types';
import { getLegalDisclaimer, translateConfidence } from '../i18n';
import { formatFileSize } from '../attachments';
import { getPublicAssessmentRef } from '../stateless-assessment';
import { formatCostQuantity, formatEuroRange, formatUnitPrice } from '../costs/format';
import { COST_LEGAL_DISCLAIMER, FUTURE_PRICE_SOURCE_NOTE, PRICE_TRACEABILITY_NOTE } from '../costs/cost-disclaimers';
import { formatArea, getLocale } from '../formatters';
import { getPreferencesForLanguage, PdfLanguage, toDictLanguage, toPdfLanguage } from '../preferences';
import { localizeScenarios, localizeSubsidies } from '../scenario-i18n';

const labels = {
  es: {
    title: 'Informe Premium Anclora EnergyScan',
    subtitle: 'Prediagnóstico energético orientativo',
    demo: 'Informe demo con datos ficticios',
    rating: 'Calificación estimada',
    confidence: 'Confianza',
    zone: 'Zona Climática',
    data: 'Datos declarados',
    yearArea: 'Año / Superficie',
    zipcode: 'Código Postal',
    orientation: 'Orientación / Cubierta',
    systems: 'Sistemas',
    envelope: 'Envolvente',
    renewables: 'Renovables',
    findings: 'Resumen de hallazgos',
    penalties: 'Penalizaciones principales:',
    strengths: 'Fortalezas principales:',
    scenarios: 'Escenarios de mejora',
    regulation: 'Contexto normativo',
    subsidies: 'Ayudas y subvenciones potencialmente relevantes',
    attachments: 'Documentación aportada',
    attachmentsNote: 'Los archivos se registran como soporte documental, pero no han sido analizados automáticamente.',
    annexTitle: 'Anexo',
    userInfoAnnex: 'Información suministrada por el usuario',
    documentsAnnex: 'Documentos aportados',
    noDocuments: 'No se aportaron documentos adicionales.',
    documentsCount: 'Los PDF aportados se incorporan después de su resumen en su formato original.',
    documentsAnnexNote: 'Anexo - Documentación aportada por el usuario. Las evidencias mostradas proceden de la información facilitada y, cuando existan, de los documentos aportados por el usuario.',
    documentsAnnexDemoNote: 'Anexo - Documentación aportada por el usuario. Las evidencias mostradas forman parte de una demo y, en un caso real, serían documentación aportada por el usuario.',
    documentPage: 'Documento aportado',
    fileName: 'Nombre',
    fileType: 'Tipo',
    fileSize: 'Tamaño',
    previewUnavailable: 'El contenido de este formato queda registrado como documento aportado, pero no se convierte automáticamente dentro del informe.',
    scenarioRouteSubtitle: 'Rutas orientativas de mejora',
    objective: 'Objetivo',
    expectedImpact: 'Impacto esperado',
    investment: 'Inversión',
    savings: 'Ahorro',
    jump: 'Salto estimado',
    indicativeRange: 'Rango orientativo',
    economicTitle: 'Estimación económica orientativa',
    economicSubtitle: 'Rangos por escenario y trazabilidad de fuentes',
    economicSummary: 'Resumen económico por escenario',
    economicDetail: 'Detalle de actuaciones estimadas',
    conservativeRecommendedPremium: 'Conservador / recomendado / premium',
    interventionLevel: 'Nivel de intervención',
    heatPumpTitle: 'Bomba de calor y aerotermia',
    technicalNote: 'Nota técnica',
    regulationSubtitle: 'Marco regulatorio aplicable',
    subsidiesSubtitle: 'Ayudas, cautelas y categorías profesionales',
    scope: 'Ámbito',
    appliesTo: 'Aplica a',
    providerCategoriesTitle: 'Categorías de partners y proveedores',
    ceeAnnexNote: 'Las páginas siguientes reproducen el PDF original aportado.',
    exterior: 'Imagen exterior',
    interior: 'Imagen interior',
    id: 'ID',
    date: 'Fecha',
    ceeSubmitted: 'CEE aportado',
    userDocument: 'Documento aportado por el usuario',
    documentSummary: 'Resumen del documento',
    collectedLetter: 'Letra recogida',
    ceeAnnexNoteShort: 'Documento PDF aportado por el usuario.',
    ceeDisclaimer: 'Documento aportado por el usuario. EnergyScan no sustituye al Certificado de Eficiencia Energética oficial ni a la inspección de un técnico competente.',
    imageAnnexDisclaimer: 'Imágenes aportadas por el usuario. Su interpretación es orientativa y requeriría revisión técnica presencial y documentación verificable.',
    imageAnnexDemoDisclaimer: 'Imágenes demo sin validez pericial. En un caso real, su interpretación exigiría revisión técnica presencial y documentación verificable.',
    cadastralReference: 'Referencia catastral',
    cadastralSource: 'Fuente catastral',
    cadastralVerified: 'Datos verificados mediante fuente oficial',
    dataSourcesTitle: 'Fuentes de datos y trazabilidad',
    ceeTitle: 'CEE importado',
    budgetTitle: 'Presupuesto analizado',
    source: 'Fuente',
    value: 'Valor',
    review: 'Revisión',
    budgetImpactDisclaimer: 'El impacto energético estimado de las reformas presupuestadas es orientativo. La mejora real dependerá de proyecto, ejecución, materiales, sistemas existentes y cálculo técnico oficial.',
    evidenceMatrixTitle: 'Matriz de evidencias y confianza',
    evidenceMatrixSubtitle: 'Origen y fiabilidad de los datos clave utilizados en el prediagnóstico',
    evidenceColField: 'Campo',
    evidenceColValue: 'Valor',
    evidenceColSource: 'Fuente',
    evidenceColConfidence: 'Confianza',
    evidenceReview: 'Revisar',
    evidenceNA: 'No disponible',
    checklistTitle: 'Checklist para técnico y proveedor',
    checklistSubtitle: 'Preguntas clave a validar antes de presupuestar o ejecutar',
    checklistItems: [
      '¿La superficie usada corresponde a útil, construida o catastral?',
      '¿El presupuesto desglosa mediciones por partida?',
      '¿La mejora propuesta requiere licencia o autorización comunitaria?',
      '¿La solución afecta a fachada, cubierta o elementos comunes?',
      '¿Se han considerado puentes térmicos y ventilación?',
      '¿Las ayudas/subvenciones están activas y son compatibles con el caso?',
      '¿La instalación requiere legalización o inspección técnica?',
      '¿El CEE aportado está vigente y corresponde al estado actual?',
    ],
    unknownWithoutVisitTitle: 'Qué no sabemos sin visita técnica presencial',
    unknownWithoutVisitItems: [
      'Estado real de la envolvente (fachada, cubierta, puentes térmicos)',
      'Patologías ocultas: humedades, condensación, grietas estructurales',
      'Estado de las instalaciones (calefacción, fontanería, electricidad)',
      'Ventilación real y renovación de aire',
      'Mediciones exactas de superficie y alturas',
      'Cumplimiento técnico definitivo de soluciones propuestas',
    ],
    unknownWithoutVisitDisclaimer: 'Este informe es un prediagnóstico orientativo. No sustituye la inspección de un técnico competente ni el Certificado de Eficiencia Energética oficial.',
    utilityBillsTitle: 'Facturas de suministros (sesión)',
    utilityBillsSubtitle: 'Datos de consumo introducidos por el usuario en la calculadora. No se almacenan en base de datos.',
    utilityElectricity: 'Electricidad',
    utilityGas: 'Gas',
    utilityAmount: 'Importe',
    utilityConsumption: 'Consumo',
    utilityDays: 'Días facturación',
    utilityDistributor: 'Distribuidora',
    utilityMonthlyEst: 'Estimación mensual',
    utilityBillDisclaimer: 'Valores introducidos por el usuario o extraídos automáticamente de facturas. Son orientativos y no han sido validados técnicamente.',
    catastroImagesTitle: 'Imágenes catastrales',
    catastroImagesSubtitle: 'Obtenidas de la Sede Electrónica del Catastro en el momento de generación del informe. No se almacenan.',
    catastroFacadeLabel: 'Foto de fachada (Catastro)',
    catastroSchemeLabel: 'Esquema de parcela catastral',
    catastroMapLabel: 'Cartografía catastral (entorno)',
    catastroDisclaimer: 'Fuente: Sede Electrónica del Catastro (Ministerio de Hacienda). Imágenes obtenidas en tiempo real para este informe y no almacenadas en los sistemas de Anclora EnergyScan.',
  },
  en: {
    title: 'Anclora EnergyScan Premium Report',
    subtitle: 'Indicative Energy Pre-assessment',
    demo: 'Demo report with fictitious data',
    rating: 'Estimated Rating',
    confidence: 'Confidence',
    zone: 'Climate Zone',
    data: 'Declared Data',
    yearArea: 'Year / Area',
    zipcode: 'Postcode',
    orientation: 'Orientation / Roof',
    systems: 'Systems',
    envelope: 'Envelope',
    renewables: 'Renewables',
    findings: 'Findings Summary',
    penalties: 'Main penalties:',
    strengths: 'Main strengths:',
    scenarios: 'Improvement Scenarios',
    regulation: 'Regulatory Context',
    subsidies: 'Potentially relevant grants and subsidies',
    attachments: 'Submitted documentation',
    attachmentsNote: 'Files are registered as supporting documentation, but have not been automatically analyzed.',
    annexTitle: 'Appendix',
    userInfoAnnex: 'Information supplied by the user',
    documentsAnnex: 'Submitted documents',
    noDocuments: 'No additional documents were submitted.',
    documentsCount: 'Each document is included on a separate page of this appendix.',
    documentsAnnexNote: 'Appendix - Submitted documentation. The evidence shown comes from the information supplied and, when available, from documents submitted by the user.',
    documentsAnnexDemoNote: 'Appendix - Submitted documentation. The evidence shown is part of a demo and, in a real case, would be documentation supplied by the user.',
    documentPage: 'Submitted document',
    fileName: 'Name',
    fileType: 'Type',
    fileSize: 'Size',
    previewUnavailable: 'The content of this format is registered as a submitted document, but is not automatically converted inside the report.',
    scenarioRouteSubtitle: 'Indicative improvement routes',
    objective: 'Objective',
    expectedImpact: 'Expected impact',
    investment: 'Investment',
    savings: 'Savings',
    jump: 'Estimated jump',
    indicativeRange: 'Indicative range',
    economicTitle: 'Indicative economic estimate',
    economicSubtitle: 'Ranges by scenario and source traceability',
    economicSummary: 'Economic summary by scenario',
    economicDetail: 'Estimated action detail',
    conservativeRecommendedPremium: 'Conservative / recommended / premium',
    interventionLevel: 'Intervention level',
    heatPumpTitle: 'Heat pump and aerothermal systems',
    technicalNote: 'Technical note',
    regulationSubtitle: 'Applicable regulatory framework',
    subsidiesSubtitle: 'Grants, cautions and professional categories',
    scope: 'Scope',
    appliesTo: 'Applies to',
    providerCategoriesTitle: 'Partner and provider categories',
    ceeAnnexNote: 'The following pages reproduce the original PDF provided by the user.',
    exterior: 'Exterior image',
    interior: 'Interior image',
    id: 'ID',
    date: 'Date',
    ceeSubmitted: 'Submitted EPC',
    userDocument: 'Document provided by user',
    documentSummary: 'Document summary',
    collectedLetter: 'Collected rating',
    ceeAnnexNoteShort: 'PDF document provided by user.',
    ceeDisclaimer: 'Document provided by user. EnergyScan does not replace the official Energy Performance Certificate or an inspection by a qualified technician.',
    imageAnnexDisclaimer: 'Images submitted by the user. Their interpretation is indicative and would require on-site technical review and verifiable documentation.',
    imageAnnexDemoDisclaimer: 'Demo images with no expert validity. In a real case, interpretation would require on-site technical review and verifiable documentation.',
    cadastralReference: 'Cadastral reference',
    cadastralSource: 'Cadastral source',
    cadastralVerified: 'Verified data from official source',
    dataSourcesTitle: 'Data sources and traceability',
    ceeTitle: 'Imported EPC',
    budgetTitle: 'Analysed quote',
    source: 'Source',
    value: 'Value',
    review: 'Review',
    budgetImpactDisclaimer: 'The estimated energy impact of quoted works is indicative. Real improvement depends on design, execution, materials, existing systems and official technical calculation.',
    evidenceMatrixTitle: 'Evidence & confidence matrix',
    evidenceMatrixSubtitle: 'Origin and reliability of the key data used in the pre-assessment',
    evidenceColField: 'Field',
    evidenceColValue: 'Value',
    evidenceColSource: 'Source',
    evidenceColConfidence: 'Confidence',
    evidenceReview: 'Review',
    evidenceNA: 'N/A',
    checklistTitle: 'Checklist for technician and contractor',
    checklistSubtitle: 'Key questions to validate before quoting or executing works',
    checklistItems: [
      'Does the applied area correspond to useful, built or cadastral surface?',
      'Does the quote break down measurements by line item?',
      'Does the proposed improvement require a licence or community approval?',
      'Does the solution affect facade, roof or common elements?',
      'Have thermal bridges and ventilation been considered?',
      'Are grants/subsidies active and compatible with this case?',
      'Does the installation require regulatory approval or technical inspection?',
      'Is the submitted EPC current and does it reflect the actual state?',
    ],
    unknownWithoutVisitTitle: 'What we cannot know without an on-site visit',
    unknownWithoutVisitItems: [
      'Actual condition of the building envelope (facade, roof, thermal bridges)',
      'Hidden pathologies: dampness, condensation, structural cracks',
      'Condition of installations (heating, plumbing, electrical)',
      'Actual ventilation and air renewal rate',
      'Exact measurements of area and heights',
      'Definitive technical compliance of proposed solutions',
    ],
    unknownWithoutVisitDisclaimer: 'This report is an indicative pre-assessment. It does not replace an inspection by a qualified technician or the official Energy Performance Certificate.',
    utilityBillsTitle: 'Session utility bills',
    utilityBillsSubtitle: 'Consumption data entered by the user in the calculator. Not stored in the database.',
    utilityElectricity: 'Electricity',
    utilityGas: 'Gas',
    utilityAmount: 'Amount',
    utilityConsumption: 'Consumption',
    utilityDays: 'Billing days',
    utilityDistributor: 'Distributor',
    utilityMonthlyEst: 'Monthly estimate',
    utilityBillDisclaimer: 'Values entered by the user or automatically extracted from bills. Indicative and not technically validated.',
    catastroImagesTitle: 'Cadastral images',
    catastroImagesSubtitle: 'Retrieved from the Spanish Cadastre (Catastro) at report generation time. Not stored.',
    catastroFacadeLabel: 'Facade photo (Catastro)',
    catastroSchemeLabel: 'Cadastral parcel scheme',
    catastroMapLabel: 'Cadastral map (surroundings)',
    catastroDisclaimer: 'Source: Spanish Electronic Cadastre (Ministry of Finance). Images retrieved in real time for this report and not stored in Anclora EnergyScan systems.',
  },
  de: {
    title: 'Anclora EnergyScan Premium-Bericht',
    subtitle: 'Orientierende energetische Voreinschätzung',
    demo: 'Demo-Bericht mit fiktiven Daten',
    rating: 'Geschätzte Klasse',
    confidence: 'Vertrauen',
    zone: 'Klimazone',
    data: 'Angegebene Daten',
    yearArea: 'Baujahr / Fläche',
    zipcode: 'Postleitzahl',
    orientation: 'Ausrichtung / Dach',
    systems: 'Systeme',
    envelope: 'Gebäudehülle',
    renewables: 'Erneuerbare',
    findings: 'Zusammenfassung',
    penalties: 'Wesentliche Abzüge:',
    strengths: 'Wesentliche Stärken:',
    scenarios: 'Verbesserungsszenarien',
    regulation: 'Regulatorischer Kontext',
    subsidies: 'Potentiell relevante Förderungen',
    attachments: 'Eingereichte Dokumentation',
    attachmentsNote: 'Dateien werden als Nachweis erfasst, aber nicht automatisch analysiert.',
    annexTitle: 'Anhang',
    userInfoAnnex: 'Vom Nutzer bereitgestellte Informationen',
    documentsAnnex: 'Eingereichte Dokumente',
    noDocuments: 'Es wurden keine zusätzlichen Dokumente eingereicht.',
    documentsCount: 'Jedes Dokument wird auf einer separaten Seite dieses Anhangs aufgeführt.',
    documentsAnnexNote: 'Anhang - Eingereichte Dokumentation. Die gezeigten Nachweise stammen aus den bereitgestellten Angaben und, sofern vorhanden, aus vom Nutzer eingereichten Dokumenten.',
    documentsAnnexDemoNote: 'Anhang - Eingereichte Dokumentation. Die gezeigten Nachweise sind Teil einer Demo und wären in einem realen Fall vom Nutzer bereitgestellte Dokumentation.',
    documentPage: 'Eingereichtes Dokument',
    fileName: 'Name',
    fileType: 'Typ',
    fileSize: 'Grösse',
    previewUnavailable: 'Der Inhalt dieses Formats wird als eingereichtes Dokument registriert, aber nicht automatisch in den Bericht konvertiert.',
    scenarioRouteSubtitle: 'Orientierende Verbesserungsrouten',
    objective: 'Ziel',
    expectedImpact: 'Erwartete Wirkung',
    investment: 'Investition',
    savings: 'Einsparung',
    jump: 'Geschätzter Sprung',
    indicativeRange: 'Orientierungsrahmen',
    economicTitle: 'Orientierende Kostenschätzung',
    economicSubtitle: 'Spannen je Szenario und Nachvollziehbarkeit der Quellen',
    economicSummary: 'Kostenzusammenfassung je Szenario',
    economicDetail: 'Geschätzte Maßnahmen im Detail',
    conservativeRecommendedPremium: 'Konservativ / empfohlen / Premium',
    interventionLevel: 'Interventionsniveau',
    heatPumpTitle: 'Wärmepumpe und Aerothermie',
    technicalNote: 'Technische Notiz',
    regulationSubtitle: 'Anwendbarer regulatorischer Rahmen',
    subsidiesSubtitle: 'Förderungen, Hinweise und professionelle Kategorien',
    scope: 'Bereich',
    appliesTo: 'Gilt für',
    providerCategoriesTitle: 'Partner- und Anbieterkategorien',
    ceeAnnexNote: 'Die folgenden Seiten reproduzieren das vom Nutzer bereitgestellte Original-PDF.',
    exterior: 'Außenbild',
    interior: 'Innenbild',
    id: 'ID',
    date: 'Datum',
    ceeSubmitted: 'Eingereichter Energieausweis',
    userDocument: 'Vom Nutzer bereitgestelltes Dokument',
    documentSummary: 'Dokumentenzusammenfassung',
    collectedLetter: 'Erfasste Klasse',
    ceeAnnexNoteShort: 'Vom Nutzer bereitgestelltes PDF-Dokument.',
    ceeDisclaimer: 'Vom Nutzer bereitgestelltes Dokument. EnergyScan ersetzt keinen offiziellen Energieausweis oder eine Prüfung durch einen qualifizierten Techniker.',
    imageAnnexDisclaimer: 'Vom Nutzer eingereichte Bilder. Ihre Interpretation ist orientierend und würde eine technische Vor-Ort-Prüfung und prüfbare Dokumentation erfordern.',
    imageAnnexDemoDisclaimer: 'Demobilder ohne Gutachtenwert. In einem realen Fall erfordert die Interpretation eine technische Vor-Ort-Prüfung und prüfbare Dokumentation.',
    cadastralReference: 'Katasternummer',
    cadastralSource: 'Katasterquelle',
    cadastralVerified: 'Verifizierte Daten aus offizieller Quelle',
    dataSourcesTitle: 'Datenquellen und Nachvollziehbarkeit',
    ceeTitle: 'Importierter Energieausweis',
    budgetTitle: 'Analysiertes Angebot',
    source: 'Quelle',
    value: 'Wert',
    review: 'Prüfung',
    budgetImpactDisclaimer: 'Die geschätzte energetische Wirkung angebotener Arbeiten ist orientierend. Die tatsächliche Verbesserung hängt von Planung, Ausführung, Materialien, bestehenden Systemen und offizieller technischer Berechnung ab.',
    evidenceMatrixTitle: 'Belege- und Zuverlässigkeitsmatrix',
    evidenceMatrixSubtitle: 'Herkunft und Zuverlässigkeit der Schlüsseldaten der Voreinschätzung',
    evidenceColField: 'Feld',
    evidenceColValue: 'Wert',
    evidenceColSource: 'Quelle',
    evidenceColConfidence: 'Zuverlässigkeit',
    evidenceReview: 'Prüfen',
    evidenceNA: 'N/V',
    checklistTitle: 'Checkliste für Fachleute und Anbieter',
    checklistSubtitle: 'Wesentliche Fragen vor der Angebotserstellung oder Ausführung',
    checklistItems: [
      'Entspricht die verwendete Fläche dem Nutz-, Bau- oder Katastermaß?',
      'Schlüsselt das Angebot Mengen je Position auf?',
      'Erfordert die vorgeschlagene Maßnahme eine Genehmigung oder Gemeinschaftsbeschluss?',
      'Betrifft die Lösung Fassade, Dach oder Gemeinschaftselemente?',
      'Wurden Wärmebrücken und Lüftung berücksichtigt?',
      'Sind Förderungen aktiv und für diesen Fall kompatibel?',
      'Ist für die Installation eine behördliche Zulassung erforderlich?',
      'Ist der eingereichte Energieausweis aktuell und entspricht dem Istzustand?',
    ],
    unknownWithoutVisitTitle: 'Was ohne Vor-Ort-Besuch unbekannt bleibt',
    unknownWithoutVisitItems: [
      'Tatsächlicher Zustand der Gebäudehülle (Fassade, Dach, Wärmebrücken)',
      'Verdeckte Schäden: Feuchtigkeit, Kondensation, Risse',
      'Zustand der Installationen (Heizung, Sanitär, Elektro)',
      'Tatsächliche Lüftung und Luftwechselrate',
      'Genaue Maße der Flächen und Raumhöhen',
      'Endgültige technische Konformität der vorgeschlagenen Lösungen',
    ],
    unknownWithoutVisitDisclaimer: 'Dieser Bericht ist eine orientierende Voreinschätzung. Er ersetzt weder die Prüfung durch qualifizierte Fachleute noch den offiziellen Energieausweis.',
    utilityBillsTitle: 'Verbrauchsrechnungen der Sitzung',
    utilityBillsSubtitle: 'Vom Nutzer im Rechner eingegebene Verbrauchsdaten. Nicht in der Datenbank gespeichert.',
    utilityElectricity: 'Strom',
    utilityGas: 'Gas',
    utilityAmount: 'Betrag',
    utilityConsumption: 'Verbrauch',
    utilityDays: 'Abrechnungstage',
    utilityDistributor: 'Versorger',
    utilityMonthlyEst: 'Monatliche Schätzung',
    utilityBillDisclaimer: 'Vom Nutzer eingegebene oder automatisch aus Rechnungen extrahierte Werte. Orientierend und nicht technisch validiert.',
    catastroImagesTitle: 'Katasterbilder',
    catastroImagesSubtitle: 'Zum Zeitpunkt der Berichterstellung vom spanischen Kataster abgerufen. Nicht gespeichert.',
    catastroFacadeLabel: 'Fassadenfoto (Kataster)',
    catastroSchemeLabel: 'Katasterparzellenschema',
    catastroMapLabel: 'Katasterkarte (Umgebung)',
    catastroDisclaimer: 'Quelle: Spanisches elektronisches Kataster (Finanzministerium). Bilder wurden für diesen Bericht in Echtzeit abgerufen und nicht in Anclora EnergyScan-Systemen gespeichert.',
  },
  ca: {
    title: 'Informe Premium Anclora EnergyScan',
    subtitle: 'Prediagnòstic energètic orientatiu',
    demo: 'Informe demo amb dades fictícies',
    rating: 'Qualificació estimada',
    confidence: 'Confiança',
    zone: 'Zona Climàtica',
    data: 'Dades declarades',
    yearArea: 'Any / Superfície',
    zipcode: 'Codi Postal',
    orientation: 'Orientació / Coberta',
    systems: 'Sistemes',
    envelope: 'Envolupant',
    renewables: 'Renovables',
    findings: 'Resum de troballes',
    penalties: 'Penalitzacions principals:',
    strengths: 'Fortaleses principals:',
    scenarios: 'Escenaris de millora',
    regulation: 'Context normatiu',
    subsidies: 'Ajudes i subvencions potencialment rellevants',
    attachments: 'Documentació aportada',
    attachmentsNote: 'Els arxius es registren com a suport documental, però no han estat analitzats automàticament.',
    annexTitle: 'Annex',
    userInfoAnnex: 'Informació subministrada per l\'usuari',
    documentsAnnex: 'Documents aportats',
    noDocuments: 'No s\'han aportat documents addicionals.',
    documentsCount: 'Els PDF aportats s\'incorporen després del seu resum en el seu format original.',
    documentsAnnexNote: 'Annex - Documentació aportada per l\'usuari. Les evidències mostrades procedeixen de la informació facilitada i, quan n\'hi hagi, dels documents aportats per l\'usuari.',
    documentsAnnexDemoNote: 'Annex - Documentació aportada per l\'usuari. Les evidències mostrades formen part d\'una demo i, en un cas real, serien documentació aportada per l\'usuari.',
    documentPage: 'Document aportat',
    fileName: 'Nom',
    fileType: 'Tipus',
    fileSize: 'Mida',
    previewUnavailable: 'El contingut d\'aquest format queda registrat com a document aportat, però no es converteix automàticament dins l\'informe.',
    scenarioRouteSubtitle: 'Rutes orientatives de millora',
    objective: 'Objectiu',
    expectedImpact: 'Impacte esperat',
    investment: 'Inversió',
    savings: 'Estalvi',
    jump: 'Salt estimat',
    indicativeRange: 'Rang orientatiu',
    economicTitle: 'Estimació econòmica orientativa',
    economicSubtitle: 'Rangs per escenari i traçabilitat de fonts',
    economicSummary: 'Resum econòmic per escenari',
    economicDetail: 'Detall d\'actuacions estimades',
    conservativeRecommendedPremium: 'Conservador / recomanat / premium',
    interventionLevel: 'Nivell d\'intervenció',
    heatPumpTitle: 'Bomba de calor i aerotèrmia',
    technicalNote: 'Nota tècnica',
    regulationSubtitle: 'Marc regulatori aplicable',
    subsidiesSubtitle: 'Ajudes, cauteles i categories professionals',
    scope: 'Àmbit',
    appliesTo: 'Aplica a',
    providerCategoriesTitle: 'Categories de partners i proveïdors',
    ceeAnnexNote: 'Les pàgines següents reprodueixen el PDF original aportat.',
    exterior: 'Imatge exterior',
    interior: 'Imatge interior',
    id: 'ID',
    date: 'Data',
    ceeSubmitted: 'CEE aportat',
    userDocument: 'Document aportat per l\'usuari',
    documentSummary: 'Resum del document',
    collectedLetter: 'Lletra recollida',
    ceeAnnexNoteShort: 'Document PDF aportat per l\'usuari.',
    ceeDisclaimer: 'Document aportat per l\'usuari. EnergyScan no substitueix el Certificat d\'Eficiència Energètica oficial ni la inspecció d\'un tècnic competent.',
    imageAnnexDisclaimer: 'Imatges aportades per l\'usuari. La seva interpretació és orientativa i requeriria revisió tècnica presencial i documentació verificable.',
    imageAnnexDemoDisclaimer: 'Imatges demo sense validesa pericial. En un cas real, la seva interpretació exigiria revisió tècnica presencial i documentació verificable.',
    cadastralReference: 'Referència cadastral',
    cadastralSource: 'Font cadastral',
    cadastralVerified: 'Dades verificades mitjançant font oficial',
    dataSourcesTitle: 'Fonts de dades i traçabilitat',
    ceeTitle: 'CEE importat',
    budgetTitle: 'Pressupost analitzat',
    source: 'Font',
    value: 'Valor',
    review: 'Revisió',
    budgetImpactDisclaimer: 'L\'impacte energètic estimat de les reformes pressupostades és orientatiu. La millora real dependrà del projecte, l\'execució, els materials, els sistemes existents i el càlcul tècnic oficial.',
    evidenceMatrixTitle: 'Matriu d\'evidències i confiança',
    evidenceMatrixSubtitle: 'Origen i fiabilitat de les dades clau utilitzades en el prediagnòstic',
    evidenceColField: 'Camp',
    evidenceColValue: 'Valor',
    evidenceColSource: 'Font',
    evidenceColConfidence: 'Confiança',
    evidenceReview: 'Revisar',
    evidenceNA: 'No disponible',
    checklistTitle: 'Checklist per a tècnic i proveïdor',
    checklistSubtitle: 'Preguntes clau a validar abans de pressupostar o executar',
    checklistItems: [
      'La superfície usada correspon a útil, construïda o cadastral?',
      'El pressupost desglossa mesuraments per partida?',
      'La millora proposada requereix llicència o autorització comunitària?',
      'La solució afecta façana, coberta o elements comuns?',
      'S\'han considerat ponts tèrmics i ventilació?',
      'Les ajudes/subvencions estan actives i són compatibles amb el cas?',
      'La instal·lació requereix legalització o inspecció tècnica?',
      'El CEE aportat està vigent i correspon a l\'estat actual?',
    ],
    unknownWithoutVisitTitle: 'Què no sabem sense visita tècnica presencial',
    unknownWithoutVisitItems: [
      'Estat real de l\'envolupant (façana, coberta, ponts tèrmics)',
      'Patologies ocultes: humitats, condensació, esquerdes estructurals',
      'Estat de les instal·lacions (calefacció, fontaneria, electricitat)',
      'Ventilació real i renovació d\'aire',
      'Mesuraments exactes de superfície i alçades',
      'Compliment tècnic definitiu de solucions proposades',
    ],
    unknownWithoutVisitDisclaimer: 'Aquest informe és un prediagnòstic orientatiu. No substitueix la inspecció d\'un tècnic competent ni el Certificat d\'Eficiència Energètica oficial.',
    utilityBillsTitle: 'Factures de subministraments (sessió)',
    utilityBillsSubtitle: 'Dades de consum introduïdes per l\'usuari a la calculadora. No s\'emmagatzemen a la base de dades.',
    utilityElectricity: 'Electricitat',
    utilityGas: 'Gas',
    utilityAmount: 'Import',
    utilityConsumption: 'Consum',
    utilityDays: 'Dies de facturació',
    utilityDistributor: 'Distribuïdora',
    utilityMonthlyEst: 'Estimació mensual',
    utilityBillDisclaimer: 'Valors introduïts per l\'usuari o extrets automàticament de factures. Són orientatius i no han estat validats tècnicament.',
    catastroImagesTitle: 'Imatges cadastrals',
    catastroImagesSubtitle: 'Obtingudes de la Seu Electrònica del Cadastre en el moment de generació de l\'informe. No s\'emmagatzemen.',
    catastroFacadeLabel: 'Foto de façana (Cadastre)',
    catastroSchemeLabel: 'Esquema de parcel·la cadastral',
    catastroMapLabel: 'Cartografia cadastral (entorn)',
    catastroDisclaimer: 'Font: Seu Electrònica del Cadastre (Ministeri d\'Hisenda). Imatges obtingudes en temps real per a aquest informe i no emmagatzemades als sistemes d\'Anclora EnergyScan.',
  },
  fr: {
    title: 'Rapport Premium Anclora EnergyScan',
    subtitle: 'Pré-diagnostic énergétique indicatif',
    demo: 'Rapport démo avec données fictives',
    rating: 'Classement estimé',
    confidence: 'Confiance',
    zone: 'Zone Climatique',
    data: 'Données déclarées',
    yearArea: 'Année / Surface',
    zipcode: 'Code Postal',
    orientation: 'Orientation / Toiture',
    systems: 'Systèmes',
    envelope: 'Enveloppe',
    renewables: 'Énergies renouvelables',
    findings: 'Résumé des observations',
    penalties: 'Principales pénalisations :',
    strengths: 'Principaux atouts :',
    scenarios: 'Scénarios d\'amélioration',
    regulation: 'Contexte réglementaire',
    subsidies: 'Aides et subventions potentiellement pertinentes',
    attachments: 'Documentation fournie',
    attachmentsNote: 'Les fichiers sont enregistrés comme support documentaire, mais n\'ont pas été analysés automatiquement.',
    annexTitle: 'Annexe',
    userInfoAnnex: 'Informations fournies par l\'utilisateur',
    documentsAnnex: 'Documents fournis',
    noDocuments: 'Aucun document supplémentaire n\'a été fourni.',
    documentsCount: 'Chaque document est inclus sur une page séparée de cette annexe.',
    documentsAnnexNote: 'Annexe - Documentation fournie par l\'utilisateur. Les preuves présentées proviennent des informations fournies et, le cas échéant, des documents soumis par l\'utilisateur.',
    documentsAnnexDemoNote: 'Annexe - Documentation fournie par l\'utilisateur. Les preuves présentées font partie d\'une démo et, dans un cas réel, seraient des documents fournis par l\'utilisateur.',
    documentPage: 'Document fourni',
    fileName: 'Nom',
    fileType: 'Type',
    fileSize: 'Taille',
    previewUnavailable: 'Le contenu de ce format est enregistré comme document soumis, mais n\'est pas automatiquement converti dans le rapport.',
    scenarioRouteSubtitle: 'Pistes d\'amélioration indicatives',
    objective: 'Objectif',
    expectedImpact: 'Impact attendu',
    investment: 'Investissement',
    savings: 'Économies',
    jump: 'Saut estimé',
    indicativeRange: 'Plage indicative',
    economicTitle: 'Estimation économique indicative',
    economicSubtitle: 'Plages par scénario et traçabilité des sources',
    economicSummary: 'Résumé économique par scénario',
    economicDetail: 'Détail des actions estimées',
    conservativeRecommendedPremium: 'Conservateur / recommandé / premium',
    interventionLevel: 'Niveau d\'intervention',
    heatPumpTitle: 'Pompe à chaleur et aérothermie',
    technicalNote: 'Note technique',
    regulationSubtitle: 'Cadre réglementaire applicable',
    subsidiesSubtitle: 'Aides, précautions et catégories professionnelles',
    scope: 'Champ d\'application',
    appliesTo: 'S\'applique à',
    providerCategoriesTitle: 'Catégories de partenaires et fournisseurs',
    ceeAnnexNote: 'Les pages suivantes reproduisent le PDF original fourni.',
    exterior: 'Image extérieure',
    interior: 'Image intérieure',
    id: 'ID',
    date: 'Date',
    ceeSubmitted: 'DPE fourni',
    userDocument: 'Document fourni par l\'utilisateur',
    documentSummary: 'Résumé du document',
    collectedLetter: 'Classe relevée',
    ceeAnnexNoteShort: 'Document PDF fourni par l\'utilisateur.',
    ceeDisclaimer: 'Document fourni par l\'utilisateur. EnergyScan ne remplace pas le Diagnostic de Performance Énergétique officiel ni l\'inspection d\'un technicien qualifié.',
    imageAnnexDisclaimer: 'Images soumises par l\'utilisateur. Leur interprétation est indicative et nécessiterait une revue technique sur site et une documentation vérifiable.',
    imageAnnexDemoDisclaimer: 'Images démo sans valeur expertale. Dans un cas réel, l\'interprétation nécessiterait une revue technique sur site et une documentation vérifiable.',
    cadastralReference: 'Référence cadastrale',
    cadastralSource: 'Source cadastrale',
    cadastralVerified: 'Données vérifiées via source officielle',
    dataSourcesTitle: 'Sources de données et traçabilité',
    ceeTitle: 'DPE importé',
    budgetTitle: 'Devis analysé',
    source: 'Source',
    value: 'Valeur',
    review: 'Vérification',
    budgetImpactDisclaimer: 'L\'impact énergétique estimé des travaux devisés est indicatif. L\'amélioration réelle dépendra du projet, de l\'exécution, des matériaux, des systèmes existants et du calcul technique officiel.',
    evidenceMatrixTitle: 'Matrice de preuves et de confiance',
    evidenceMatrixSubtitle: 'Origine et fiabilité des données clés utilisées dans le pré-diagnostic',
    evidenceColField: 'Champ',
    evidenceColValue: 'Valeur',
    evidenceColSource: 'Source',
    evidenceColConfidence: 'Confiance',
    evidenceReview: 'Vérifier',
    evidenceNA: 'N/D',
    checklistTitle: 'Liste de contrôle pour technicien et prestataire',
    checklistSubtitle: 'Questions clés à valider avant de devis ou d\'exécuter',
    checklistItems: [
      'La surface utilisée correspond-elle à la surface utile, construite ou cadastrale ?',
      'Le devis détaille-t-il les métrés par poste ?',
      'L\'amélioration proposée nécessite-t-elle un permis ou une autorisation de copropriété ?',
      'La solution affecte-t-elle la façade, la toiture ou les parties communes ?',
      'Les ponts thermiques et la ventilation ont-ils été pris en compte ?',
      'Les aides/subventions sont-elles actives et compatibles avec ce cas ?',
      'L\'installation nécessite-t-elle une légalisation ou une inspection technique ?',
      'Le DPE fourni est-il en cours de validité et correspond-il à l\'état actuel ?',
    ],
    unknownWithoutVisitTitle: 'Ce que nous ne savons pas sans visite technique sur site',
    unknownWithoutVisitItems: [
      'État réel de l\'enveloppe (façade, toiture, ponts thermiques)',
      'Pathologies cachées : humidité, condensation, fissures structurelles',
      'État des installations (chauffage, plomberie, électricité)',
      'Ventilation réelle et taux de renouvellement d\'air',
      'Mesures exactes de surface et de hauteur',
      'Conformité technique définitive des solutions proposées',
    ],
    unknownWithoutVisitDisclaimer: 'Ce rapport est un pré-diagnostic indicatif. Il ne remplace pas l\'inspection d\'un technicien qualifié ni le Diagnostic de Performance Énergétique officiel.',
    utilityBillsTitle: 'Factures de fluides (session)',
    utilityBillsSubtitle: 'Données de consommation saisies par l\'utilisateur dans la calculatrice. Non stockées en base de données.',
    utilityElectricity: 'Électricité',
    utilityGas: 'Gaz',
    utilityAmount: 'Montant',
    utilityConsumption: 'Consommation',
    utilityDays: 'Jours de facturation',
    utilityDistributor: 'Distributeur',
    utilityMonthlyEst: 'Estimation mensuelle',
    utilityBillDisclaimer: 'Valeurs saisies par l\'utilisateur ou extraites automatiquement des factures. Indicatifs et non validés techniquement.',
    catastroImagesTitle: 'Images cadastrales',
    catastroImagesSubtitle: 'Obtenues du Cadastre espagnol au moment de la génération du rapport. Non stockées.',
    catastroFacadeLabel: 'Photo de façade (Cadastre)',
    catastroSchemeLabel: 'Schéma de parcelle cadastrale',
    catastroMapLabel: 'Cartographie cadastrale (environnement)',
    catastroDisclaimer: 'Source : Cadastre électronique espagnol (Ministère des Finances). Images obtenues en temps réel pour ce rapport et non stockées dans les systèmes Anclora EnergyScan.',
  },
  it: {
    title: 'Rapporto Premium Anclora EnergyScan',
    subtitle: 'Pre-diagnosi energetica indicativa',
    demo: 'Rapporto demo con dati fittizi',
    rating: 'Classificazione stimata',
    confidence: 'Fiducia',
    zone: 'Zona Climatica',
    data: 'Dati dichiarati',
    yearArea: 'Anno / Superficie',
    zipcode: 'Codice Postale',
    orientation: 'Orientamento / Copertura',
    systems: 'Sistemi',
    envelope: 'Involucro',
    renewables: 'Rinnovabili',
    findings: 'Riepilogo dei risultati',
    penalties: 'Penalizzazioni principali:',
    strengths: 'Punti di forza principali:',
    scenarios: 'Scenari di miglioramento',
    regulation: 'Contesto normativo',
    subsidies: 'Aiuti e sovvenzioni potenzialmente rilevanti',
    attachments: 'Documentazione fornita',
    attachmentsNote: 'I file sono registrati come supporto documentale, ma non sono stati analizzati automaticamente.',
    annexTitle: 'Allegato',
    userInfoAnnex: 'Informazioni fornite dall\'utente',
    documentsAnnex: 'Documenti forniti',
    noDocuments: 'Non sono stati forniti documenti aggiuntivi.',
    documentsCount: 'Ogni documento è incluso in una pagina separata di questo allegato.',
    documentsAnnexNote: 'Allegato - Documentazione fornita dall\'utente. Le prove mostrate provengono dalle informazioni fornite e, se disponibili, dai documenti presentati dall\'utente.',
    documentsAnnexDemoNote: 'Allegato - Documentazione fornita dall\'utente. Le prove mostrate fanno parte di una demo e, in un caso reale, sarebbero documentazione fornita dall\'utente.',
    documentPage: 'Documento fornito',
    fileName: 'Nome',
    fileType: 'Tipo',
    fileSize: 'Dimensione',
    previewUnavailable: 'Il contenuto di questo formato è registrato come documento presentato, ma non viene convertito automaticamente nel rapporto.',
    scenarioRouteSubtitle: 'Percorsi di miglioramento indicativi',
    objective: 'Obiettivo',
    expectedImpact: 'Impatto atteso',
    investment: 'Investimento',
    savings: 'Risparmio',
    jump: 'Salto stimato',
    indicativeRange: 'Intervallo indicativo',
    economicTitle: 'Stima economica indicativa',
    economicSubtitle: 'Intervalli per scenario e tracciabilità delle fonti',
    economicSummary: 'Riepilogo economico per scenario',
    economicDetail: 'Dettaglio delle azioni stimate',
    conservativeRecommendedPremium: 'Conservativo / raccomandato / premium',
    interventionLevel: 'Livello di intervento',
    heatPumpTitle: 'Pompa di calore e aerotermia',
    technicalNote: 'Nota tecnica',
    regulationSubtitle: 'Quadro normativo applicabile',
    subsidiesSubtitle: 'Aiuti, cautele e categorie professionali',
    scope: 'Ambito',
    appliesTo: 'Si applica a',
    providerCategoriesTitle: 'Categorie di partner e fornitori',
    ceeAnnexNote: 'Le pagine seguenti riproducono il PDF originale fornito.',
    exterior: 'Immagine esterna',
    interior: 'Immagine interna',
    id: 'ID',
    date: 'Data',
    ceeSubmitted: 'APE fornita',
    userDocument: 'Documento fornito dall\'utente',
    documentSummary: 'Riepilogo del documento',
    collectedLetter: 'Classe raccolta',
    ceeAnnexNoteShort: 'Documento PDF fornito dall\'utente.',
    ceeDisclaimer: 'Documento fornito dall\'utente. EnergyScan non sostituisce l\'Attestato di Prestazione Energetica ufficiale né l\'ispezione di un tecnico qualificato.',
    imageAnnexDisclaimer: 'Immagini fornite dall\'utente. La loro interpretazione è indicativa e richiederebbe una revisione tecnica in loco e documentazione verificabile.',
    imageAnnexDemoDisclaimer: 'Immagini demo senza valore peritale. In un caso reale, l\'interpretazione richiederebbe una revisione tecnica in loco e documentazione verificabile.',
    cadastralReference: 'Riferimento catastale',
    cadastralSource: 'Fonte catastale',
    cadastralVerified: 'Dati verificati tramite fonte ufficiale',
    dataSourcesTitle: 'Fonti dei dati e tracciabilità',
    ceeTitle: 'APE importata',
    budgetTitle: 'Preventivo analizzato',
    source: 'Fonte',
    value: 'Valore',
    review: 'Revisione',
    budgetImpactDisclaimer: 'L\'impatto energetico stimato dei lavori preventivati è indicativo. Il miglioramento reale dipenderà dal progetto, dall\'esecuzione, dai materiali, dai sistemi esistenti e dal calcolo tecnico ufficiale.',
    evidenceMatrixTitle: 'Matrice di prove e fiducia',
    evidenceMatrixSubtitle: 'Origine e affidabilità dei dati chiave utilizzati nella pre-diagnosi',
    evidenceColField: 'Campo',
    evidenceColValue: 'Valore',
    evidenceColSource: 'Fonte',
    evidenceColConfidence: 'Fiducia',
    evidenceReview: 'Verificare',
    evidenceNA: 'N/D',
    checklistTitle: 'Checklist per tecnico e fornitore',
    checklistSubtitle: 'Domande chiave da validare prima di preventivare o eseguire',
    checklistItems: [
      'La superficie utilizzata corrisponde a quella utile, costruita o catastale?',
      'Il preventivo dettaglia le misurazioni per voce?',
      'Il miglioramento proposto richiede una licenza o un\'autorizzazione condominiale?',
      'La soluzione interessa la facciata, la copertura o le parti comuni?',
      'Sono stati considerati i ponti termici e la ventilazione?',
      'Gli aiuti/sovvenzioni sono attivi e compatibili con questo caso?',
      'L\'installazione richiede una regolarizzazione o un\'ispezione tecnica?',
      'L\'APE fornita è in corso di validità e corrisponde allo stato attuale?',
    ],
    unknownWithoutVisitTitle: 'Cosa non sappiamo senza sopralluogo tecnico',
    unknownWithoutVisitItems: [
      'Stato reale dell\'involucro (facciata, copertura, ponti termici)',
      'Patologie nascoste: umidità, condensa, crepe strutturali',
      'Stato degli impianti (riscaldamento, idraulica, elettricità)',
      'Ventilazione reale e tasso di rinnovo d\'aria',
      'Misurazioni esatte di superficie e altezze',
      'Conformità tecnica definitiva delle soluzioni proposte',
    ],
    unknownWithoutVisitDisclaimer: 'Questo rapporto è una pre-diagnosi indicativa. Non sostituisce l\'ispezione di un tecnico qualificato né l\'Attestato di Prestazione Energetica ufficiale.',
    utilityBillsTitle: 'Bollette utenze (sessione)',
    utilityBillsSubtitle: 'Dati di consumo inseriti dall\'utente nella calcolatrice. Non archiviati nel database.',
    utilityElectricity: 'Elettricità',
    utilityGas: 'Gas',
    utilityAmount: 'Importo',
    utilityConsumption: 'Consumo',
    utilityDays: 'Giorni di fatturazione',
    utilityDistributor: 'Distributore',
    utilityMonthlyEst: 'Stima mensile',
    utilityBillDisclaimer: 'Valori inseriti dall\'utente o estratti automaticamente dalle bollette. Indicativi e non validati tecnicamente.',
    catastroImagesTitle: 'Immagini catastali',
    catastroImagesSubtitle: 'Ottenute dal Catasto spagnolo al momento della generazione del rapporto. Non archiviate.',
    catastroFacadeLabel: 'Foto della facciata (Catasto)',
    catastroSchemeLabel: 'Schema della particella catastale',
    catastroMapLabel: 'Cartografia catastale (contesto)',
    catastroDisclaimer: 'Fonte: Catasto Elettronico Spagnolo (Ministero delle Finanze). Immagini ottenute in tempo reale per questo rapporto e non archiviate nei sistemi Anclora EnergyScan.',
  },
  pt: {
    title: 'Relatório Premium Anclora EnergyScan',
    subtitle: 'Pré-diagnóstico energético indicativo',
    demo: 'Relatório demo com dados fictícios',
    rating: 'Classificação estimada',
    confidence: 'Confiança',
    zone: 'Zona Climática',
    data: 'Dados declarados',
    yearArea: 'Ano / Superfície',
    zipcode: 'Código Postal',
    orientation: 'Orientação / Cobertura',
    systems: 'Sistemas',
    envelope: 'Envolvente',
    renewables: 'Renováveis',
    findings: 'Resumo das conclusões',
    penalties: 'Penalizações principais:',
    strengths: 'Pontos fortes principais:',
    scenarios: 'Cenários de melhoria',
    regulation: 'Contexto regulatório',
    subsidies: 'Apoios e subsídios potencialmente relevantes',
    attachments: 'Documentação fornecida',
    attachmentsNote: 'Os ficheiros são registados como suporte documental, mas não foram analisados automaticamente.',
    annexTitle: 'Anexo',
    userInfoAnnex: 'Informação fornecida pelo utilizador',
    documentsAnnex: 'Documentos fornecidos',
    noDocuments: 'Não foram fornecidos documentos adicionais.',
    documentsCount: 'Cada documento é incluído numa página separada deste anexo.',
    documentsAnnexNote: 'Anexo - Documentação fornecida pelo utilizador. As evidências apresentadas provêm das informações fornecidas e, quando existam, dos documentos submetidos pelo utilizador.',
    documentsAnnexDemoNote: 'Anexo - Documentação fornecida pelo utilizador. As evidências apresentadas fazem parte de uma demo e, num caso real, seriam documentação fornecida pelo utilizador.',
    documentPage: 'Documento fornecido',
    fileName: 'Nome',
    fileType: 'Tipo',
    fileSize: 'Tamanho',
    previewUnavailable: 'O conteúdo deste formato é registado como documento submetido, mas não é convertido automaticamente no relatório.',
    scenarioRouteSubtitle: 'Percursos de melhoria indicativos',
    objective: 'Objetivo',
    expectedImpact: 'Impacto esperado',
    investment: 'Investimento',
    savings: 'Poupança',
    jump: 'Salto estimado',
    indicativeRange: 'Intervalo indicativo',
    economicTitle: 'Estimativa económica indicativa',
    economicSubtitle: 'Intervalos por cenário e rastreabilidade das fontes',
    economicSummary: 'Resumo económico por cenário',
    economicDetail: 'Detalhe das ações estimadas',
    conservativeRecommendedPremium: 'Conservador / recomendado / premium',
    interventionLevel: 'Nível de intervenção',
    heatPumpTitle: 'Bomba de calor e aerotermia',
    technicalNote: 'Nota técnica',
    regulationSubtitle: 'Quadro regulatório aplicável',
    subsidiesSubtitle: 'Apoios, cautelas e categorias profissionais',
    scope: 'Âmbito',
    appliesTo: 'Aplica-se a',
    providerCategoriesTitle: 'Categorias de parceiros e fornecedores',
    ceeAnnexNote: 'As páginas seguintes reproduzem o PDF original fornecido.',
    exterior: 'Imagem exterior',
    interior: 'Imagem interior',
    id: 'ID',
    date: 'Data',
    ceeSubmitted: 'SCE fornecido',
    userDocument: 'Documento fornecido pelo utilizador',
    documentSummary: 'Resumo do documento',
    collectedLetter: 'Classe recolhida',
    ceeAnnexNoteShort: 'Documento PDF fornecido pelo utilizador.',
    ceeDisclaimer: 'Documento fornecido pelo utilizador. O EnergyScan não substitui o Certificado de Desempenho Energético oficial nem a inspeção de um técnico qualificado.',
    imageAnnexDisclaimer: 'Imagens fornecidas pelo utilizador. A sua interpretação é indicativa e exigiria revisão técnica presencial e documentação verificável.',
    imageAnnexDemoDisclaimer: 'Imagens demo sem validade pericial. Num caso real, a sua interpretação exigiria revisão técnica presencial e documentação verificável.',
    cadastralReference: 'Referência cadastral',
    cadastralSource: 'Fonte cadastral',
    cadastralVerified: 'Dados verificados através de fonte oficial',
    dataSourcesTitle: 'Fontes de dados e rastreabilidade',
    ceeTitle: 'SCE importado',
    budgetTitle: 'Orçamento analisado',
    source: 'Fonte',
    value: 'Valor',
    review: 'Revisão',
    budgetImpactDisclaimer: 'O impacto energético estimado das reformas orçamentadas é indicativo. A melhoria real dependerá do projeto, da execução, dos materiais, dos sistemas existentes e do cálculo técnico oficial.',
    evidenceMatrixTitle: 'Matriz de evidências e confiança',
    evidenceMatrixSubtitle: 'Origem e fiabilidade dos dados-chave utilizados no pré-diagnóstico',
    evidenceColField: 'Campo',
    evidenceColValue: 'Valor',
    evidenceColSource: 'Fonte',
    evidenceColConfidence: 'Confiança',
    evidenceReview: 'Rever',
    evidenceNA: 'N/D',
    checklistTitle: 'Checklist para técnico e fornecedor',
    checklistSubtitle: 'Questões-chave a validar antes de orçamentar ou executar',
    checklistItems: [
      'A superfície utilizada corresponde à útil, construída ou cadastral?',
      'O orçamento desagrega as medições por item?',
      'A melhoria proposta requer licença ou autorização de condomínio?',
      'A solução afeta a fachada, cobertura ou elementos comuns?',
      'Foram consideradas as pontes térmicas e a ventilação?',
      'Os apoios/subsídios estão ativos e são compatíveis com o caso?',
      'A instalação requer legalização ou inspeção técnica?',
      'O SCE fornecido está vigente e corresponde ao estado atual?',
    ],
    unknownWithoutVisitTitle: 'O que não sabemos sem visita técnica presencial',
    unknownWithoutVisitItems: [
      'Estado real da envolvente (fachada, cobertura, pontes térmicas)',
      'Patologias ocultas: humidade, condensação, fissuras estruturais',
      'Estado das instalações (aquecimento, canalização, eletricidade)',
      'Ventilação real e renovação de ar',
      'Medições exatas de superfície e alturas',
      'Conformidade técnica definitiva das soluções propostas',
    ],
    unknownWithoutVisitDisclaimer: 'Este relatório é um pré-diagnóstico indicativo. Não substitui a inspeção de um técnico qualificado nem o Certificado de Desempenho Energético oficial.',
    utilityBillsTitle: 'Faturas de serviços (sessão)',
    utilityBillsSubtitle: 'Dados de consumo introduzidos pelo utilizador na calculadora. Não armazenados na base de dados.',
    utilityElectricity: 'Eletricidade',
    utilityGas: 'Gás',
    utilityAmount: 'Montante',
    utilityConsumption: 'Consumo',
    utilityDays: 'Dias de faturação',
    utilityDistributor: 'Distribuidora',
    utilityMonthlyEst: 'Estimativa mensal',
    utilityBillDisclaimer: 'Valores introduzidos pelo utilizador ou extraídos automaticamente de faturas. São indicativos e não foram validados tecnicamente.',
    catastroImagesTitle: 'Imagens cadastrais',
    catastroImagesSubtitle: 'Obtidas da Sede Eletrónica do Cadastro espanhol no momento de geração do relatório. Não armazenadas.',
    catastroFacadeLabel: 'Foto da fachada (Cadastro)',
    catastroSchemeLabel: 'Esquema da parcela cadastral',
    catastroMapLabel: 'Cartografia cadastral (envolvente)',
    catastroDisclaimer: 'Fonte: Sede Eletrónica do Cadastro Espanhol (Ministério das Finanças). Imagens obtidas em tempo real para este relatório e não armazenadas nos sistemas Anclora EnergyScan.',
  },
} as const;

const valueLabels: Record<string, Record<string, string>> = {
  es: {
    flat: 'Piso / apartamento',
    house: 'Casa unifamiliar',
    terraced: 'Adosado',
    penthouse: 'Ático',
    ground_floor: 'Planta baja',
    north: 'Norte',
    south: 'Sur',
    east: 'Este',
    west: 'Oeste',
    mixed: 'Mixta',
    flat_roof: 'Cubierta plana',
    pitched: 'Cubierta inclinada',
    shared: 'Cubierta comunitaria',
    gas: 'Gas',
    electric: 'Eléctrico',
    heat_pump: 'Bomba de calor / aerotermia',
    biomass: 'Biomasa',
    none: 'Ninguno',
    split: 'Split',
    central: 'Centralizado',
    natural: 'Natural',
    mechanical: 'Mecánica',
    heat_recovery: 'Recuperación de calor',
    single: 'Cristal simple',
    double: 'Doble acristalamiento',
    triple: 'Triple / bajo emisivo',
    partial: 'Parcial',
    good: 'Bueno',
    photovoltaic: 'Fotovoltaica',
    solar_thermal: 'Solar térmica',
    both: 'Fotovoltaica y solar térmica',
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
    immediate: 'Inmediato',
    six_months: 'Próximos 6 meses',
    one_year: 'Antes de 12 meses',
    three_years: '1-3 años',
    current_state: 'Conocer situación actual',
    target_letter: 'Alcanzar una letra concreta',
    sale_rent: 'Preparar venta o alquiler',
    comfort: 'Mejorar confort',
    regulatory_readiness: 'Preparación regulatoria',
    unknown: 'No declarado',
  },
  en: {
    flat: 'Apartment',
    house: 'Detached house',
    terraced: 'Terraced house',
    penthouse: 'Penthouse',
    ground_floor: 'Ground floor',
    north: 'North',
    south: 'South',
    east: 'East',
    west: 'West',
    mixed: 'Mixed',
    flat_roof: 'Flat roof',
    pitched: 'Pitched roof',
    shared: 'Shared roof',
    gas: 'Gas',
    electric: 'Electric',
    heat_pump: 'Heat pump',
    biomass: 'Biomass',
    none: 'None',
    split: 'Split unit',
    central: 'Central system',
    natural: 'Natural',
    mechanical: 'Mechanical',
    heat_recovery: 'Heat recovery',
    single: 'Single glazing',
    double: 'Double glazing',
    triple: 'Triple / low-e glazing',
    partial: 'Partial',
    good: 'Good',
    photovoltaic: 'Photovoltaic',
    solar_thermal: 'Solar thermal',
    both: 'Photovoltaic and solar thermal',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    immediate: 'Immediate',
    six_months: 'Next 6 months',
    one_year: 'Within 12 months',
    three_years: '1-3 years',
    current_state: 'Understand current state',
    target_letter: 'Reach a target rating',
    sale_rent: 'Prepare sale or rental',
    comfort: 'Improve comfort',
    regulatory_readiness: 'Regulatory readiness',
    unknown: 'Not declared',
  },
  de: {
    flat: 'Wohnung',
    house: 'Einfamilienhaus',
    terraced: 'Reihenhaus',
    penthouse: 'Penthouse',
    ground_floor: 'Erdgeschoss',
    north: 'Nord',
    south: 'Süd',
    east: 'Ost',
    west: 'West',
    mixed: 'Gemischt',
    flat_roof: 'Flachdach',
    pitched: 'Schrägdach',
    shared: 'Gemeinschaftsdach',
    gas: 'Gas',
    electric: 'Elektrisch',
    heat_pump: 'Wärmepumpe',
    biomass: 'Biomasse',
    none: 'Keine',
    split: 'Splitgerät',
    central: 'Zentrales System',
    natural: 'Natürlich',
    mechanical: 'Mechanisch',
    heat_recovery: 'Wärmerückgewinnung',
    single: 'Einfachverglasung',
    double: 'Doppelverglasung',
    triple: 'Dreifachverglasung',
    partial: 'Teilweise',
    good: 'Gut',
    photovoltaic: 'Photovoltaik',
    solar_thermal: 'Solarthermie',
    both: 'Photovoltaik und Solarthermie',
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    immediate: 'Sofort',
    six_months: 'Nächste 6 Monate',
    one_year: 'Innerhalb von 12 Monaten',
    three_years: '1-3 Jahre',
    current_state: 'Aktuellen Zustand verstehen',
    target_letter: 'Zielklasse erreichen',
    sale_rent: 'Verkauf oder Vermietung vorbereiten',
    comfort: 'Komfort verbessern',
    regulatory_readiness: 'Regulatorische Vorbereitung',
    unknown: 'Nicht angegeben',
  },
  ca: {
    flat: 'Pis / apartament', house: 'Casa unifamiliar', terraced: 'Adossat', penthouse: 'Àtic', ground_floor: 'Planta baixa',
    north: 'Nord', south: 'Sud', east: 'Est', west: 'Oest', mixed: 'Mixta',
    flat_roof: 'Coberta plana', pitched: 'Coberta inclinada', shared: 'Coberta comunitària',
    gas: 'Gas', electric: 'Elèctric', heat_pump: 'Bomba de calor / aerotèrmia', biomass: 'Biomassa', none: 'Cap',
    split: 'Split', central: 'Centralitzat', natural: 'Natural', mechanical: 'Mecànica', heat_recovery: 'Recuperació de calor',
    single: 'Vidre simple', double: 'Doble envidriament', triple: 'Triple / baix emissiu', partial: 'Parcial', good: 'Bo',
    photovoltaic: 'Fotovoltaica', solar_thermal: 'Solar tèrmica', both: 'Fotovoltaica i solar tèrmica',
    low: 'Baix', medium: 'Mitjà', high: 'Alt',
    immediate: 'Immediat', six_months: 'Pròxims 6 mesos', one_year: 'Abans de 12 mesos', three_years: '1-3 anys',
    current_state: 'Conèixer situació actual', target_letter: 'Assolir una lletra concreta', sale_rent: 'Preparar venda o lloguer',
    comfort: 'Millorar confort', regulatory_readiness: 'Preparació regulatòria', unknown: 'No declarat',
  },
  fr: {
    flat: 'Appartement', house: 'Maison individuelle', terraced: 'Maison mitoyenne', penthouse: 'Penthouse', ground_floor: 'Rez-de-chaussée',
    north: 'Nord', south: 'Sud', east: 'Est', west: 'Ouest', mixed: 'Mixte',
    flat_roof: 'Toit plat', pitched: 'Toit en pente', shared: 'Toit commun',
    gas: 'Gaz', electric: 'Électrique', heat_pump: 'Pompe à chaleur', biomass: 'Biomasse', none: 'Aucun',
    split: 'Split', central: 'Système central', natural: 'Naturelle', mechanical: 'Mécanique', heat_recovery: 'Récupération de chaleur',
    single: 'Simple vitrage', double: 'Double vitrage', triple: 'Triple / bas émissif', partial: 'Partiel', good: 'Bon',
    photovoltaic: 'Photovoltaïque', solar_thermal: 'Solaire thermique', both: 'Photovoltaïque et solaire thermique',
    low: 'Faible', medium: 'Moyen', high: 'Élevé',
    immediate: 'Immédiat', six_months: '6 prochains mois', one_year: 'Dans 12 mois', three_years: '1-3 ans',
    current_state: 'Comprendre l\'état actuel', target_letter: 'Atteindre une classe cible', sale_rent: 'Préparer vente ou location',
    comfort: 'Améliorer le confort', regulatory_readiness: 'Préparation réglementaire', unknown: 'Non déclaré',
  },
  it: {
    flat: 'Appartamento', house: 'Casa unifamiliare', terraced: 'Casa a schiera', penthouse: 'Attico', ground_floor: 'Piano terra',
    north: 'Nord', south: 'Sud', east: 'Est', west: 'Ovest', mixed: 'Misto',
    flat_roof: 'Tetto piano', pitched: 'Tetto inclinato', shared: 'Tetto condominiale',
    gas: 'Gas', electric: 'Elettrico', heat_pump: 'Pompa di calore', biomass: 'Biomassa', none: 'Nessuno',
    split: 'Split', central: 'Sistema centralizzato', natural: 'Naturale', mechanical: 'Meccanica', heat_recovery: 'Recupero di calore',
    single: 'Vetro singolo', double: 'Doppio vetro', triple: 'Triplo / basso emissivo', partial: 'Parziale', good: 'Buono',
    photovoltaic: 'Fotovoltaico', solar_thermal: 'Solare termico', both: 'Fotovoltaico e solare termico',
    low: 'Basso', medium: 'Medio', high: 'Alto',
    immediate: 'Immediato', six_months: 'Prossimi 6 mesi', one_year: 'Entro 12 mesi', three_years: '1-3 anni',
    current_state: 'Conoscere la situazione attuale', target_letter: 'Raggiungere una classe target', sale_rent: 'Preparare vendita o affitto',
    comfort: 'Migliorare il comfort', regulatory_readiness: 'Preparazione normativa', unknown: 'Non dichiarato',
  },
  pt: {
    flat: 'Apartamento', house: 'Moradia unifamiliar', terraced: 'Moradia em banda', penthouse: 'Cobertura', ground_floor: 'Rés-do-chão',
    north: 'Norte', south: 'Sul', east: 'Este', west: 'Oeste', mixed: 'Misto',
    flat_roof: 'Cobertura plana', pitched: 'Cobertura inclinada', shared: 'Cobertura comum',
    gas: 'Gás', electric: 'Elétrico', heat_pump: 'Bomba de calor', biomass: 'Biomassa', none: 'Nenhum',
    split: 'Split', central: 'Sistema central', natural: 'Natural', mechanical: 'Mecânica', heat_recovery: 'Recuperação de calor',
    single: 'Vidro simples', double: 'Vidro duplo', triple: 'Triplo / baixa emissividade', partial: 'Parcial', good: 'Bom',
    photovoltaic: 'Fotovoltaico', solar_thermal: 'Solar térmico', both: 'Fotovoltaico e solar térmico',
    low: 'Baixo', medium: 'Médio', high: 'Alto',
    immediate: 'Imediato', six_months: 'Próximos 6 meses', one_year: 'Antes de 12 meses', three_years: '1-3 anos',
    current_state: 'Conhecer situação atual', target_letter: 'Alcançar uma classe específica', sale_rent: 'Preparar venda ou arrendamento',
    comfort: 'Melhorar conforto', regulatory_readiness: 'Preparação regulatória', unknown: 'Não declarado',
  },
};

const annexFieldLabels = {
  es: {
    objective: 'Objetivo',
    propertyType: 'Tipo de inmueble',
    year: 'Año de construcción',
    area: 'Superficie útil',
    zipcode: 'Código postal',
    orientation: 'Orientación principal',
    roofType: 'Tipo de cubierta',
    windows: 'Ventanas',
    facadeInsulation: 'Aislamiento de fachada',
    roofInsulation: 'Aislamiento de cubierta',
    heating: 'Calefacción',
    cooling: 'Refrigeración',
    waterHeating: 'Agua caliente sanitaria',
    ventilation: 'Ventilación',
    renewables: 'Renovables',
    budgetRange: 'Presupuesto orientativo',
    timelineHorizon: 'Horizonte temporal',
    targetLetter: 'Letra objetivo',
  },
  en: {
    objective: 'Objective',
    propertyType: 'Property type',
    year: 'Construction year',
    area: 'Usable area',
    zipcode: 'Postcode',
    orientation: 'Main orientation',
    roofType: 'Roof type',
    windows: 'Windows',
    facadeInsulation: 'Facade insulation',
    roofInsulation: 'Roof insulation',
    heating: 'Heating',
    cooling: 'Cooling',
    waterHeating: 'Domestic hot water',
    ventilation: 'Ventilation',
    renewables: 'Renewables',
    budgetRange: 'Indicative budget',
    timelineHorizon: 'Desired timeline',
    targetLetter: 'Target rating',
  },
  de: {
    objective: 'Ziel',
    propertyType: 'Immobilientyp',
    year: 'Baujahr',
    area: 'Nutzfläche',
    zipcode: 'Postleitzahl',
    orientation: 'Hauptausrichtung',
    roofType: 'Dachtyp',
    windows: 'Fenster',
    facadeInsulation: 'Fassadendämmung',
    roofInsulation: 'Dachdämmung',
    heating: 'Heizung',
    cooling: 'Kühlung',
    waterHeating: 'Warmwasser',
    ventilation: 'Lüftung',
    renewables: 'Erneuerbare Energien',
    budgetRange: 'Orientierungsbudget',
    timelineHorizon: 'Gewünschter Zeitraum',
    targetLetter: 'Zielklasse',
  },
  ca: {
    objective: 'Objectiu', propertyType: 'Tipus d\'immoble', year: 'Any de construcció', area: 'Superfície útil',
    zipcode: 'Codi postal', orientation: 'Orientació principal', roofType: 'Tipus de coberta', windows: 'Finestres',
    facadeInsulation: 'Aïllament de façana', roofInsulation: 'Aïllament de coberta', heating: 'Calefacció',
    cooling: 'Refrigeració', waterHeating: 'Aigua calenta sanitària', ventilation: 'Ventilació', renewables: 'Renovables',
    budgetRange: 'Pressupost orientatiu', timelineHorizon: 'Horitzó temporal', targetLetter: 'Lletra objectiu',
  },
  fr: {
    objective: 'Objectif', propertyType: 'Type de bien', year: 'Année de construction', area: 'Surface utile',
    zipcode: 'Code postal', orientation: 'Orientation principale', roofType: 'Type de toiture', windows: 'Fenêtres',
    facadeInsulation: 'Isolation façade', roofInsulation: 'Isolation toiture', heating: 'Chauffage',
    cooling: 'Climatisation', waterHeating: 'Eau chaude sanitaire', ventilation: 'Ventilation', renewables: 'Énergies renouvelables',
    budgetRange: 'Budget indicatif', timelineHorizon: 'Horizon souhaité', targetLetter: 'Classe cible',
  },
  it: {
    objective: 'Obiettivo', propertyType: 'Tipo di immobile', year: 'Anno di costruzione', area: 'Superficie utile',
    zipcode: 'Codice postale', orientation: 'Orientamento principale', roofType: 'Tipo di copertura', windows: 'Finestre',
    facadeInsulation: 'Isolamento facciata', roofInsulation: 'Isolamento copertura', heating: 'Riscaldamento',
    cooling: 'Raffreddamento', waterHeating: 'Acqua calda sanitaria', ventilation: 'Ventilazione', renewables: 'Rinnovabili',
    budgetRange: 'Budget indicativo', timelineHorizon: 'Orizzonte temporale', targetLetter: 'Classe target',
  },
  pt: {
    objective: 'Objetivo', propertyType: 'Tipo de imóvel', year: 'Ano de construção', area: 'Superfície útil',
    zipcode: 'Código postal', orientation: 'Orientação principal', roofType: 'Tipo de cobertura', windows: 'Janelas',
    facadeInsulation: 'Isolamento de fachada', roofInsulation: 'Isolamento de cobertura', heating: 'Aquecimento',
    cooling: 'Arrefecimento', waterHeating: 'Água quente sanitária', ventilation: 'Ventilação', renewables: 'Renováveis',
    budgetRange: 'Orçamento indicativo', timelineHorizon: 'Horizonte temporal', targetLetter: 'Classe objetivo',
  },
} as const;

function labelValue(value: string | undefined, language: PdfLanguage) {
  if (!value) return valueLabels[language].unknown;
  const key = value === 'flat' ? 'flat_roof' : value;
  return valueLabels[language][key] || value;
}

function labelPropertyType(value: string | undefined, language: PdfLanguage) {
  if (!value) return valueLabels[language].unknown;
  return valueLabels[language][value] || value;
}

function buildUserDataRows(data: PremiumReportData, language: PdfLanguage) {
  const p = data.propertyData;
  const fields = annexFieldLabels[language];
  const measurementSystem = data.measurementSystem || getPreferencesForLanguage(language).measurementSystem;
  return [
    [fields.objective, labelValue(p.objective, language)],
    [fields.propertyType, labelPropertyType(p.propertyType, language)],
    [fields.year, String(p.year)],
    [fields.area, formatArea(p.area, measurementSystem, language)],
    [fields.zipcode, p.zipcode],
    [fields.orientation, labelValue(p.orientation, language)],
    [fields.roofType, labelValue(p.roofType, language)],
    [fields.windows, labelValue(p.windows, language)],
    [fields.facadeInsulation, labelValue(p.facadeInsulation, language)],
    [fields.roofInsulation, labelValue(p.roofInsulation, language)],
    [fields.heating, labelValue(p.heating, language)],
    [fields.cooling, labelValue(p.cooling, language)],
    [fields.waterHeating, labelValue(p.waterHeating, language)],
    [fields.ventilation, labelValue(p.ventilation, language)],
    [fields.renewables, labelValue(p.renewables, language)],
    [fields.budgetRange, labelValue(p.budgetRange, language)],
    [fields.timelineHorizon, labelValue(p.timelineHorizon, language)],
    [fields.targetLetter, p.targetLetter || valueLabels[language].unknown],
  ];
}

function formatDocumentsCount(count: number, language: PdfLanguage) {
  const suffix = labels[language].documentsCount;
  if (language === 'en') return `${count} submitted ${count === 1 ? 'document' : 'documents'}. ${suffix}`;
  if (language === 'de') return `${count} ${count === 1 ? 'eingereichtes Dokument' : 'eingereichte Dokumente'}. ${suffix}`;
  if (language === 'fr') return `${count} ${count === 1 ? 'document fourni' : 'documents fournis'}. ${suffix}`;
  if (language === 'it') return `${count} ${count === 1 ? 'documento fornito' : 'documenti forniti'}. ${suffix}`;
  if (language === 'pt') return `${count} ${count === 1 ? 'documento fornecido' : 'documentos fornecidos'}. ${suffix}`;
  // es, ca
  return `${count} ${count === 1 ? 'documento aportado' : 'documentos aportados'}. ${suffix}`;
}

function chunkPairs<T>(items: T[]): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    chunks.push(items.slice(index, index + 2));
  }
  return chunks;
}

function costSourceSummary(language: PdfLanguage, sourceSummary?: string) {
  if (language === 'es' || language === 'ca') return sourceSummary || '';
  if (language === 'en') return 'Indicative cost range based on the internal demo price catalogue. Final prices require a professional quote.';
  if (language === 'de') return 'Orientierende Kostenspanne aus dem internen Demo-Preiskatalog. Endpreise erfordern ein professionelles Angebot.';
  if (language === 'fr') return 'Plage de coût indicative basée sur le catalogue de prix de démo interne. Les prix finaux nécessitent un devis professionnel.';
  if (language === 'it') return 'Intervallo di costo indicativo basato sul catalogo prezzi demo interno. I prezzi finali richiedono un preventivo professionale.';
  return 'Intervalo de custo indicativo baseado no catálogo de preços de demonstração interno. Os preços finais requerem um orçamento profissional.';
}

function localizedCostDisclaimer(language: PdfLanguage, key: 'traceability' | 'future' | 'legal') {
  if (language === 'es' || language === 'ca') {
    if (key === 'traceability') return PRICE_TRACEABILITY_NOTE;
    if (key === 'future') return FUTURE_PRICE_SOURCE_NOTE;
    return COST_LEGAL_DISCLAIMER;
  }
  if (language === 'en') {
    if (key === 'traceability') return 'Indicative cost ranges are traceable to an internal catalogue by intervention type, quantity and confidence level.';
    if (key === 'future') return 'Future versions may connect external price sources. Current figures are not binding quotes.';
    return 'Costs are indicative estimates. They are not a quotation, professional measurement, offer or official EPC calculation.';
  }
  if (language === 'de') {
    if (key === 'traceability') return 'Orientierende Kostenspannen werden einem internen Katalog nach Maßnahmentyp, Menge und Sicherheitsniveau zugeordnet.';
    if (key === 'future') return 'Künftige Versionen können externe Preisquellen anbinden. Aktuelle Werte sind keine verbindlichen Angebote.';
    return 'Kosten sind orientierende Schätzungen. Sie sind kein Angebot, kein Aufmaß, keine verbindliche Offerte und keine offizielle Energieausweisberechnung.';
  }
  if (language === 'fr') {
    if (key === 'traceability') return 'Les plages de coût indicatives sont traçables vers un catalogue interne par type d\'intervention, quantité et niveau de confiance.';
    if (key === 'future') return 'Des versions futures pourront connecter des sources de prix externes. Les chiffres actuels ne sont pas des devis contraignants.';
    return 'Les coûts sont des estimations indicatives. Ils ne constituent pas un devis, un métré, une offre ou un calcul DPE officiel.';
  }
  if (language === 'it') {
    if (key === 'traceability') return 'Gli intervalli di costo indicativi sono tracciabili in un catalogo interno per tipo di intervento, quantità e livello di fiducia.';
    if (key === 'future') return 'Le versioni future potrebbero collegare fonti di prezzi esterne. I valori attuali non sono preventivi vincolanti.';
    return 'I costi sono stime indicative. Non costituiscono un preventivo, una misurazione professionale, un\'offerta o un calcolo APE ufficiale.';
  }
  // pt
  if (key === 'traceability') return 'Os intervalos de custo indicativos são rastreáveis a um catálogo interno por tipo de intervenção, quantidade e nível de confiança.';
  if (key === 'future') return 'Versões futuras poderão ligar fontes de preços externas. Os valores atuais não são orçamentos vinculativos.';
  return 'Os custos são estimativas indicativas. Não constituem um orçamento, medição profissional, oferta ou cálculo SCE oficial.';
}

function localizedProviderCategories(language: PdfLanguage, categories: string[]) {
  const categoryLabels: Record<PdfLanguage, string[]> = {
    es: ['aislamiento', 'ventanas', 'climatización', 'ACS', 'fotovoltaica', 'solar térmica', 'certificador energético'],
    ca: ['aïllament', 'finestres', 'climatització', 'ACS', 'fotovoltaica', 'solar tèrmica', 'certificador energètic'],
    en: ['insulation', 'windows', 'HVAC / heat pumps', 'domestic hot water', 'photovoltaics', 'solar thermal', 'energy assessor'],
    de: ['Dämmung', 'Fenster', 'Klima / Wärmepumpe', 'Warmwasser', 'Photovoltaik', 'Solarthermie', 'Energieausweis-Fachperson'],
    fr: ['isolation', 'fenêtres', 'CVC / pompes à chaleur', 'eau chaude sanitaire', 'photovoltaïque', 'solaire thermique', 'diagnostiqueur énergétique'],
    it: ['isolamento', 'finestre', 'HVAC / pompe di calore', 'acqua calda sanitaria', 'fotovoltaico', 'solare termico', 'certificatore energetico'],
    pt: ['isolamento', 'janelas', 'AVAC / bombas de calor', 'água quente sanitária', 'fotovoltaico', 'solar térmico', 'técnico certificador'],
  };
  return categories.length > 0 ? categoryLabels[language] : [];
}

function localizedRegulatoryCopy(itemId: string, language: PdfLanguage) {
  const copy: Record<string, Record<'en' | 'de' | 'ca' | 'fr' | 'it' | 'pt', { title: string; description: string; impact: string; disclaimer: string; dateLabel: string }>> = {
    'es-rd-390-2021': {
      ca: { title: 'Certificació energètica oficial', description: 'El Reial Decret 390/2021 regula el procediment bàsic per a la certificació d\'eficiència energètica d\'edificis a Espanya.', impact: 'Per a venda o lloguer, l\'usuari necessita un CEE oficial emès per un tècnic competent. EnergyScan només elabora una estimació orientativa.', disclaimer: 'L\'informe EnergyScan no és un CEE oficial i no es pot registrar davant l\'administració.', dateLabel: 'Espanya - vigent' },
      en: { title: 'Official energy certification', description: 'Royal Decree 390/2021 regulates the basic procedure for energy performance certification of buildings in Spain.', impact: 'For sale or rental where applicable, the user needs an official EPC issued by a qualified technician. EnergyScan only prepares an indicative estimate.', disclaimer: 'The EnergyScan report is not an official EPC and cannot be registered with an administration.', dateLabel: 'Spain - current' },
      de: { title: 'Offizieller Energieausweis', description: 'Das Königliche Dekret 390/2021 regelt das grundlegende Verfahren für Energieausweise von Gebäuden in Spanien.', impact: 'Für Verkauf oder Vermietung, soweit anwendbar, ist ein offizieller Energieausweis durch Fachleute erforderlich. EnergyScan erstellt nur eine Orientierung.', disclaimer: 'Der EnergyScan-Bericht ist kein offizieller Energieausweis und kann nicht behördlich registriert werden.', dateLabel: 'Spanien - gültig' },
      fr: { title: 'Certification énergétique officielle', description: 'Le Décret Royal 390/2021 réglemente la procédure de base pour la certification de performance énergétique des bâtiments en Espagne.', impact: 'Pour la vente ou la location, l\'utilisateur a besoin d\'un DPE officiel délivré par un technicien qualifié. EnergyScan n\'établit qu\'une estimation indicative.', disclaimer: 'Le rapport EnergyScan n\'est pas un DPE officiel et ne peut pas être enregistré auprès d\'une administration.', dateLabel: 'Espagne - en vigueur' },
      it: { title: 'Certificazione energetica ufficiale', description: 'Il Decreto Reale 390/2021 regola la procedura di base per la certificazione della prestazione energetica degli edifici in Spagna.', impact: 'Per la vendita o l\'affitto, l\'utente necessita di un\'APE ufficiale rilasciata da un tecnico qualificato. EnergyScan prepara solo una stima indicativa.', disclaimer: 'Il rapporto EnergyScan non è un\'APE ufficiale e non può essere registrato presso un\'amministrazione.', dateLabel: 'Spagna - in vigore' },
      pt: { title: 'Certificação energética oficial', description: 'O Decreto Real 390/2021 regula o procedimento básico para a certificação de desempenho energético de edifícios em Espanha.', impact: 'Para venda ou arrendamento, o utilizador necessita de um SCE oficial emitido por um técnico qualificado. O EnergyScan apenas elabora uma estimativa indicativa.', disclaimer: 'O relatório EnergyScan não é um SCE oficial e não pode ser registado numa administração.', dateLabel: 'Espanha - em vigor' },
    },
    'eu-epbd-2024-1275': {
      ca: { title: 'Directiva (UE) 2024/1275', description: 'La nova EPBD és el marc europeu per millorar l\'eficiència energètica dels edificis i orientar les estratègies nacionals de renovació.', impact: 'Proporciona context regulatori, però les obligacions concretes per a habitatges a Espanya depenen de la transposició nacional.', disclaimer: 'No interpretar-la com una obligació individual directa sense normativa espanyola aplicable.', dateLabel: 'Unió Europea - marc vigent' },
      en: { title: 'Directive (EU) 2024/1275', description: 'The new EPBD is the European framework for improving building energy performance and guiding national renovation strategies.', impact: 'It provides regulatory context, but concrete obligations for homes in Spain depend on national transposition and development.', disclaimer: 'Do not read it as a direct individual obligation without applicable Spanish rules.', dateLabel: 'European Union - current framework' },
      de: { title: 'Richtlinie (EU) 2024/1275', description: 'Die neue EPBD ist der europäische Rahmen zur Verbesserung der Energieeffizienz von Gebäuden und nationaler Sanierungsstrategien.', impact: 'Sie liefert regulatorischen Kontext; konkrete Pflichten für Wohnungen in Spanien hängen von nationaler Umsetzung ab.', disclaimer: 'Nicht als direkte Einzelpflicht ohne anwendbare spanische Vorschriften verstehen.', dateLabel: 'Europäische Union - aktueller Rahmen' },
      fr: { title: 'Directive (UE) 2024/1275', description: 'La nouvelle DPEB est le cadre européen pour améliorer la performance énergétique des bâtiments et orienter les stratégies nationales de rénovation.', impact: 'Elle fournit un contexte réglementaire, mais les obligations concrètes pour les logements en Espagne dépendent de la transposition nationale.', disclaimer: 'Ne pas l\'interpréter comme une obligation individuelle directe sans règles espagnoles applicables.', dateLabel: 'Union européenne - cadre actuel' },
      it: { title: 'Direttiva (UE) 2024/1275', description: 'La nuova EPBD è il quadro europeo per migliorare la prestazione energetica degli edifici e guidare le strategie nazionali di ristrutturazione.', impact: 'Fornisce contesto normativo, ma gli obblighi concreti per le abitazioni in Spagna dipendono dalla trasposizione nazionale.', disclaimer: 'Non interpretarla come un obbligo individuale diretto senza norme spagnole applicabili.', dateLabel: 'Unione Europea - quadro attuale' },
      pt: { title: 'Diretiva (UE) 2024/1275', description: 'A nova EPBD é o quadro europeu para melhorar o desempenho energético dos edifícios e orientar as estratégias nacionais de renovação.', impact: 'Fornece contexto regulatório, mas as obrigações concretas para habitações em Espanha dependem da transposição nacional.', disclaimer: 'Não a interpretar como uma obrigação individual direta sem regras espanholas aplicáveis.', dateLabel: 'União Europeia - quadro atual' },
    },
    'es-pniec': {
      ca: { title: 'PNIEC i renovació energètica', description: 'El PNIEC és una referència estratègica per a la política energètica i climàtica, incloent eficiència, electrificació, renovables i renovació.', impact: 'Pot orientar prioritats d\'inversió i programes de suport, però no confirma elegibilitat ni imports per a un habitatge concret.', disclaimer: 'Consultar sempre les fonts oficials nacionals, regionals o municipals per a convocatòries actives.', dateLabel: 'Espanya - referència estratègica' },
      en: { title: 'PNIEC and energy renovation', description: 'The PNIEC is a strategic reference for energy and climate policy, including efficiency, electrification, renewables and renovation.', impact: 'It may guide investment priorities and support programmes, but does not confirm eligibility or amounts for a specific home.', disclaimer: 'Always check official national, regional or municipal sources for active calls.', dateLabel: 'Spain - strategic reference' },
      de: { title: 'PNIEC und energetische Sanierung', description: 'Der PNIEC ist eine strategische Referenz der Energie- und Klimapolitik, einschließlich Effizienz, Elektrifizierung, Erneuerbare und Sanierung.', impact: 'Er kann Investitionsprioritäten und Förderprogramme einordnen, bestätigt aber keine Förderfähigkeit oder Beträge für eine konkrete Immobilie.', disclaimer: 'Aktive Programme immer bei offiziellen staatlichen, regionalen oder kommunalen Quellen prüfen.', dateLabel: 'Spanien - strategische Referenz' },
      fr: { title: 'PNIEC et rénovation énergétique', description: 'Le PNIEC est une référence stratégique pour la politique énergétique et climatique, incluant l\'efficacité, l\'électrification, les renouvelables et la rénovation.', impact: 'Il peut orienter les priorités d\'investissement et les programmes de soutien, mais ne confirme pas l\'éligibilité ou les montants pour un logement spécifique.', disclaimer: 'Toujours vérifier les sources officielles nationales, régionales ou municipales pour les appels actifs.', dateLabel: 'Espagne - référence stratégique' },
      it: { title: 'PNIEC e ristrutturazione energetica', description: 'Il PNIEC è un riferimento strategico per la politica energetica e climatica, includendo efficienza, elettrificazione, rinnovabili e ristrutturazione.', impact: 'Può orientare le priorità di investimento e i programmi di supporto, ma non conferma l\'ammissibilità o gli importi per un\'abitazione specifica.', disclaimer: 'Verificare sempre le fonti ufficiali nazionali, regionali o comunali per i bandi attivi.', dateLabel: 'Spagna - riferimento strategico' },
      pt: { title: 'PNIEC e renovação energética', description: 'O PNIEC é uma referência estratégica para a política energética e climática, incluindo eficiência, eletrificação, renováveis e renovação.', impact: 'Pode orientar prioridades de investimento e programas de apoio, mas não confirma elegibilidade ou montantes para uma habitação específica.', disclaimer: 'Verificar sempre as fontes oficiais nacionais, regionais ou municipais para concursos ativos.', dateLabel: 'Espanha - referência estratégica' },
    },
    'eu-2030-2033-residential': {
      ca: { title: 'Reducció del consum residencial mitjà', description: 'La Directiva (UE) 2024/1275 introdueix objectius nacionals per reduir el consum d\'energia primària mitjà del parc residencial.', impact: 'Pot augmentar l\'interès comercial i regulatori en millorar habitatges ineficients, especialment abans de venda, lloguer o renovació.', disclaimer: 'Aquests horitzons no reemplacen la transposició espanyola i no defineixen una obligació individual per a aquest habitatge.', dateLabel: 'Horitzó europeu' },
      en: { title: 'Average residential consumption reduction', description: 'Directive (EU) 2024/1275 introduces national-level targets to reduce average primary energy consumption in the residential stock.', impact: 'It may increase commercial and regulatory interest in improving inefficient homes, especially before sale, rental or renovation.', disclaimer: 'These horizons do not replace Spanish transposition and do not define an individual obligation for this home by themselves.', dateLabel: 'European horizon' },
      de: { title: 'Reduktion des durchschnittlichen Wohnenergieverbrauchs', description: 'Die Richtlinie (EU) 2024/1275 führt nationale Ziele zur Senkung des durchschnittlichen Primärenergieverbrauchs im Wohnbestand ein.', impact: 'Dies kann das Interesse an der Verbesserung ineffizienter Wohnungen erhöhen, besonders vor Verkauf, Vermietung oder Sanierung.', disclaimer: 'Diese Horizonte ersetzen nicht die spanische Umsetzung und begründen allein keine Einzelpflicht für diese Immobilie.', dateLabel: 'Europäischer Horizont' },
      fr: { title: 'Réduction de la consommation résidentielle moyenne', description: 'La Directive (UE) 2024/1275 introduit des objectifs nationaux pour réduire la consommation d\'énergie primaire moyenne du parc résidentiel.', impact: 'Cela peut accroître l\'intérêt commercial et réglementaire pour l\'amélioration des logements inefficaces, notamment avant vente, location ou rénovation.', disclaimer: 'Ces horizons ne remplacent pas la transposition espagnole et ne définissent pas d\'obligation individuelle pour ce logement.', dateLabel: 'Horizon européen' },
      it: { title: 'Riduzione del consumo residenziale medio', description: 'La Direttiva (UE) 2024/1275 introduce obiettivi nazionali per ridurre il consumo medio di energia primaria nel parco residenziale.', impact: 'Può aumentare l\'interesse commerciale e normativo per il miglioramento delle abitazioni inefficienti, soprattutto prima della vendita, affitto o ristrutturazione.', disclaimer: 'Questi orizzonti non sostituiscono la trasposizione spagnola e non definiscono un obbligo individuale per questa abitazione.', dateLabel: 'Orizzonte europeo' },
      pt: { title: 'Redução do consumo residencial médio', description: 'A Diretiva (UE) 2024/1275 introduz metas nacionais para reduzir o consumo médio de energia primária no parque residencial.', impact: 'Pode aumentar o interesse comercial e regulatório na melhoria de habitações ineficientes, especialmente antes de venda, arrendamento ou renovação.', disclaimer: 'Estes horizontes não substituem a transposição espanhola e não definem uma obrigação individual para esta habitação.', dateLabel: 'Horizonte europeu' },
    },
    'eu-2050-zero-emission': {
      ca: { title: 'Parc d\'edificis de zero emissions', description: 'L\'estratègia europea apunta a un parc d\'edificis descarbonitzat i amb emissions molt baixes el 2050.', impact: 'Reforça la conveniència de planificar millores per fases: envolupant, electrificació eficient i renovables on sigui viable.', disclaimer: 'Context estratègic a llarg termini, no un diagnòstic oficial ni assessorament legal.', dateLabel: 'Llarg termini' },
      en: { title: 'Zero-emission building stock', description: 'The European strategy points to a decarbonised, very low-emission building stock by 2050.', impact: 'It reinforces the convenience of planning improvements in phases: envelope, efficient electrification and renewables where viable.', disclaimer: 'Long-term strategic context, not an official diagnosis or legal advice.', dateLabel: 'Long term' },
      de: { title: 'Emissionsfreier Gebäudebestand', description: 'Die europäische Strategie zielt bis 2050 auf einen dekarbonisierten Gebäudebestand mit sehr niedrigen Emissionen.', impact: 'Sie unterstützt eine phasenweise Planung: Gebäudehülle, effiziente Elektrifizierung und erneuerbare Energien, wo tragfähig.', disclaimer: 'Langfristiger strategischer Kontext, keine offizielle Diagnose oder Rechtsberatung.', dateLabel: 'Langfristig' },
      fr: { title: 'Parc immobilier zéro émission', description: 'La stratégie européenne vise un parc immobilier décarbonisé, à très faibles émissions d\'ici 2050.', impact: 'Elle renforce la pertinence de planifier des améliorations par phases : enveloppe, électrification efficace et renouvelables là où c\'est viable.', disclaimer: 'Contexte stratégique à long terme, pas un diagnostic officiel ni un conseil juridique.', dateLabel: 'Long terme' },
      it: { title: 'Parco edilizio a zero emissioni', description: 'La strategia europea punta a un parco edilizio decarbonizzato, a bassissime emissioni entro il 2050.', impact: 'Rafforza la convenienza di pianificare miglioramenti per fasi: involucro, elettrificazione efficiente e rinnovabili dove fattibile.', disclaimer: 'Contesto strategico a lungo termine, non una diagnosi ufficiale né una consulenza legale.', dateLabel: 'Lungo termine' },
      pt: { title: 'Parque edificado de zero emissões', description: 'A estratégia europeia aponta para um parque edificado descarbonizado e de emissões muito baixas até 2050.', impact: 'Reforça a conveniência de planear melhorias por fases: envolvente, eletrificação eficiente e renováveis onde viável.', disclaimer: 'Contexto estratégico de longo prazo, não um diagnóstico oficial nem aconselhamento jurídico.', dateLabel: 'Longo prazo' },
    },
  };
  if (language === 'es') return null;
  return copy[itemId]?.[language] || null;
}

function localizedRegulatoryYear(year: string, language: PdfLanguage) {
  if (year === 'Hoy') {
    if (language === 'en') return 'Today';
    if (language === 'de') return 'Heute';
    if (language === 'ca') return 'Avui';
    if (language === 'fr') return 'Aujourd\'hui';
    if (language === 'it') return 'Oggi';
    if (language === 'pt') return 'Hoje';
  }
  return year;
}

export const EnerScanReport = ({ data }: { data: PremiumReportData }) => {
  const language: PdfLanguage = toPdfLanguage(data.language);
  const defaults = getPreferencesForLanguage(language);
  const currency = data.currency || defaults.currency;
  const measurementSystem = data.measurementSystem || defaults.measurementSystem;
  const t = labels[language];
  const appName = data.brandName ?? 'Anclora EnergyScan';
  const reportTitle = t.title.replace('Anclora EnergyScan', appName);
  const reportRef = data.publicRef || getPublicAssessmentRef(data.id);
  const dictLang = toDictLanguage(language);
  const scenarios = localizeScenarios(data.scenarios, language);
  const subsidies = localizeSubsidies(data.subsidies || [], language);
  const attachments = data.attachments || [];
  const imageAttachments = attachments.filter((attachment) => attachment.previewDataUri);
  const isCeeAttachment = (attachment: AssessmentAttachment) => attachment.category === 'CEE';
  const ceeAttachments = attachments.filter(isCeeAttachment);
  const otherAttachments = attachments.filter((attachment) => !attachment.previewDataUri && !isCeeAttachment(attachment));
  const imagePages = chunkPairs(imageAttachments);

  return (
  <Document>
    {/* Page 1: Executive Summary */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brandHeader}>
          {data.logoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
            <Image src={data.logoDataUri} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{reportTitle}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
            <Text style={{ ...styles.text, marginTop: 5 }}>{t.id}: {reportRef} | {t.date}: {data.date}</Text>
            {data.isDemo && <Text style={{ ...styles.text, color: '#B96F00' }}>{t.demo}</Text>}
          </View>
        </View>
      </View>

      <View style={styles.scoreBox}>
        <Text style={styles.text}>{t.rating}</Text>
        <Text style={styles.letter}>{data.scoreResult.estimatedLetter}</Text>
        <Text style={styles.text}>{t.confidence}: {data.scoreResult.confidence} | Score: {data.scoreResult.score}/100</Text>
        <Text style={styles.text}>{t.zone}: {data.scoreResult.climateZone}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.data}</Text>
        <View style={styles.row}><Text style={styles.colLeft}>{t.yearArea}</Text><Text style={styles.colRight}>{data.propertyData.year} / {formatArea(data.propertyData.area, measurementSystem, language)}</Text></View>
        <View style={styles.row}><Text style={styles.colLeft}>{t.zipcode}</Text><Text style={styles.colRight}>{data.propertyData.zipcode}</Text></View>
        <View style={styles.row}><Text style={styles.colLeft}>{t.orientation}</Text><Text style={styles.colRight}>{labelValue(data.propertyData.orientation, language)} / {labelValue(data.propertyData.roofType, language)}</Text></View>
        <View style={styles.row}><Text style={styles.colLeft}>{t.systems}</Text><Text style={styles.colRight}>{labelValue(data.propertyData.heating, language)} / {labelValue(data.propertyData.cooling, language)} / {labelValue(data.propertyData.waterHeating, language)}</Text></View>
        <View style={styles.row}><Text style={styles.colLeft}>{t.envelope}</Text><Text style={styles.colRight}>{labelValue(data.propertyData.windows, language)} / {labelValue(data.propertyData.facadeInsulation, language)} / {labelValue(data.propertyData.roofInsulation, language)}</Text></View>
        <View style={styles.row}><Text style={styles.colLeft}>{t.renewables}</Text><Text style={styles.colRight}>{labelValue(data.propertyData.renewables, language)}</Text></View>
        
        {data.cadastralRecord && (
          <View style={{ marginTop: 10, padding: 8, backgroundColor: '#f0fff4', borderRadius: 4, border: '0.5pt solid #c6f6d5' }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#22543d', marginBottom: 4 }}>✓ {t.cadastralVerified}</Text>
            <View style={styles.row}><Text style={{ ...styles.colLeft, fontSize: 8 }}>{t.cadastralReference}</Text><Text style={{ ...styles.colRight, fontSize: 8, fontWeight: 'bold' }}>{data.cadastralRecord.cadastralReference}</Text></View>
            <View style={styles.row}><Text style={{ ...styles.colLeft, fontSize: 8 }}>{t.cadastralSource}</Text><Text style={{ ...styles.colRight, fontSize: 8 }}>{data.cadastralRecord.source.toUpperCase()} ({data.date})</Text></View>
          </View>
        )}
      </View>

      {Boolean(data.energyCertificates?.length || data.rehabBudgets?.length || data.dataFieldSources?.length) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.dataSourcesTitle}</Text>
          {(data.dataFieldSources || []).slice(0, 8).map((field, index) => (
            <View key={`${field.fieldName}-${index}`} style={styles.row}>
              <Text style={styles.colLeft}>{field.fieldName}</Text>
              <Text style={styles.colRight}>{String(field.value)} · {field.sourceLabel || field.sourceType} · {field.confidence ? `${Math.round(field.confidence * 100)}%` : t.review}</Text>
            </View>
          ))}
          {(data.energyCertificates || []).map((certificate, index) => (
            <View key={`certificate-${index}`} style={{ marginTop: 8, padding: 8, backgroundColor: '#f0fff4', borderRadius: 4 }}>
              <Text style={{ ...styles.text, fontWeight: 'bold', color: '#22543d' }}>{t.ceeTitle}</Text>
              <View style={styles.row}><Text style={styles.colLeft}>{t.collectedLetter}</Text><Text style={styles.colRight}>{certificate.globalLetter || '-'}</Text></View>
              <View style={styles.row}><Text style={styles.colLeft}>EPnr</Text><Text style={styles.colRight}>{certificate.nonRenewableEPKwhM2Year ?? '-'} kWh/m²·año</Text></View>
              <View style={styles.row}><Text style={styles.colLeft}>CO2</Text><Text style={styles.colRight}>{certificate.emissionsKgCO2M2Year ?? '-'} kgCO₂/m²·año</Text></View>
              <View style={styles.row}><Text style={styles.colLeft}>{t.yearArea}</Text><Text style={styles.colRight}>{certificate.yearBuilt || '-'} / {certificate.usefulAreaM2 || certificate.builtAreaM2 || '-'} m²</Text></View>
            </View>
          ))}
          {(data.rehabBudgets || []).map((budget, index) => (
            <View key={`budget-${index}`} style={{ marginTop: 8, padding: 8, backgroundColor: '#fff8e1', borderRadius: 4 }}>
              <Text style={{ ...styles.text, fontWeight: 'bold', color: '#856404' }}>{t.budgetTitle}</Text>
              <View style={styles.row}><Text style={styles.colLeft}>{t.investment}</Text><Text style={styles.colRight}>{budget.totalAmount ? new Intl.NumberFormat(getLocale(language), { style: 'currency', currency: budget.currency || currency }).format(budget.totalAmount) : '-'}</Text></View>
              <View style={styles.row}><Text style={styles.colLeft}>{t.jump}</Text><Text style={styles.colRight}>{budget.estimatedCurrentLetter || '-'} → {budget.estimatedPostBudgetLetter || '-'}</Text></View>
              <Text style={styles.text}>{budget.analysisSummary}</Text>
              <Text style={{ ...styles.text, color: '#856404', fontSize: 8 }}>{t.budgetImpactDisclaimer}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.findings}</Text>
        <Text style={styles.text}>{data.scoreResult.explanation}</Text>
        
        {data.scoreResult.penalties.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ ...styles.text, fontWeight: 'bold', color: '#EF4444' }}>{t.penalties}</Text>
            {data.scoreResult.penalties.map((p, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{p}</Text>
              </View>
            ))}
          </View>
        )}
        {data.scoreResult.strengths.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ ...styles.text, fontWeight: 'bold', color: '#008F5A' }}>{t.strengths}</Text>
            {data.scoreResult.strengths.map((s, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.disclaimer}>
        <Text>{getLegalDisclaimer(language)}</Text>
      </View>
    </Page>

    {/* Catastro images page — only rendered when images are available */}
    {(data.catastroImages?.facadeDataUri || data.catastroImages?.schemeDataUri || data.catastroImages?.mapDataUri) && (
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View style={styles.brandHeader}>
            {data.logoDataUri && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={data.logoDataUri} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>{reportTitle}</Text>
              <Text style={styles.subtitle}>{t.catastroImagesTitle}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.catastroImagesTitle}</Text>
          <Text style={{ ...styles.text, marginBottom: 10 }}>{t.catastroImagesSubtitle}</Text>

          {/* Facade + parcel scheme side by side when both available */}
          {data.catastroImages.facadeDataUri && data.catastroImages.schemeDataUri ? (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>{t.catastroFacadeLabel}</Text>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={data.catastroImages.facadeDataUri} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>{t.catastroSchemeLabel}</Text>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={data.catastroImages.schemeDataUri} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }} />
              </View>
            </View>
          ) : (
            <>
              {data.catastroImages.facadeDataUri && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>{t.catastroFacadeLabel}</Text>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={data.catastroImages.facadeDataUri} style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 4 }} />
                </View>
              )}
              {data.catastroImages.schemeDataUri && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>{t.catastroSchemeLabel}</Text>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={data.catastroImages.schemeDataUri} style={{ width: '60%', maxHeight: 240, objectFit: 'contain', borderRadius: 4 }} />
                </View>
              )}
            </>
          )}

          {data.catastroImages.mapDataUri && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>{t.catastroMapLabel}</Text>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={data.catastroImages.mapDataUri} style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 4 }} />
            </View>
          )}
        </View>

        <View style={styles.disclaimer}>
          <Text style={{ fontSize: 7, color: '#6B7280' }}>{t.catastroDisclaimer}</Text>
        </View>
      </Page>
    )}

    {/* Utility bills page — only rendered when session bills were provided */}
    {data.utilityBills && data.utilityBills.length > 0 && (() => {
      const electricityBills = data.utilityBills!.filter((b) => b.supplyType === 'electricity');
      const gasBills = data.utilityBills!.filter((b) => b.supplyType === 'gas');

      function renderBillTable(bills: typeof data.utilityBills, supplyLabel: string) {
        if (!bills?.length) return null;
        return (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 4 }}>{supplyLabel}</Text>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#D1FAE5', paddingBottom: 2, marginBottom: 3 }}>
              {[t.utilityDistributor, t.utilityAmount, t.utilityConsumption, t.utilityDays, t.utilityMonthlyEst].map((col) => (
                <Text key={col} style={{ flex: 1, fontSize: 7, fontWeight: 'bold', color: '#374151' }}>{col}</Text>
              ))}
            </View>
            {bills.map((bill, idx) => {
              const monthly = bill.amountEur != null && bill.billingDays
                ? (bill.amountEur / (bill.billingDays / 30.44)).toFixed(2)
                : bill.amountEur != null
                ? bill.amountEur.toFixed(2)
                : '—';
              return (
                <View key={idx} style={{ flexDirection: 'row', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' }}>
                  <Text style={{ flex: 1, fontSize: 8, color: '#374151' }}>{bill.distributorName ?? '—'}</Text>
                  <Text style={{ flex: 1, fontSize: 8, color: '#374151' }}>{bill.amountEur != null ? `${bill.amountEur.toFixed(2)} €` : '—'}</Text>
                  <Text style={{ flex: 1, fontSize: 8, color: '#374151' }}>{bill.consumptionValue != null ? `${bill.consumptionValue}` : '—'}</Text>
                  <Text style={{ flex: 1, fontSize: 8, color: '#374151' }}>{bill.billingDays ?? '—'}</Text>
                  <Text style={{ flex: 1, fontSize: 8, color: '#008F5A', fontWeight: 'bold' }}>{monthly} €/mes</Text>
                </View>
              );
            })}
          </View>
        );
      }

      return (
        <Page size="A4" style={styles.page}>
          <View style={styles.header} fixed>
            <View style={styles.brandHeader}>
              {data.logoDataUri && (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={data.logoDataUri} style={styles.logo} />
              )}
              <View style={styles.headerText}>
                <Text style={styles.title}>{reportTitle}</Text>
                <Text style={styles.subtitle}>{t.utilityBillsTitle}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.utilityBillsTitle}</Text>
            <Text style={{ ...styles.text, marginBottom: 10 }}>{t.utilityBillsSubtitle}</Text>
            {renderBillTable(electricityBills, t.utilityElectricity)}
            {renderBillTable(gasBills, t.utilityGas)}
          </View>

          <View style={styles.disclaimer}>
            <Text style={{ fontSize: 7, color: '#6B7280' }}>{t.utilityBillDisclaimer}</Text>
          </View>
        </Page>
      );
    })()}

    {/* Evidence Matrix + Checklist + Unknown without visit */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.brandHeader}>
          {data.logoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={data.logoDataUri} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{reportTitle}</Text>
            <Text style={{ ...styles.text }}>{t.id}: {reportRef} | {t.date}: {data.date}</Text>
          </View>
        </View>
      </View>

      {/* Evidence Matrix */}
      {data.evidenceItems && data.evidenceItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.evidenceMatrixTitle}</Text>
          <Text style={{ ...styles.text, marginBottom: 6 }}>{t.evidenceMatrixSubtitle}</Text>
          {/* Header row */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#00DC82', paddingBottom: 3, marginBottom: 4 }}>
            <Text style={{ ...styles.text, flex: 2, fontWeight: 'bold', fontSize: 8 }}>{t.evidenceColField}</Text>
            <Text style={{ ...styles.text, flex: 2, fontWeight: 'bold', fontSize: 8 }}>{t.evidenceColValue}</Text>
            <Text style={{ ...styles.text, flex: 2, fontWeight: 'bold', fontSize: 8 }}>{t.evidenceColSource}</Text>
            <Text style={{ ...styles.text, flex: 1, fontWeight: 'bold', fontSize: 8 }}>{t.evidenceColConfidence}</Text>
          </View>
          {data.evidenceItems.slice(0, 12).map((item) => (
            <View key={item.key} style={{ flexDirection: 'row', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: '#262626' }}>
              <Text style={{ ...styles.text, flex: 2, fontSize: 8 }}>{getEvidenceFieldLabel(item.key, dictLang)}</Text>
              <Text style={{ ...styles.text, flex: 2, fontSize: 8 }}>
                {item.value != null && item.value !== '' ? String(item.value) : t.evidenceNA}
                {item.requiresReview ? ` [${t.evidenceReview}]` : ''}
              </Text>
              <Text style={{ ...styles.text, flex: 2, fontSize: 8 }}>{getEvidenceSourceLabel(item.source, dictLang)}</Text>
              <Text style={{ ...styles.text, flex: 1, fontSize: 8, color: item.confidence === 'high' ? '#00DC82' : item.confidence === 'medium' ? '#FFB020' : item.confidence === 'low' ? '#EF4444' : '#7A7A7A' }}>
                {getEvidenceConfidenceLabel(item.confidence, dictLang)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Condition & Risk summary in PDF */}
      {data.conditionRiskItems && data.conditionRiskItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Condition & Risk (Indicative)' : language === 'de' ? 'Zustand & Risiko (Orientierend)' : language === 'ca' ? 'Estat & Risc (Orientatiu)' : language === 'fr' ? 'État & Risque (Indicatif)' : language === 'it' ? 'Stato & Rischio (Indicativo)' : language === 'pt' ? 'Estado & Risco (Indicativo)' : 'Estado & Riesgo (Orientativo)'}
          </Text>
          {data.conditionRiskItems
            .filter((i) => i.category >= 2)
            .slice(0, 6)
            .map((item) => (
            <View key={item.element} style={{ flexDirection: 'row', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: '#262626' }}>
              <Text style={{ ...styles.text, flex: 3, fontSize: 8 }}>{getElementLabel(item.element, dictLang)}</Text>
              <Text style={{ ...styles.text, flex: 2, fontSize: 8, color: item.category === 3 ? '#EF4444' : '#FFB020' }}>
                {getCategoryLabel(item.category, dictLang)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Checklist for technician */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.checklistTitle}</Text>
        <Text style={{ ...styles.text, marginBottom: 6 }}>{t.checklistSubtitle}</Text>
        {t.checklistItems.map((item: string, i: number) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletPoint}>□</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* What we don't know without visit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.unknownWithoutVisitTitle}</Text>
        {t.unknownWithoutVisitItems.map((item: string, i: number) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
        <Text style={{ ...styles.text, color: '#856404', fontSize: 8, marginTop: 8 }}>{t.unknownWithoutVisitDisclaimer}</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text>{getLegalDisclaimer(language)}</Text>
      </View>
    </Page>

    {/* Page 2: Scenarios */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.brandHeader}>
          {data.logoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
            <Image src={data.logoDataUri} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.scenarios}</Text>
            <Text style={styles.subtitle}>{t.scenarioRouteSubtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.scenarios}</Text>
        {scenarios.map((s, i) => (
          <View key={i} style={styles.scenarioBox} wrap={false}>
            <Text style={styles.scenarioTitle}>{s.title}</Text>
            <Text style={styles.text}>{t.objective}: {s.objective}</Text>
            {s.description && <Text style={styles.text}>{s.description}</Text>}
            <Text style={styles.text}>{t.expectedImpact}: {s.expectedLetterImpact}</Text>
            <Text style={styles.text}>{t.investment}: {s.estimatedCostRange} | {t.savings}: {s.estimatedSavingsRange}</Text>
            {s.costEstimate && (
              <View style={{ marginTop: 6 }}>
                <Text style={{ ...styles.text, fontWeight: 'bold', color: '#008F5A' }}>
                  {t.indicativeRange}: {formatEuroRange(s.costEstimate.minTotal, s.costEstimate.maxTotal, s.costEstimate.midTotal, { currency, language })} · {t.confidence}: {translateConfidence(s.costEstimate.confidence, dictLang)}
                </Text>
                <Text style={{ ...styles.text, fontSize: 8 }}>{costSourceSummary(language, s.costEstimate.sourceSummary)}</Text>
              </View>
            )}
            {s.rationale && <Text style={styles.text}>{s.rationale}</Text>}
            <View style={{ marginTop: 5 }}>
              {s.measures.map((m, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{m}</Text>
                </View>
              ))}
            </View>
            {(s.disclaimers || []).map((disclaimer, j) => (
              <Text key={j} style={{ ...styles.text, color: '#856404', fontSize: 8 }}>{disclaimer}</Text>
            ))}
          </View>
        ))}
      </View>
    </Page>

    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.brandHeader}>
          {data.logoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
            <Image src={data.logoDataUri} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.economicTitle}</Text>
            <Text style={styles.subtitle}>{t.economicSubtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.economicSummary}</Text>
        {scenarios.filter((scenario) => scenario.costEstimate).map((scenario) => (
          <View key={scenario.id} style={styles.scenarioBox} wrap={false}>
            <Text style={styles.scenarioTitle}>{scenario.title}</Text>
            <Text style={styles.text}>{t.jump}: {scenario.expectedLetterImpact}</Text>
            <Text style={styles.text}>{t.interventionLevel}: {scenario.costEstimate?.interventionLevel || scenario.complexity || (language === 'en' ? 'Indicative' : language === 'de' ? 'Orientierend' : language === 'ca' ? 'Orientatiu' : language === 'fr' ? 'Indicatif' : language === 'it' ? 'Indicativo' : language === 'pt' ? 'Indicativo' : 'Orientativo')}</Text>
            <Text style={{ ...styles.text, fontWeight: 'bold' }}>
              {t.conservativeRecommendedPremium}: {formatEuroRange(scenario.costEstimate!.minTotal, scenario.costEstimate!.maxTotal, scenario.costEstimate!.midTotal, { currency, language })}
            </Text>
            <Text style={styles.text}>{t.confidence}: {translateConfidence(scenario.costEstimate!.confidence, dictLang)}</Text>
            <Text style={{ ...styles.text, fontSize: 8 }}>{costSourceSummary(language, scenario.costEstimate!.sourceSummary)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.economicDetail}</Text>
        {scenarios.filter((scenario) => scenario.costEstimate).slice(0, 2).map((scenario) => (
          <View key={`${scenario.id}-cost-lines`} style={{ marginBottom: 8 }} wrap={false}>
            <Text style={{ ...styles.text, fontWeight: 'bold' }}>{scenario.title}</Text>
            {scenario.costEstimate!.lines.slice(0, 5).map((line) => (
              <Text key={`${scenario.id}-${line.priceItemCode}`} style={{ ...styles.text, fontSize: 8 }}>
                {language === 'es' ? line.title : line.priceItemCode} · {formatCostQuantity(line.quantity, line.unit, { language, measurementSystem })} · {formatUnitPrice(line.minUnitPrice, line.unit, { currency, language, measurementSystem })} - {formatUnitPrice(line.maxUnitPrice, line.unit, { currency, language, measurementSystem })} · {formatEuroRange(line.minSubtotal, line.maxSubtotal, line.midSubtotal, { currency, language })} · {line.confidence}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.disclaimer}>
        <Text>{localizedCostDisclaimer(language, 'traceability')}</Text>
        <Text>{localizedCostDisclaimer(language, 'future')}</Text>
        <Text>{localizedCostDisclaimer(language, 'legal')}</Text>
      </View>
    </Page>

    {scenarios.some((scenario) => scenario.costEstimate?.heatPumpTechnicalNote) && (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandHeader}>
            {data.logoDataUri && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
              <Image src={data.logoDataUri} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>{t.heatPumpTitle}</Text>
              <Text style={styles.subtitle}>{language === 'en' ? 'Technical dependencies and cautions' : language === 'de' ? 'Technische Abhängigkeiten und Hinweise' : language === 'ca' ? 'Dependències tècniques i cauteles' : language === 'fr' ? 'Dépendances techniques et précautions' : language === 'it' ? 'Dipendenze tecniche e cautele' : language === 'pt' ? 'Dependências técnicas e cautelas' : 'Dependencias técnicas y cautelas'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.technicalNote}</Text>
          <Text style={styles.text}>{scenarios.find((scenario) => scenario.costEstimate?.heatPumpTechnicalNote)?.costEstimate?.heatPumpTechnicalNote}</Text>
          <Text style={styles.text}>{language === 'en' ? 'Before quoting, insulation, equipment space, emitters, electrical installation, acoustics, local rules and real consumption should be reviewed.' : language === 'de' ? 'Vor Angebotsabgabe sollten Dämmung, Platz für Geräte, Heizflächen, Elektroinstallation, Akustik, lokale Vorschriften und reale Verbräuche geprüft werden.' : language === 'ca' ? 'Abans de pressupostar cal revisar aïllament, espai per a equips, emissors, instal·lació elèctrica, acústica, normativa local i consums reals.' : language === 'fr' ? 'Avant de devis, il faut vérifier l\'isolation, l\'espace pour les équipements, les émetteurs, l\'installation électrique, l\'acoustique, la réglementation locale et les consommations réelles.' : language === 'it' ? 'Prima di preventivare, occorre verificare isolamento, spazio per le apparecchiature, emissori, impianto elettrico, acustica, normativa locale e consumi reali.' : language === 'pt' ? 'Antes de orçamentar, deve rever-se o isolamento, espaço para equipamentos, emissores, instalação elétrica, acústica, regulamentação local e consumos reais.' : 'Antes de presupuestar debe revisarse aislamiento, espacio para equipos, emisores, instalación eléctrica, acústica, normativa local y consumos reales.'}</Text>
        </View>
        <View style={styles.disclaimer}>
          <Text>{COST_LEGAL_DISCLAIMER}</Text>
        </View>
      </Page>
    )}

    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.brandHeader}>
          {data.logoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
            <Image src={data.logoDataUri} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.regulation}</Text>
            <Text style={styles.subtitle}>{t.regulationSubtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.regulation}</Text>
        {data.regulatoryContext.map((r, i) => {
          const localized = localizedRegulatoryCopy(r.id, language);
          return (
            <View key={i} style={{ marginBottom: 10 }} wrap={false}>
              <Text style={{ ...styles.text, fontWeight: 'bold' }}>{localizedRegulatoryYear(r.year, language)} - {localized?.title || r.title} ({localized?.dateLabel || r.dateLabel})</Text>
              <Text style={styles.text}>{localized?.description || r.description}</Text>
              <Text style={styles.text}>{language === 'en' ? 'User impact' : language === 'de' ? 'Auswirkung für Nutzer' : language === 'ca' ? 'Impacte per a l\'usuari' : language === 'fr' ? 'Impact pour l\'utilisateur' : language === 'it' ? 'Impatto per l\'utente' : language === 'pt' ? 'Impacto para o utilizador' : 'Impacto para el usuario'}: {localized?.impact || r.impactOnUser}</Text>
              <Text style={{ ...styles.text, fontSize: 8 }}>{r.legalReference}{(localized?.disclaimer || r.disclaimer) ? ` · ${localized?.disclaimer || r.disclaimer}` : ''}</Text>
            </View>
          );
        })}
      </View>
    </Page>

    <Page size="A4" style={styles.page}>
      <View style={styles.header} fixed>
        <View style={styles.brandHeader}>
          {data.logoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
            <Image src={data.logoDataUri} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.subsidies}</Text>
            <Text style={styles.subtitle}>{t.subsidiesSubtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.subsidies}</Text>
        {subsidies.map((item) => (
          <View key={item.id} style={styles.scenarioBox} wrap={false}>
            <Text style={styles.scenarioTitle}>{item.title}</Text>
            <Text style={styles.text}>{t.scope}: {item.scope} | {t.appliesTo}: {item.appliesTo.join(', ')}</Text>
            <Text style={styles.text}>{item.description}</Text>
            <Text style={{ ...styles.text, color: '#856404', fontSize: 8 }}>{item.eligibilityDisclaimer}</Text>
          </View>
        ))}
        <Text style={{ ...styles.text, color: '#856404', fontSize: 8 }}>
          {language === 'en' ? 'EnergyScan does not verify calls in real time, does not guarantee eligibility or amounts, and recommends checking official sources.' : language === 'de' ? 'EnergyScan prüft Ausschreibungen nicht in Echtzeit, garantiert weder Förderfähigkeit noch Beträge und empfiehlt die Prüfung offizieller Quellen.' : language === 'ca' ? 'EnergyScan no verifica convocatòries en temps real, no garanteix elegibilitat ni imports i recomana consultar fonts oficials.' : language === 'fr' ? 'EnergyScan ne vérifie pas les appels en temps réel, ne garantit pas l\'éligibilité ou les montants, et recommande de vérifier les sources officielles.' : language === 'it' ? 'EnergyScan non verifica i bandi in tempo reale, non garantisce l\'ammissibilità o gli importi e raccomanda di verificare le fonti ufficiali.' : language === 'pt' ? 'O EnergyScan não verifica concursos em tempo real, não garante elegibilidade ou montantes e recomenda consultar fontes oficiais.' : 'EnergyScan no verifica convocatorias en tiempo real, no garantiza elegibilidad ni importes y recomienda consultar fuentes oficiales.'}
        </Text>
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{t.providerCategoriesTitle}</Text>
        <Text style={styles.text}>{language === 'en' ? 'Indicative categories suggested to study the improvements' : language === 'de' ? 'Orientierende Kategorien zur Prüfung der Maßnahmen' : language === 'ca' ? 'Categories orientatives suggerides per estudiar les millores' : language === 'fr' ? 'Catégories indicatives suggérées pour étudier les améliorations' : language === 'it' ? 'Categorie indicative suggerite per studiare i miglioramenti' : language === 'pt' ? 'Categorias indicativas sugeridas para estudar as melhorias' : 'Categorías orientativas sugeridas para estudiar las mejoras'}: {localizedProviderCategories(language, data.providerCategories).join(', ')}.</Text>
        <Text style={styles.text}>{getLegalDisclaimer(language)}</Text>
      </View>
    </Page>

    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brandHeader}>
          {data.logoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
            <Image src={data.logoDataUri} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.annexTitle}</Text>
            <Text style={styles.subtitle}>{t.userInfoAnnex}</Text>
            <Text style={{ ...styles.text, marginTop: 5 }}>{t.id}: {reportRef} | {t.date}: {data.date}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.userInfoAnnex}</Text>
        {buildUserDataRows(data, language).map(([label, value]) => (
          <View key={label} style={styles.annexRow}>
            <Text style={styles.colLeft}>{label}</Text>
            <Text style={styles.colRight}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.documentsAnnex}</Text>
        <Text style={styles.text}>{attachments.length > 0 ? formatDocumentsCount(attachments.length, language) : t.noDocuments}</Text>
        <Text style={styles.text}>{data.isDemo ? t.documentsAnnexDemoNote : t.documentsAnnexNote}</Text>
      </View>

      <View style={styles.disclaimer}>
        <Text>{getLegalDisclaimer(language)}</Text>
      </View>
    </Page>

    {imagePages.map((pageAttachments, index) => (
      <Page key={`image-page-${index}`} size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandHeader}>
            {data.logoDataUri && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
              <Image src={data.logoDataUri} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>{t.annexTitle} - {t.documentsAnnex}</Text>
              <Text style={styles.subtitle}>{language === 'en' ? 'Submitted images' : language === 'de' ? 'Eingereichte Bilder' : language === 'ca' ? 'Imatges aportades' : language === 'fr' ? 'Images soumises' : language === 'it' ? 'Immagini inviate' : language === 'pt' ? 'Imagens fornecidas' : 'Imágenes aportadas'} {index + 1} / {imagePages.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.imageAnnexGrid}>
          {pageAttachments.map((attachment) => (
            <View key={attachment.id} wrap={false}>
              <View
                style={pageAttachments.length === 1 ? [styles.imageAnnexCard, styles.imageAnnexCardSingle] : styles.imageAnnexCard}
              >
                <Text style={styles.imageCaption}>{attachment.caption || attachment.name}</Text>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API. */}
                <Image src={attachment.previewDataUri!} style={styles.annexImage} />
                <Text style={styles.imageMeta}>{attachment.category === 'EXTERIOR' ? t.exterior : t.interior} · {attachment.name}</Text>
              </View>
              {attachment.visionAnalysis?.reportSummary && (
                <View style={{ backgroundColor: '#F0F4F0', borderRadius: 4, padding: 6, marginTop: -6, marginBottom: 4 }}>
                  <Text style={{ fontSize: 7.5, color: '#2D4A2D', lineHeight: 1.4 }}>
                    {language === 'en' ? 'Visual analysis (indicative): ' : language === 'de' ? 'Visuelle Analyse (orientierend): ' : language === 'ca' ? 'Anàlisi visual (orientatiu): ' : language === 'fr' ? 'Analyse visuelle (indicative) : ' : language === 'it' ? 'Analisi visiva (indicativa): ' : language === 'pt' ? 'Análise visual (indicativa): ' : 'Análisis visual (orientativo): '}
                    {attachment.visionAnalysis.reportSummary}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text>{data.isDemo ? t.imageAnnexDemoDisclaimer : t.imageAnnexDisclaimer}</Text>
        </View>
      </Page>
    ))}

    {/* Hermes Vision Curator — curated visual analysis section (premium only) */}
    {data.hermesVision && data.hermesVision.groupedFindings.length > 0 && (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandHeader}>
            {data.logoDataUri && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
              <Image src={data.logoDataUri} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {language === 'en' ? 'Visual Analysis of Submitted Images' : language === 'de' ? 'Visuelle Analyse der eingereichten Bilder' : language === 'ca' ? 'Anàlisi visual d\'imatges aportades' : language === 'fr' ? 'Analyse visuelle des images soumises' : language === 'it' ? 'Analisi visiva delle immagini inviate' : language === 'pt' ? 'Análise visual das imagens fornecidas' : 'Análisis visual de imágenes aportadas'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>{data.hermesVision.summaryForPdf}</Text>
        </View>

        {data.hermesVision.groupedFindings.map((group) => (
          <View key={group.category} style={styles.section} wrap={false}>
            <Text style={{ ...styles.sectionTitle, fontSize: 11 }}>{group.title}</Text>
            {group.findings.map((finding, i) => (
              <Text key={i} style={{ ...styles.text, marginLeft: 10, marginTop: 3 }}>{'• '}{finding}</Text>
            ))}
          </View>
        ))}

        {data.hermesVision.recommendedChecks.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={{ ...styles.sectionTitle, fontSize: 11 }}>
              {language === 'en' ? 'Recommended checks' : language === 'de' ? 'Empfohlene Prüfungen' : language === 'ca' ? 'Verificacions recomanades' : language === 'fr' ? 'Vérifications recommandées' : language === 'it' ? 'Verifiche consigliate' : language === 'pt' ? 'Verificações recomendadas' : 'Verificaciones recomendadas'}
            </Text>
            {data.hermesVision.recommendedChecks.map((check, i) => (
              <Text key={i} style={{ ...styles.text, marginLeft: 10, marginTop: 3 }}>{'• '}{check}</Text>
            ))}
          </View>
        )}

        {data.hermesVision.limitations.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={{ ...styles.sectionTitle, fontSize: 11 }}>
              {language === 'en' ? 'Limitations' : language === 'de' ? 'Einschränkungen' : language === 'ca' ? 'Limitacions' : language === 'fr' ? 'Limitations' : language === 'it' ? 'Limitazioni' : language === 'pt' ? 'Limitações' : 'Limitaciones'}
            </Text>
            {data.hermesVision.limitations.map((lim, i) => (
              <Text key={i} style={{ ...styles.text, marginLeft: 10, marginTop: 3 }}>{'• '}{lim}</Text>
            ))}
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text>{data.hermesVision.safePdfDisclaimer}</Text>
        </View>
      </Page>
    )}

    {otherAttachments.map((attachment, index) => (
      <Page key={attachment.id} size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandHeader}>
            {data.logoDataUri && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
              <Image src={data.logoDataUri} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>{t.documentsAnnex}</Text>
              <Text style={styles.subtitle}>{t.documentPage} {index + 1} / {otherAttachments.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{attachment.caption || attachment.name}</Text>
          <View style={styles.annexMetaBox} wrap={false}>
            <View style={styles.row}><Text style={styles.colLeft}>{t.fileName}</Text><Text style={styles.colRight}>{attachment.name}</Text></View>
            <View style={styles.row}><Text style={styles.colLeft}>{t.fileType}</Text><Text style={styles.colRight}>{attachment.type || 'application/octet-stream'}</Text></View>
            <View style={styles.row}><Text style={styles.colLeft}>{t.fileSize}</Text><Text style={styles.colRight}>{formatFileSize(attachment.size)}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          {attachment.previewText ? (
            <View style={styles.documentFrame}>
              <Text style={styles.preText}>{attachment.previewText}</Text>
            </View>
          ) : (
            <View style={styles.documentFrame}>
              <Text style={styles.text}>{attachment.annexNote || t.previewUnavailable}</Text>
            </View>
          )}
        </View>
      </Page>
    ))}

    {ceeAttachments.length > 0 && (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandHeader}>
            {data.logoDataUri && (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image does not expose an alt prop in its typed API.
              <Image src={data.logoDataUri} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>{t.ceeSubmitted}</Text>
              <Text style={styles.subtitle}>{t.userDocument}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.documentSummary}</Text>
          {ceeAttachments.map((attachment) => (
            <View key={attachment.id} style={styles.annexMetaBox} wrap={false}>
              <View style={styles.row}><Text style={styles.colLeft}>{t.fileName}</Text><Text style={styles.colRight}>{attachment.name}</Text></View>
              <View style={styles.row}><Text style={styles.colLeft}>{t.fileType}</Text><Text style={styles.colRight}>{attachment.type}</Text></View>
              <View style={styles.row}><Text style={styles.colLeft}>{t.fileSize}</Text><Text style={styles.colRight}>{formatFileSize(attachment.size)}</Text></View>
              <View style={styles.row}><Text style={styles.colLeft}>{t.collectedLetter}</Text><Text style={styles.colRight}>{attachment.ceeLetter || data.scoreResult.estimatedLetter}</Text></View>
              <Text style={{ ...styles.text, marginTop: 8 }}>{attachment.annexNote || t.ceeAnnexNoteShort}</Text>
              <Text style={{ ...styles.text, color: '#008F5A', fontWeight: 'bold', marginTop: 6 }}>
                {t.ceeAnnexNote} {language === 'en' ? 'The EPC annex remains in Spanish because it represents an official Spanish document supplied by the user.' : language === 'de' ? 'Der Energieausweis-Anhang bleibt auf Spanisch, da er ein offizielles spanisches Nutzer-Dokument darstellt.' : language === 'ca' ? 'El CEE es manté en castellà perquè representa un document oficial espanyol aportat per l\'usuari.' : language === 'fr' ? 'L\'annexe DPE reste en espagnol car elle représente un document officiel espagnol fourni par l\'utilisateur.' : language === 'it' ? 'L\'allegato APE rimane in spagnolo perché rappresenta un documento ufficiale spagnolo fornito dall\'utente.' : language === 'pt' ? 'O anexo SCE permanece em espanhol porque representa um documento oficial espanhol fornecido pelo utilizador.' : 'El CEE se mantiene en español porque representa un documento oficial español aportado por el usuario.'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text>{t.ceeDisclaimer}</Text>
        </View>
      </Page>
    )}
  </Document>
  );
};
