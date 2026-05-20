import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import React from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const root = process.cwd();
const outputDir = path.join(root, 'public', 'demo-assets');
mkdirSync(outputDir, { recursive: true });

// ─── Styles: Budget Review ────────────────────────────────────────────────────

const rs = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#F6F2EA' },
  demoBanner: { padding: 8, marginBottom: 12, backgroundColor: '#fff3cd' },
  bannerText: { fontSize: 8.5, fontWeight: 'bold', color: '#7a4b00' },
  header: { marginBottom: 14, borderBottom: '2 solid #008F5A', paddingBottom: 8 },
  brand: { fontSize: 8.5, color: '#008F5A', fontWeight: 'bold', marginBottom: 2 },
  title: { fontSize: 17, color: '#171512', fontWeight: 'bold' },
  subtitle: { fontSize: 9.5, color: '#645D53', marginTop: 3 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, gap: 14 },
  metaItem: { fontSize: 7.5, color: '#645D53' },
  metaValue: { fontWeight: 'bold', color: '#2B2721', fontSize: 8.5 },
  section: { marginBottom: 11 },
  sectionTitle: { fontSize: 11, color: '#008F5A', fontWeight: 'bold', marginBottom: 5, borderBottom: '1 solid #D8CEC0', paddingBottom: 3 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#EDE8E0', padding: 4, marginBottom: 3 },
  tRow: { flexDirection: 'row', borderBottom: '0.5 solid #D8CEC0', paddingTop: 2, paddingBottom: 2 },
  col42: { width: '42%', fontSize: 8.5, color: '#2B2721' },
  col19: { width: '19%', fontSize: 8.5, color: '#2B2721', textAlign: 'right' },
  colH: { fontWeight: 'bold', color: '#645D53', fontSize: 8 },
  sGreen: { color: '#008F5A', fontWeight: 'bold' },
  sRed: { color: '#C0392B', fontWeight: 'bold' },
  sAmber: { color: '#B7791F', fontWeight: 'bold' },
  text: { fontSize: 8.5, color: '#2B2721', lineHeight: 1.45, marginBottom: 2 },
  bold: { fontWeight: 'bold' },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  bulletDot: { width: 12, fontSize: 8.5, color: '#645D53' },
  bulletText: { flex: 1, fontSize: 8.5, color: '#2B2721', lineHeight: 1.4 },
  refBox: { marginBottom: 6, padding: 6, backgroundColor: '#EDE8E0' },
  refTitle: { fontSize: 8.5, fontWeight: 'bold', color: '#2B2721', marginBottom: 2 },
  refContent: { fontSize: 8, color: '#4A4035', lineHeight: 1.4 },
  refSource: { fontSize: 7.5, color: '#008F5A', marginTop: 2 },
  disclaimer: { marginTop: 14, borderTop: '1 solid #D8CEC0', paddingTop: 8 },
  disclaimerText: { fontSize: 7.5, color: '#8B7D6B', lineHeight: 1.4 },
  smallNote: { fontSize: 8, color: '#645D53', lineHeight: 1.4, marginBottom: 3 },
});

// ─── Styles: Budget Document ──────────────────────────────────────────────────

