import React from 'react';
import { Document, Image, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { getLegalDisclaimer, translateConfidence, translateScoreText } from '../i18n';
import { formatArea } from '../formatters';
import type { EnergyLetter, PropertyDataV2, ScoreResultV2 } from '../domain/energy-assessment';

export interface BasicReportData {
  assessmentRef: string;
  date: string;
  language: 'es' | 'en' | 'de';
  propertyData: Pick<PropertyDataV2, 'year' | 'area' | 'zipcode' | 'propertyType'>;
  scoreResult: Pick<ScoreResultV2, 'estimatedLetter' | 'confidence' | 'climateZone' | 'penalties' | 'strengths'>;
  address?: string;
  logoDataUri?: string;
}

const LETTER_COLORS: Record<EnergyLetter, string> = {
  A: '#00C853',
  B: '#64DD17',
  C: '#AEEA00',
  D: '#FFD600',
  E: '#FF8F00',
  F: '#E64A19',
  G: '#B71C1C',
};

const s = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#F6F2EA' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottom: '2 solid #008F5A', paddingBottom: 10 },
  logo: { width: 40, height: 40, borderRadius: 5, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#171512' },
  headerSub: { fontSize: 10, color: '#645D53', marginTop: 3 },
  badge: { marginLeft: 'auto', backgroundColor: '#E8F5E9', border: '1 solid #008F5A', borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { fontSize: 8, color: '#008F5A', fontWeight: 'bold' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 13, color: '#008F5A', fontWeight: 'bold', marginBottom: 8, borderBottom: '1 solid #D8CEC0', paddingBottom: 4 },
  text: { fontSize: 10, color: '#2B2721', lineHeight: 1.5, marginBottom: 4 },
  muted: { fontSize: 9, color: '#645D53', lineHeight: 1.4 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  letterBox: { alignItems: 'center', justifyContent: 'center', width: 110, height: 110, borderRadius: 8, padding: 10 },
  letterChar: { fontSize: 56, fontWeight: 'bold', color: '#FFFFFF' },
  letterLabel: { fontSize: 8, color: '#FFFFFF', marginTop: 2 },
  metaBox: { flex: 1, backgroundColor: '#EFE8DD', borderRadius: 6, padding: 12, gap: 6 },
  metaRow: { flexDirection: 'row', marginBottom: 4 },
  metaLabel: { width: '45%', fontSize: 9, color: '#645D53' },
  metaValue: { flex: 1, fontSize: 9, fontWeight: 'bold', color: '#171512' },
  bulletRow: { flexDirection: 'row', marginBottom: 4 },
  bullet: { width: 12, fontSize: 9, color: '#645D53' },
  bulletText: { flex: 1, fontSize: 9, color: '#2B2721', lineHeight: 1.4 },
  penaltyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E64A19', marginTop: 2, marginRight: 6 },
  strengthDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#008F5A', marginTop: 2, marginRight: 6 },
  upgradeBox: { backgroundColor: '#171512', borderRadius: 8, padding: 18, marginTop: 8 },
  upgradeTitle: { fontSize: 14, fontWeight: 'bold', color: '#00DC82', marginBottom: 6 },
  upgradeText: { fontSize: 9, color: '#B8B8B8', lineHeight: 1.5, marginBottom: 10 },
  upgradeFeatureRow: { flexDirection: 'row', marginBottom: 4 },
  upgradeFeatureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00DC82', marginTop: 3, marginRight: 6 },
  upgradeFeatureText: { flex: 1, fontSize: 9, color: '#E0E0E0' },
  upgradePrice: { fontSize: 20, fontWeight: 'bold', color: '#00DC82', marginTop: 8 },
  upgradePriceSub: { fontSize: 8, color: '#7A7A7A', marginTop: 2 },
  disclaimer: { marginTop: 16, padding: 10, backgroundColor: '#F4E7C2', borderRadius: 4 },
  disclaimerText: { fontSize: 7, color: '#6F4A00', lineHeight: 1.4, fontStyle: 'italic' },
  footerRef: { marginTop: 10, fontSize: 7, color: '#A09880', textAlign: 'center' },
});

const labels = {
  es: {
    title: 'Prediagnóstico Energético',
    subtitle: 'Informe gratuito orientativo — Anclora EnergyScan',
    free: 'GRATUITO',
    ratingSection: 'Calificación estimada',
    letter: 'Letra estimada',
    confidence: 'Confianza del análisis',
    zone: 'Zona climática',
    dataSection: 'Datos de la propiedad',
    type: 'Tipo',
    year: 'Año de construcción',
    area: 'Superficie',
    zip: 'Código postal',
    address: 'Dirección',
    penaltiesSection: 'Principales debilidades detectadas',
    strengthsSection: 'Principales fortalezas',
    noPenalties: 'No se detectaron penalizaciones significativas.',
    noStrengths: 'No se detectaron fortalezas significativas.',
    upgradeTitle: 'Desbloquea el informe completo',
    upgradeText: 'Este prediagnóstico es orientativo. El informe Premium incluye análisis detallado, escenarios de mejora con costes, subsidios aplicables y un PDF profesional.',
    upgradeFeatures: [
      'Escenarios de mejora detallados con inversión estimada',
      'Coste orientativo y período de retorno',
      'Subsidios y ayudas potencialmente aplicables',
      'Contexto normativo actualizado (EPBD, PNIEC)',
      'PDF profesional descargable',
    ],
    upgradePrice: '9,90 €',
    upgradePriceSub: 'Pago único · Sin suscripción',
    propTypes: { flat: 'Piso/Apartamento', house: 'Vivienda unifamiliar', terraced: 'Adosado', penthouse: 'Ático', ground_floor: 'Bajo', unknown: 'No especificado' },
  },
  en: {
    title: 'Energy Pre-assessment',
    subtitle: 'Free indicative report — Anclora EnergyScan',
    free: 'FREE',
    ratingSection: 'Estimated rating',
    letter: 'Estimated letter',
    confidence: 'Analysis confidence',
    zone: 'Climate zone',
    dataSection: 'Property data',
    type: 'Type',
    year: 'Year built',
    area: 'Floor area',
    zip: 'Postal code',
    address: 'Address',
    penaltiesSection: 'Main weaknesses detected',
    strengthsSection: 'Main strengths',
    noPenalties: 'No significant penalties detected.',
    noStrengths: 'No significant strengths detected.',
    upgradeTitle: 'Unlock the full report',
    upgradeText: 'This pre-assessment is indicative. The Premium report includes detailed analysis, improvement scenarios with costs, applicable grants and a professional PDF.',
    upgradeFeatures: [
      'Detailed improvement scenarios with estimated investment',
      'Indicative cost and payback period',
      'Potentially applicable grants and subsidies',
      'Updated regulatory context (EPBD, PNIEC)',
      'Downloadable professional PDF',
    ],
    upgradePrice: '€9.90',
    upgradePriceSub: 'One-time payment · No subscription',
    propTypes: { flat: 'Flat/Apartment', house: 'Detached house', terraced: 'Terraced', penthouse: 'Penthouse', ground_floor: 'Ground floor', unknown: 'Not specified' },
  },
  de: {
    title: 'Energetische Voreinschätzung',
    subtitle: 'Kostenloser Orientierungsbericht — Anclora EnergyScan',
    free: 'KOSTENLOS',
    ratingSection: 'Geschätzte Energieklasse',
    letter: 'Geschätzte Klasse',
    confidence: 'Analysegenauigkeit',
    zone: 'Klimazone',
    dataSection: 'Gebäudedaten',
    type: 'Typ',
    year: 'Baujahr',
    area: 'Fläche',
    zip: 'Postleitzahl',
    address: 'Adresse',
    penaltiesSection: 'Hauptsächliche Schwächen',
    strengthsSection: 'Hauptsächliche Stärken',
    noPenalties: 'Keine signifikanten Schwächen erkannt.',
    noStrengths: 'Keine signifikanten Stärken erkannt.',
    upgradeTitle: 'Vollständigen Bericht freischalten',
    upgradeText: 'Diese Voreinschätzung ist orientierend. Der Premium-Bericht enthält eine detaillierte Analyse, Verbesserungsszenarien mit Kosten, anwendbare Förderungen und ein professionelles PDF.',
    upgradeFeatures: [
      'Detaillierte Verbesserungsszenarien mit geschätzter Investition',
      'Orientierungskosten und Amortisierungszeitraum',
      'Potenziell anwendbare Förderungen',
      'Aktualisierter regulatorischer Kontext (EPBD, PNIEC)',
      'Professionelles PDF zum Herunterladen',
    ],
    upgradePrice: '9,90 €',
    upgradePriceSub: 'Einmalige Zahlung · Kein Abo',
    propTypes: { flat: 'Wohnung', house: 'Einfamilienhaus', terraced: 'Reihenhaus', penthouse: 'Penthouse', ground_floor: 'Erdgeschoss', unknown: 'Nicht angegeben' },
  },
} as const;

function propertyTypeLabel(type: string, t: { propTypes: Record<string, string> }): string {
  return t.propTypes[type] ?? type;
}

type Labels = typeof labels['es'];

export function BasicReport({ data }: { data: BasicReportData }) {
  const t: Labels = (labels[data.language] ?? labels.es) as Labels;
  const letter = data.scoreResult.estimatedLetter as EnergyLetter;
  const letterColor = LETTER_COLORS[letter] ?? '#645D53';
  const disclaimer = getLegalDisclaimer(data.language);

  return (
    <Document title={`${t.title} — ${data.assessmentRef}`} author="Anclora EnergyScan">
      {/* PAGE 1: Rating + Data + Penalties/Strengths */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header} fixed>
          <View>
            {data.logoDataUri && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={data.logoDataUri} style={s.logo} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t.title}</Text>
            <Text style={s.headerSub}>{t.subtitle}</Text>
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>{t.free}</Text>
          </View>
        </View>

        {/* Letter + property meta */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.ratingSection}</Text>
          <View style={s.row}>
            <View style={[s.letterBox, { backgroundColor: letterColor }]}>
              <Text style={s.letterChar}>{letter}</Text>
              <Text style={s.letterLabel}>{t.letter}</Text>
            </View>
            <View style={s.metaBox}>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>{t.confidence}</Text>
                <Text style={s.metaValue}>{translateConfidence(data.scoreResult.confidence, data.language)}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>{t.zone}</Text>
                <Text style={s.metaValue}>{data.scoreResult.climateZone}</Text>
              </View>
              {data.address && (
                <View style={s.metaRow}>
                  <Text style={s.metaLabel}>{t.address}</Text>
                  <Text style={s.metaValue}>{data.address}</Text>
                </View>
              )}
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>{t.type}</Text>
                <Text style={s.metaValue}>{propertyTypeLabel(data.propertyData.propertyType, t)}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>{t.year}</Text>
                <Text style={s.metaValue}>{data.propertyData.year}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>{t.area}</Text>
                <Text style={s.metaValue}>{formatArea(data.propertyData.area, 'metric', data.language)}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>{t.zip}</Text>
                <Text style={s.metaValue}>{data.propertyData.zipcode || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Penalties */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.penaltiesSection}</Text>
          {data.scoreResult.penalties.length === 0 ? (
            <Text style={s.muted}>{t.noPenalties}</Text>
          ) : (
            data.scoreResult.penalties.map((p, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start' }}>
                <View style={s.penaltyDot} />
                <Text style={{ ...s.text, flex: 1, marginBottom: 0 }}>{translateScoreText(p, data.language)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Strengths */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.strengthsSection}</Text>
          {data.scoreResult.strengths.length === 0 ? (
            <Text style={s.muted}>{t.noStrengths}</Text>
          ) : (
            data.scoreResult.strengths.map((str, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 5, alignItems: 'flex-start' }}>
                <View style={s.strengthDot} />
                <Text style={{ ...s.text, flex: 1, marginBottom: 0 }}>{translateScoreText(str, data.language)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Legal disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>{disclaimer}</Text>
        </View>
        <Text style={s.footerRef}>Ref: {data.assessmentRef} · {data.date} · anclora-energyscan.com</Text>
      </Page>

      {/* PAGE 2: Premium upgrade CTA */}
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{t.title}</Text>
            <Text style={s.headerSub}>{t.subtitle}</Text>
          </View>
        </View>

        <View style={s.upgradeBox}>
          <Text style={s.upgradeTitle}>{t.upgradeTitle}</Text>
          <Text style={s.upgradeText}>{t.upgradeText}</Text>

          {t.upgradeFeatures.map((f, i) => (
            <View key={i} style={s.upgradeFeatureRow}>
              <View style={s.upgradeFeatureDot} />
              <Text style={s.upgradeFeatureText}>{f}</Text>
            </View>
          ))}

          <Text style={s.upgradePrice}>{t.upgradePrice}</Text>
          <Text style={s.upgradePriceSub}>{t.upgradePriceSub}</Text>
        </View>

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>{disclaimer}</Text>
        </View>
        <Text style={s.footerRef}>Ref: {data.assessmentRef} · {data.date} · anclora-energyscan.com</Text>
      </Page>
    </Document>
  );
}