const bs = StyleSheet.create({
  page: { padding: 44, fontFamily: 'Helvetica', color: '#1a1a1a', backgroundColor: '#ffffff' },
  demoBanner: { padding: 7, marginBottom: 10, backgroundColor: '#ffeeba' },
  bannerText: { fontSize: 8, fontWeight: 'bold', color: '#7a4b00' },
  companyBlock: { marginBottom: 12, borderBottom: '2 solid #1a5276', paddingBottom: 9 },
  companyName: { fontSize: 17, fontWeight: 'bold', color: '#1a5276' },
  companyTagline: { fontSize: 8.5, color: '#2980b9', marginTop: 1 },
  companyContact: { fontSize: 7.5, color: '#555555', marginTop: 4, lineHeight: 1.5 },
  docTitle: { fontSize: 15, fontWeight: 'bold', color: '#1a5276', textAlign: 'center', marginBottom: 3 },
  docRef: { fontSize: 8.5, textAlign: 'center', color: '#555', marginBottom: 10 },
  clientBlock: { marginBottom: 10, padding: 7, backgroundColor: '#f4f6f7' },
  clientTitle: { fontSize: 8.5, fontWeight: 'bold', color: '#1a5276', marginBottom: 4 },
  clientRow: { flexDirection: 'row', marginBottom: 2 },
  clientLabel: { width: '30%', fontSize: 8, color: '#666' },
  clientValue: { width: '70%', fontSize: 8, fontWeight: 'bold' },
  chapterTitle: { fontSize: 10, fontWeight: 'bold', color: '#1a5276', marginBottom: 5, marginTop: 8, padding: 4, backgroundColor: '#d6eaf8' },
  tableHeader: { flexDirection: 'row', borderBottom: '1.5 solid #1a5276', paddingBottom: 3, marginBottom: 2 },
  tableRow: { flexDirection: 'row', borderBottom: '0.5 solid #ddd', paddingBottom: 3, paddingTop: 3 },
  colDesc: { width: '52%', fontSize: 8 },
  colCant: { width: '8%', fontSize: 8, textAlign: 'center' },
  colUd: { width: '8%', fontSize: 8, textAlign: 'center' },
  colPUnit: { width: '16%', fontSize: 8, textAlign: 'right' },
  colTotal: { width: '16%', fontSize: 8, textAlign: 'right', fontWeight: 'bold' },
  colH: { fontWeight: 'bold', color: '#1a5276', fontSize: 7.5 },
  chapterTotal: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, paddingTop: 3, borderTop: '1 solid #1a5276' },
  chapterTotalLabel: { fontSize: 8.5, fontWeight: 'bold', color: '#1a5276', marginRight: 4 },
  chapterTotalValue: { fontSize: 8.5, fontWeight: 'bold', color: '#1a5276', width: '16%', textAlign: 'right' },
  summarySection: { marginTop: 12, borderTop: '2 solid #1a5276', paddingTop: 7 },
  summaryTitle: { fontSize: 10, fontWeight: 'bold', color: '#1a5276', marginBottom: 5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  summaryLabel: { width: '48%', fontSize: 8.5, textAlign: 'right', marginRight: 10 },
  summaryValue: { width: '22%', fontSize: 8.5, textAlign: 'right' },
  summaryTotalRow: { fontWeight: 'bold', borderTop: '1.5 solid #1a5276', paddingTop: 3, marginTop: 3, color: '#1a5276' },
  paymentSection: { marginTop: 10, padding: 7, backgroundColor: '#eaf4fc' },
  paymentTitle: { fontSize: 8.5, fontWeight: 'bold', color: '#1a5276', marginBottom: 4 },
  paymentRow: { flexDirection: 'row', marginBottom: 2.5 },
  paymentLabel: { width: '58%', fontSize: 8 },
  paymentValue: { width: '42%', fontSize: 8, textAlign: 'right', fontWeight: 'bold' },
  validityNote: { marginTop: 8, fontSize: 7.5, color: '#555', lineHeight: 1.4 },
  legalNote: { marginTop: 5, fontSize: 7, color: '#888', lineHeight: 1.3 },
  signatureBlock: { flexDirection: 'row', marginTop: 28, gap: 50 },
  signatureBox: { flex: 1, borderTop: '1 solid #aaa', paddingTop: 4 },
  signatureLabel: { fontSize: 7.5, color: '#666' },
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const fmt = (n) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const reviewItems = [
  { desc: 'Ventana corredera RPT doble bajo emisivo 6/12/6', pUnit: 648.75, total: 5190.00, status: 'IN_RANGE' },
  { desc: 'Balconera corredera RPT doble bajo emisivo 6/12/6', pUnit: 895.00, total: 1790.00, status: 'IN_RANGE' },
  { desc: 'Panel solar monocristalino 400 Wp clase A', pUnit: 310.00, total: 1860.00, status: 'REQUIRES_CLARIFICATION' },
  { desc: 'Inversor hibrido 5 kW monofasico + gestor carga', pUnit: 2140.00, total: 2140.00, status: 'REQUIRES_CLARIFICATION' },
  { desc: 'Instalacion electrica + tramitacion distribuidora', pUnit: 4400.00, total: 4400.00, status: 'HIGH_REVIEW' },
  { desc: 'Unidad exterior BdC 14 kW R-32, COP 4.1', pUnit: 3500.00, total: 3500.00, status: 'IN_RANGE' },
  { desc: 'Unidad interior cassette + plenum distribucion', pUnit: 1850.00, total: 1850.00, status: 'IN_RANGE' },
  { desc: 'Red conductos Climaver + boca regulable (6 est.)', pUnit: 720.00, total: 4320.00, status: 'HIGH_REVIEW' },
  { desc: 'Instalacion electrica dedicada cuadro-exterior', pUnit: 980.00, total: 980.00, status: 'IN_RANGE' },
];

const cap1 = [
  { desc: 'Ventana corredera RPT doble bajo emisivo 6/12/6, perfil Cor-Vision HD, inc. premarco', cant: 8, ud: 'ud', pUnit: 648.75, total: 5190.00 },
  { desc: 'Balconera corredera RPT doble bajo emisivo 6/12/6, perfil Cor-Vision HD, inc. premarco', cant: 2, ud: 'ud', pUnit: 895.00, total: 1790.00 },
];
const cap2 = [
  { desc: 'Panel solar monocristalino 400 Wp clase A, inc. estructura coplanar galvanizada', cant: 6, ud: 'ud', pUnit: 310.00, total: 1860.00 },
  { desc: 'Inversor hibrido 5 kW monofasico con gestor de carga integrado', cant: 1, ud: 'ud', pUnit: 2140.00, total: 2140.00 },
  { desc: 'Instalacion electrica, cableado DC/AC, conexion red y tramitacion distribuidora Endesa', cant: 1, ud: 'pa', pUnit: 4400.00, total: 4400.00 },
];
const cap3 = [
  { desc: 'Unidad exterior bomba de calor 14 kW R-32, COP 4.1, SCOP 4.6, nivel acustico 52 dBA', cant: 1, ud: 'ud', pUnit: 3500.00, total: 3500.00 },
  { desc: 'Unidad interior cassette horizontal 14 kW + plenum de distribucion', cant: 1, ud: 'ud', pUnit: 1850.00, total: 1850.00 },
  { desc: 'Red de conductos ISOVER Climaver A2 + boca regulable por estancia (6 estancias)', cant: 6, ud: 'est.', pUnit: 720.00, total: 4320.00 },
  { desc: 'Instalacion electrica dedicada desde cuadro hasta unidad exterior', cant: 1, ud: 'pa', pUnit: 980.00, total: 980.00 },
];

// ─── Helper render functions ──────────────────────────────────────────────────

function statusLabel(s) {
  if (s === 'IN_RANGE') return 'EN RANGO';
  if (s === 'HIGH_REVIEW') return 'REVISAR ALTO';
  return 'REVISAR';
}

function statusStyle(s) {
  if (s === 'IN_RANGE') return rs.sGreen;
  if (s === 'HIGH_REVIEW') return rs.sRed;
  return rs.sAmber;
}

function budgetTableHeader() {
  return React.createElement(View, { style: bs.tableHeader },
    React.createElement(Text, { style: [bs.colDesc, bs.colH] }, 'Descripcion'),
    React.createElement(Text, { style: [bs.colCant, bs.colH] }, 'Cant.'),
    React.createElement(Text, { style: [bs.colUd, bs.colH] }, 'Ud.'),
    React.createElement(Text, { style: [bs.colPUnit, bs.colH] }, 'P. Unit. EUR'),
    React.createElement(Text, { style: [bs.colTotal, bs.colH] }, 'Total EUR'),
  );
}

function budgetRows(items) {
  return items.map((item, i) =>
    React.createElement(View, { key: String(i), style: bs.tableRow },
      React.createElement(Text, { style: bs.colDesc }, item.desc),
      React.createElement(Text, { style: bs.colCant }, String(item.cant)),
      React.createElement(Text, { style: bs.colUd }, item.ud),
      React.createElement(Text, { style: bs.colPUnit }, fmt(item.pUnit)),
      React.createElement(Text, { style: bs.colTotal }, fmt(item.total)),
    )
  );
}

function chapterTotalEl(label, value) {
  return React.createElement(View, { style: bs.chapterTotal },
    React.createElement(Text, { style: bs.chapterTotalLabel }, label),
    React.createElement(Text, { style: bs.chapterTotalValue }, fmt(value) + ' EUR'),
  );
}

// ─── Budget Review PDF ────────────────────────────────────────────────────────

const ReviewDoc = React.createElement(Document, null,
  // Page 1: header + meta + semaphore + omissions
  React.createElement(Page, { size: 'A4', style: rs.page },
    React.createElement(View, { style: rs.demoBanner },
      React.createElement(Text, { style: rs.bannerText },
        'DOCUMENTO DEMO — Informe orientativo de ejemplo. Sin valor contractual ni legal.')
    ),
    React.createElement(View, { style: rs.header },
      React.createElement(Text, { style: rs.brand }, 'ANCLORA ENERGYSCAN  ·  Budget Review'),
      React.createElement(Text, { style: rs.title }, 'Analisis de presupuesto de reforma'),
      React.createElement(Text, { style: rs.subtitle }, 'Informe orientativo  ·  Ref. analisis: BR-DEMO-2026-001'),
    ),
    React.createElement(View, { style: rs.metaRow },
      React.createElement(View, null,
        React.createElement(Text, { style: rs.metaItem }, 'Fecha'),
        React.createElement(Text, { style: rs.metaValue }, '21 de mayo de 2026'),
      ),
      React.createElement(View, null,
        React.createElement(Text, { style: rs.metaItem }, 'Documento analizado'),
        React.createElement(Text, { style: rs.metaValue }, 'ECO-2026-0738-EcoReforma.pdf'),
      ),
      React.createElement(View, null,
        React.createElement(Text, { style: rs.metaItem }, 'Partidas'),
        React.createElement(Text, { style: rs.metaValue }, '9'),
      ),
      React.createElement(View, null,
        React.createElement(Text, { style: rs.metaItem }, 'Importe (s/IVA)'),
        React.createElement(Text, { style: rs.metaValue }, '26.030 EUR'),
      ),
      React.createElement(View, null,
        React.createElement(Text, { style: rs.metaItem }, 'Confianza extraccion'),
        React.createElement(Text, { style: rs.metaValue }, '94%'),
      ),
      React.createElement(View, null,
        React.createElement(Text, { style: rs.metaItem }, 'Categoria'),
        React.createElement(Text, { style: rs.metaValue }, 'Reforma media-alta'),
      ),
    ),
    // Semaphore table
    React.createElement(View, { style: rs.section },
      React.createElement(Text, { style: rs.sectionTitle }, 'Semaforo de partidas'),
      React.createElement(View, { style: rs.tableHeader },
        React.createElement(Text, { style: [rs.col42, rs.colH] }, 'Descripcion'),
        React.createElement(Text, { style: [rs.col19, rs.colH] }, 'P. Unit.'),
        React.createElement(Text, { style: [rs.col19, rs.colH] }, 'Total EUR'),
        React.createElement(Text, { style: [rs.col19, rs.colH] }, 'Estado'),
      ),
      ...reviewItems.map((item, i) =>
        React.createElement(View, { key: String(i), style: rs.tRow },
          React.createElement(Text, { style: [rs.col42, rs.text] }, item.desc),
          React.createElement(Text, { style: [rs.col19, rs.text] }, fmt(item.pUnit)),
          React.createElement(Text, { style: [rs.col19, rs.text] }, fmt(item.total)),
          React.createElement(Text, { style: [rs.col19, rs.text, statusStyle(item.status)] }, statusLabel(item.status)),
        )
      ),
    ),
    // Omissions
    React.createElement(View, { style: rs.section },
      React.createElement(Text, { style: rs.sectionTitle }, 'Posibles omisiones detectadas'),
      ...[
        'Desmontaje y retirada de ventanas existentes (coste estimado: 400-700 EUR, no incluido)',
        'Certificado de instalador electrico REBT para la instalacion fotovoltaica',
        'Tramite de legalizacion del frigorista habilitado (obligatorio en instalacion de climatizacion)',
        'Pintura y acabados tras apertura de rozas y colocacion de conductos en techos',
      ].map((o, i) =>
        React.createElement(View, { key: String(i), style: rs.bullet },
          React.createElement(Text, { style: rs.bulletDot }, '•'),
          React.createElement(Text, { style: rs.bulletText }, o),
        )
      ),
    ),
  ),
  // Page 2: observations + questions + price refs + annexes note + disclaimer
  React.createElement(Page, { size: 'A4', style: rs.page },
    React.createElement(View, { style: rs.header },
      React.createElement(Text, { style: rs.brand },
        'ANCLORA ENERGYSCAN  ·  Budget Review  ·  BR-DEMO-2026-001  ·  pag. 2'),
    ),
    // Observations
    React.createElement(View, { style: rs.section },
      React.createElement(Text, { style: rs.sectionTitle }, 'Observaciones por partida'),
      ...[
        ['Panel solar monocristalino 400 Wp',
          'Precio de 310 EUR/ud sin marca ni garantia de produccion. Rango mercado 2026: 280-380 EUR/ud clase A. Solicitar ficha tecnica y garantia minima 10 anos de producto y 25 anos de produccion.'],
        ['Inversor hibrido 5 kW monofasico',
          'Precio (2.140 EUR) en la banda alta para monofasico con gestor de carga. Rango habitual: 1.600-2.200 EUR. Verificar inclusion de garantia extendida y compatibilidad con bateria de litio futura.'],
        ['Instalacion fotovoltaica + tramitacion Endesa',
          'Importe global de 4.400 EUR sin desglose de partidas. La tramitacion con distribuidora en Baleares oscila entre 300-800 EUR. Solicitar desglose: cableado DC/AC, obra civil, tramitacion y puesta en marcha.'],
        ['Red de conductos (720 EUR/estancia)',
          'Precio elevado respecto al rango orientativo de 500-633 EUR/estancia para 6 estancias. Confirmar si el precio unitario incluye conducto, aislamiento termico y acustico, boca regulable e instalacion.'],
      ].map(([title, text], i) =>
        React.createElement(View, { key: String(i), style: { marginBottom: 6 } },
          React.createElement(Text, { style: [rs.text, rs.bold] }, title + ':'),
          React.createElement(Text, { style: rs.text }, text),
        )
      ),
    ),
    // Questions
    React.createElement(View, { style: rs.section },
      React.createElement(Text, { style: rs.sectionTitle }, 'Preguntas sugeridas al instalador'),
      ...[
        'Los paneles incluyen garantia de producto (min. 10 anos) y de produccion (min. 25 anos)? Que marca o serie?',
        'El inversor hibrido es compatible con bateria de litio si decido anadirla posteriormente?',
        'El precio de instalacion fotovoltaica incluye la gestion del certificado REBT y la tramitacion completa con Endesa hasta la autorizacion de vertido a red?',
        'El precio unitario de la red de conductos (720 EUR/estancia) incluye aislamiento termico y acustico de conductos y rejillas de impulsion regulables?',
        'Se incluye el desmontaje y retirada de las ventanas antiguas, o tiene un coste adicional?',
        'Cual es el plazo y la garantia de mano de obra para cada capitulo?',
      ].map((q, i) =>
        React.createElement(View, { key: String(i), style: rs.bullet },
          React.createElement(Text, { style: rs.bulletDot }, `${i + 1}.`),
          React.createElement(Text, { style: rs.bulletText }, q),
        )
      ),
    ),
    // Price references
    React.createElement(View, { style: rs.section },
      React.createElement(Text, { style: rs.sectionTitle }, 'Contexto de precios de referencia'),
      ...[
        {
          title: 'Ventanas RPT doble bajo emisivo — Baleares 2025-2026',
          content: 'Rango orientativo: 550-800 EUR/ud para ventana corredera mediana. Precio ofertado (648,75 EUR) se situa en la franja media del mercado. Precio coherente.',
          source: 'Comparativa instaladores Baleares, ANFAPA 2025',
        },
        {
          title: 'Instalacion fotovoltaica residencial 2-3 kWp llave en mano — Baleares 2025-2026',
          content: 'Instalacion completa 2-3 kWp (paneles + inversor + instalacion + tramitacion): 6.000-9.000 EUR. El Cap 2 (8.400 EUR para 2,4 kWp instalados) se situa en banda media-alta. Solicitar desglose.',
          source: 'IDAE Observatorio Fotovoltaico, datos Baleares 2025',
        },
        {
          title: 'Climatizacion por conductos vivienda unifamiliar 150-200 m2 — Baleares 2025',
          content: 'Rango orientativo instalacion completa: 8.000-13.000 EUR. El Cap 3 (10.650 EUR, 185 m2, 6 estancias) es coherente con el mercado. El coste unitario de la red de conductos merece verificacion.',
          source: 'Elaboracion propia a partir de tarifas de instaladores certificados Baleares 2025',
        },
      ].map((ref, i) =>
        React.createElement(View, { key: String(i), style: rs.refBox },
          React.createElement(Text, { style: rs.refTitle }, ref.title),
          React.createElement(Text, { style: rs.refContent }, ref.content),
          React.createElement(Text, { style: rs.refSource }, 'Fuente: ' + ref.source),
        )
      ),
    ),
    // Annexes note
    React.createElement(View, { style: rs.section },
      React.createElement(Text, { style: rs.sectionTitle }, 'Anexo I — Documento analizado'),
      React.createElement(Text, { style: rs.smallNote },
        'A continuacion de este informe se adjunta el documento original analizado: Presupuesto Ref. ECO-2026-0738 de EcoReforma Energia SL, fecha 5 de mayo de 2026, importe base 26.030 EUR (s/IVA).'),
    ),
    // Disclaimer
    React.createElement(View, { style: rs.disclaimer },
      React.createElement(Text, { style: rs.disclaimerText },
        'Budget Review es un analisis orientativo automatizado generado por Anclora EnergyScan. No sustituye una revision tecnica, contractual, legal ni una medicion real de obra. Los rangos de precios son referencias informativas basadas en datos de mercado disponibles y pueden variar segun zona, empresa y momento de contratacion. Anclora EnergyScan no asume responsabilidad por las decisiones tomadas en base a este informe.'),
    ),
  ),
);

// ─── Budget PDF (EcoReforma Energia SL) ──────────────────────────────────────

const BudgetDoc = React.createElement(Document, null,
  // Page 1: company + client + 3 chapters
  React.createElement(Page, { size: 'A4', style: bs.page },
    React.createElement(View, { style: bs.demoBanner },
      React.createElement(Text, { style: bs.bannerText },
        'DOCUMENTO DEMO — Presupuesto ficticio elaborado para demostracion comercial. Sin validez contractual ni legal.'),
    ),
    React.createElement(View, { style: bs.companyBlock },
      React.createElement(Text, { style: bs.companyName }, 'EcoReforma Energia SL'),
      React.createElement(Text, { style: bs.companyTagline }, 'Especialistas en rehabilitacion energetica, energias renovables y climatizacion eficiente'),
      React.createElement(Text, { style: bs.companyContact },
        'C/ Jaume I 18, 07002 Palma, Illes Balears  ·  NIF: B57284613  ·  Tel: +34 971 456 789  ·  info@ecoreforma.es'),
    ),
    React.createElement(Text, { style: bs.docTitle }, 'PRESUPUESTO DE OBRAS Y SUMINISTRO'),
    React.createElement(Text, { style: bs.docRef },
      'Ref: ECO-2026-0738  ·  Fecha: 5 de mayo de 2026  ·  Validez: 30 dias naturales'),
    React.createElement(View, { style: bs.clientBlock },
      React.createElement(Text, { style: bs.clientTitle }, 'DATOS DEL CLIENTE Y OBRA'),
      ...[
        ['Cliente:', 'Propietario Demo'],
        ['Direccion obra:', 'Calle Flors 7, 07141 Marratxi (Illes Balears)'],
        ['Inmueble:', 'Vivienda unifamiliar aislada, 185 m2 construidos, ano 1998'],
        ['Referencia:', 'Presupuesto integral de rehabilitacion energetica'],
      ].map(([label, value], i) =>
        React.createElement(View, { key: String(i), style: bs.clientRow },
          React.createElement(Text, { style: bs.clientLabel }, label),
          React.createElement(Text, { style: bs.clientValue }, value),
        )
      ),
    ),
    // Cap 1
    React.createElement(Text, { style: bs.chapterTitle }, 'CAPITULO 1 — CARPINTERIA DE ALUMINIO RPT (VENTANAS)'),
    budgetTableHeader(),
    ...budgetRows(cap1),
    chapterTotalEl('Total Cap. 1:', 6980.00),
    // Cap 2
    React.createElement(Text, { style: bs.chapterTitle }, 'CAPITULO 2 — INSTALACION FOTOVOLTAICA DE AUTOCONSUMO'),
    budgetTableHeader(),
    ...budgetRows(cap2),
    chapterTotalEl('Total Cap. 2:', 8400.00),
    // Cap 3
    React.createElement(Text, { style: bs.chapterTitle }, 'CAPITULO 3 — CLIMATIZACION POR CONDUCTOS BOMBA DE CALOR'),
    budgetTableHeader(),
    ...budgetRows(cap3),
    chapterTotalEl('Total Cap. 3:', 10650.00),
  ),
  // Page 2: summary + payment + validity + signatures
  React.createElement(Page, { size: 'A4', style: bs.page },
    React.createElement(View, { style: bs.companyBlock },
      React.createElement(Text, { style: bs.companyName }, 'EcoReforma Energia SL'),
      React.createElement(Text, { style: bs.companyContact },
        'Ref: ECO-2026-0738  ·  Fecha: 5 de mayo de 2026  ·  Pagina 2 de 2'),
    ),
    // Summary
    React.createElement(View, { style: bs.summarySection },
      React.createElement(Text, { style: bs.summaryTitle }, 'RESUMEN DE CAPITULOS'),
      ...[
        ['Cap. 1 — Carpinteria de aluminio RPT', '6.980,00'],
        ['Cap. 2 — Instalacion fotovoltaica de autoconsumo', '8.400,00'],
        ['Cap. 3 — Climatizacion por conductos', '10.650,00'],
      ].map(([label, value], i) =>
        React.createElement(View, { key: String(i), style: bs.summaryRow },
          React.createElement(Text, { style: bs.summaryLabel }, label),
          React.createElement(Text, { style: bs.summaryValue }, value),
        )
      ),
      React.createElement(View, { style: bs.summaryRow },
        React.createElement(Text, { style: [bs.summaryLabel, bs.summaryTotalRow] }, 'BASE IMPONIBLE'),
        React.createElement(Text, { style: [bs.summaryValue, bs.summaryTotalRow] }, '26.030,00'),
      ),
      React.createElement(View, { style: bs.summaryRow },
        React.createElement(Text, { style: bs.summaryLabel }, 'IVA 21%'),
        React.createElement(Text, { style: bs.summaryValue }, '5.466,30'),
      ),
      React.createElement(View, { style: bs.summaryRow },
        React.createElement(Text, { style: [bs.summaryLabel, bs.summaryTotalRow] }, 'TOTAL PRESUPUESTO (con IVA)'),
        React.createElement(Text, { style: [bs.summaryValue, bs.summaryTotalRow] }, '31.496,30'),
      ),
    ),
    // Payment
    React.createElement(View, { style: bs.paymentSection },
      React.createElement(Text, { style: bs.paymentTitle }, 'CONDICIONES DE PAGO'),
      ...[
        ['20% a la firma del contrato', '6.299,26 EUR'],
        ['40% al inicio de obra / primera entrega de materiales', '12.598,52 EUR'],
        ['30% a la certificacion de obra y revision final', '9.448,89 EUR'],
        ['10% saldo a la entrega definitiva de la instalacion', '3.149,63 EUR'],
      ].map(([label, value], i) =>
        React.createElement(View, { key: String(i), style: bs.paymentRow },
          React.createElement(Text, { style: bs.paymentLabel }, label),
          React.createElement(Text, { style: bs.paymentValue }, value),
        )
      ),
    ),
    // Notes
    React.createElement(Text, { style: bs.validityNote },
      'VALIDEZ: La presente oferta tiene validez de 30 dias naturales desde su fecha de emision. Transcurrido dicho plazo sin aceptacion expresa, EcoReforma Energia SL se reserva el derecho a revisar precios y condiciones.',
    ),
    React.createElement(Text, { style: bs.legalNote },
      'Este presupuesto no implica contrato ni compromiso alguno hasta su aceptacion expresa y firma por ambas partes. Los precios indicados no incluyen IVA salvo indicacion contraria. Los trabajos estan sujetos a la normativa vigente aplicable: CTE, REBT, RITE y legislacion sectorial de instalaciones fotovoltaicas. EcoReforma Energia SL — Inscrita en el Registro Mercantil de Baleares, Tomo 3284, Folio 12. Documento elaborado exclusivamente para demostracion comercial Anclora EnergyScan.',
    ),
    // Signature block
    React.createElement(View, { style: bs.signatureBlock },
      React.createElement(View, { style: bs.signatureBox },
        React.createElement(Text, { style: bs.signatureLabel }, 'Por EcoReforma Energia SL'),
        React.createElement(Text, { style: [bs.signatureLabel, { marginTop: 20 }] }, 'Firma y sello:'),
      ),
      React.createElement(View, { style: bs.signatureBox },
        React.createElement(Text, { style: bs.signatureLabel }, 'Conformidad del cliente'),
        React.createElement(Text, { style: [bs.signatureLabel, { marginTop: 20 }] }, 'Firma:'),
      ),
    ),
  ),
);

// ─── Main: render + combine ───────────────────────────────────────────────────

console.log('Rendering Budget Review analysis...');
const reviewBuffer = await renderToBuffer(ReviewDoc);

console.log('Rendering EcoReforma budget...');
const budgetBuffer = await renderToBuffer(BudgetDoc);

console.log('Combining PDFs with pdf-lib...');
const outputPdf = await PDFDocument.create();

// Copy review pages
const reviewPdf = await PDFDocument.load(reviewBuffer);
const reviewPages = await outputPdf.copyPages(reviewPdf, reviewPdf.getPageIndices());
for (const page of reviewPages) outputPdf.addPage(page);

// Separator page
const sepPage = outputPdf.addPage([595.28, 841.89]); // A4
const helveticaBold = await outputPdf.embedFont(StandardFonts.HelveticaBold);
const helvetica = await outputPdf.embedFont(StandardFonts.Helvetica);
sepPage.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(0.965, 0.945, 0.914) });
sepPage.drawLine({ start: { x: 44, y: 560 }, end: { x: 551, y: 560 }, thickness: 2, color: rgb(0, 0.56, 0.353) });
sepPage.drawText('ANEXO I', { x: 44, y: 580, size: 28, font: helveticaBold, color: rgb(0, 0.56, 0.353) });
sepPage.drawText('Documento analizado', { x: 44, y: 530, size: 16, font: helvetica, color: rgb(0.388, 0.361, 0.325) });
sepPage.drawText('Presupuesto Ref. ECO-2026-0738', { x: 44, y: 508, size: 12, font: helveticaBold, color: rgb(0.169, 0.122, 0.071) });
sepPage.drawText('EcoReforma Energia SL  ·  5 de mayo de 2026', { x: 44, y: 490, size: 11, font: helvetica, color: rgb(0.388, 0.361, 0.325) });
sepPage.drawText('Importe base: 26.030,00 EUR (sin IVA)  ·  Total con IVA: 31.496,30 EUR', { x: 44, y: 472, size: 11, font: helvetica, color: rgb(0.388, 0.361, 0.325) });
sepPage.drawLine({ start: { x: 44, y: 460 }, end: { x: 551, y: 460 }, thickness: 0.5, color: rgb(0.847, 0.808, 0.753) });
sepPage.drawText('Documento demo ficticio adjuntado al analisis Budget Review de Anclora EnergyScan.', { x: 44, y: 442, size: 9, font: helvetica, color: rgb(0.545, 0.49, 0.42) });
sepPage.drawText('No tiene validez contractual ni legal.', { x: 44, y: 428, size: 9, font: helvetica, color: rgb(0.545, 0.49, 0.42) });

// Copy budget pages
const budgetPdf = await PDFDocument.load(budgetBuffer);
const budgetPages = await outputPdf.copyPages(budgetPdf, budgetPdf.getPageIndices());
for (const page of budgetPages) outputPdf.addPage(page);

const finalBytes = await outputPdf.save();
const outputPath = path.join(outputDir, 'budget-review-demo.pdf');
writeFileSync(outputPath, finalBytes);

const sizeMB = (finalBytes.length / 1024 / 1024).toFixed(2);
console.log(`Done: ${outputPath} (${sizeMB} MB, ${outputPdf.getPageCount()} pages)`);
