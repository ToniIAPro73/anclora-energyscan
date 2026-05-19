import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const manualDir = path.join(root, 'docs', 'manual');
const inputPath = path.join(manualDir, 'manual-usuario.md');
const outputPath = path.join(manualDir, 'manual-usuario.pdf');
const tmpDir = path.join(root, 'tmp', 'manual-pdf');
const htmlPath = path.join(tmpDir, 'manual-usuario.html');
const passPdfPath = path.join(tmpDir, 'manual-usuario-pass.pdf');

const chrome = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((candidate) => existsSync(candidate));

if (!chrome) {
  throw new Error('No Chrome/Chromium binary found for PDF rendering.');
}

mkdirSync(tmpDir, { recursive: true });

const source = readFileSync(inputPath, 'utf8');
const sections = extractSections(source);

await renderPdf();
const firstPassPages = extractSectionPages(sections);
await renderPdf(firstPassPages);
await stampPageNumbers(passPdfPath, outputPath);

console.log(`Manual generated: ${path.relative(root, outputPath)}`);

function extractSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const coverEnd = lines.findIndex((line) => line.trim() === '<div class="page-break"></div>');
  if (coverEnd === -1) throw new Error('Cover page break not found.');

  const cover = lines.slice(0, coverEnd).join('\n');
  const afterCover = lines.slice(coverEnd + 1);
  const tocIndex = afterCover.findIndex((line) => line.trim() === '## Índice');
  if (tocIndex === -1) throw new Error('Index heading not found.');

  const afterToc = afterCover.slice(tocIndex + 1);
  const contentStart = afterToc.findIndex((line) => line.trim() === '<div class="page-break"></div>');
  if (contentStart === -1) throw new Error('Content page break after index not found.');

  const contentLines = afterToc.slice(contentStart + 1);
  const result = [];
  let current = null;

  for (const line of contentLines) {
    const match = line.match(/^##\s+(\d+)\.\s+(.+)$/);
    if (match) {
      if (current) result.push(current);
      current = {
        number: match[1],
        title: match[2].trim(),
        heading: line,
        lines: [],
      };
      continue;
    }
    if (current) current.lines.push(line);
  }
  if (current) result.push(current);

  return { cover, sections: result };
}

async function renderPdf(sectionPages = {}) {
  writeFileSync(htmlPath, buildHtml(sectionPages), 'utf8');
  execFileSync(chrome, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--print-to-pdf-no-header',
    '--no-pdf-header-footer',
    `--print-to-pdf=${passPdfPath}`,
    `file://${htmlPath}`,
  ], { stdio: 'pipe' });
}

function extractSectionPages(manual) {
  const info = execFileSync('pdfinfo', [passPdfPath], { encoding: 'utf8' });
  const pages = Number(info.match(/Pages:\s+(\d+)/)?.[1] ?? 0);
  const map = {};

  for (let page = 1; page <= pages; page += 1) {
    const pageText = execFileSync('pdftotext', ['-f', String(page), '-l', String(page), passPdfPath, '-'], { encoding: 'utf8' })
      .replace(/\s+/g, ' ');
    for (const section of manual.sections) {
      const marker = `${section.number}. ${section.title}`;
      if (!map[section.number] && pageText.includes(marker)) {
        map[section.number] = page;
      }
    }
  }

  return map;
}

async function stampPageNumbers(input, output) {
  const bytes = readFileSync(input);
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages = pdf.getPages();
  const navy = rgb(0.02, 0.09, 0.16);
  const gold = rgb(0.73, 0.54, 0.21);

  pages.forEach((page, index) => {
    if (index === 0) return;
    const { width } = page.getSize();
    const label = `${index + 1}`;
    page.drawText('Anclora EnergyScan', {
      x: 54,
      y: 20,
      size: 7.5,
      font: bold,
      color: navy,
      opacity: 0.78,
    });
    page.drawText(label, {
      x: width - 54 - font.widthOfTextAtSize(label, 8),
      y: 20,
      size: 8,
      font,
      color: navy,
      opacity: 0.78,
    });
  });

  writeFileSync(output, await pdf.save());
}

function buildHtml(sectionPages) {
  const toc = sections.sections.map((section) => {
    const page = sectionPages[section.number] ?? '';
    return `<a class="toc-row" href="#section-${section.number}">
      <span class="toc-num">${section.number.padStart(2, '0')}</span>
      <span class="toc-title">${escapeHtml(section.title)}</span>
      <span class="toc-rule"></span>
      <span class="toc-pageno">${page}</span>
    </a>`;
  }).join('\n');

  const body = sections.sections.map((section) => `
    <section id="section-${section.number}" class="manual-section">
      <h2>${section.number}. ${escapeHtml(section.title)}</h2>
      ${markdownToHtml(section.lines.join('\n'))}
    </section>
  `).join('\n');

  const cover = injectCoverVisual(sections.cover);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<base href="file://${manualDir}/" />
<title>Anclora EnergyScan - Manual de usuario</title>
<style>
${styles()}
</style>
</head>
<body>
${cover}
<section class="toc-page">
  <p class="kicker">Manual de Usuario</p>
  <h1>Índice</h1>
  <p class="toc-intro">Una guía ordenada para recorrer EnergyScan desde la primera estimación hasta las áreas profesionales y de proveedor.</p>
  <nav class="toc-list">${toc}</nav>
</section>
${body}
</body>
</html>`;
}

function injectCoverVisual(coverHtml) {
  const bars = [
    ['A', '#00dc82', '92%'],
    ['B', '#28c76f', '86%'],
    ['C', '#a2c653', '80%'],
    ['D', '#e4c449', '74%'],
    ['E', '#f0a33a', '68%'],
    ['F', '#df7049', '62%'],
    ['G', '#d94b52', '56%'],
  ].map(([letter, color, width]) => `<div class="rating-row"><span style="width:${width}; background:${color};">${letter}</span></div>`).join('');

  return coverHtml.replace(/\n<\/div>\s*$/, `
<div class="cover-rating" aria-hidden="true">
  <div class="rating-card">
    <div class="rating-head">Energy class</div>
    ${bars}
  </div>
</div>
</div>`);
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  let html = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed === '---' || trimmed === '<div class="page-break"></div>') {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('<div class="footer-brand">')) {
      while (i < lines.length) {
        if (lines[i].trim() === '</div>') break;
        i += 1;
      }
      i += 1;
      continue;
    }

    const image = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (image) {
      html += `<figure><img src="${escapeAttribute(image[2])}" alt="${escapeAttribute(image[1])}" /><figcaption>${escapeHtml(image[1])}</figcaption></figure>`;
      i += 1;
      continue;
    }

    if (/^###\s+/.test(trimmed)) {
      html += `<h3>${inline(trimmed.replace(/^###\s+/, ''))}</h3>`;
      i += 1;
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      const quote = [];
      while (i < lines.length && /^>\s+/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s+/, ''));
        i += 1;
      }
      html += `<blockquote>${quote.map(inline).join('<br>')}</blockquote>`;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^[-*]\s+/, ''))}</li>`);
        i += 1;
      }
      html += `<ul>${items.join('')}</ul>`;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(`<li>${inline(lines[i].trim().replace(/^\d+\.\s+/, ''))}</li>`);
        i += 1;
      }
      html += `<ol>${items.join('')}</ol>`;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      html += tableToHtml(tableLines);
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i].trim())) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    html += `<p>${inline(paragraph.join(' '))}</p>`;
  }

  return html;
}

function isBlockStart(line) {
  return /^###\s+/.test(line)
    || /^!\[/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+\.\s+/.test(line)
    || /^>\s+/.test(line)
    || line.startsWith('|')
    || line === '---'
    || line === '<div class="page-break"></div>'
    || line.startsWith('<div class="footer-brand">');
}

function tableToHtml(lines) {
  const rows = lines
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));
  if (rows.length === 0) return '';
  const [head, ...body] = rows;
  return `<table><thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join('')}</tr></thead><tbody>${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function inline(value) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function styles() {
  return `
@page { size: A4; margin: 24mm 18mm 27mm; }
@page cover { size: A4; margin: 0; }
* { box-sizing: border-box; }
body {
  margin: 0;
  color: #071726;
  background: #fff;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 10.3pt;
  line-height: 1.48;
}
a { color: inherit; text-decoration: none; }
.cover-page {
  page: cover;
  min-height: 297mm;
  margin: 0;
  padding: 33mm 30mm 26mm;
  color: #f7f2e7;
  background:
    repeating-linear-gradient(112deg, rgba(216, 184, 107, 0.045) 0, rgba(216, 184, 107, 0.045) 1px, transparent 1px, transparent 13px),
    repeating-linear-gradient(22deg, rgba(255, 255, 255, 0.025) 0, rgba(255, 255, 255, 0.025) 1px, transparent 1px, transparent 19px),
    linear-gradient(145deg, #03111d 0%, #082234 48%, #102f31 100%);
  page-break-after: always;
  position: relative;
  overflow: hidden;
  text-align: center;
}
.cover-page::before {
  content: "";
  position: absolute;
  inset: 18mm 18mm;
  border: 1px solid rgba(212, 178, 95, 0.55);
}
.cover-page::after {
  content: "";
  position: absolute;
  right: -25mm;
  bottom: -30mm;
  width: 110mm;
  height: 110mm;
  border: 1px solid rgba(0, 220, 130, 0.22);
  transform: rotate(18deg);
}
.cover-rating {
  position: absolute;
  z-index: 0;
  right: -6mm;
  top: 82mm;
  width: 82mm;
  padding: 8mm;
  border-radius: 7mm;
  background: rgba(5, 16, 25, 0.42);
  border: 1px solid rgba(216, 184, 107, 0.2);
  box-shadow: 0 20mm 45mm rgba(0, 0, 0, 0.4);
  transform: rotate(-6deg);
  opacity: 0.38;
  filter: blur(0.45px);
}
.rating-card {
  width: 100%;
}
.rating-head {
  margin: 0 0 4mm;
  color: rgba(244, 232, 200, 0.82);
  font-size: 7pt;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.rating-row {
  height: 7.2mm;
  margin: 1.5mm 0;
}
.rating-row span {
  display: block;
  height: 100%;
  padding-right: 3mm;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 0 999px 999px 0;
  font-size: 8pt;
  font-weight: 900;
  line-height: 7.2mm;
  text-align: right;
  box-shadow: 0 1mm 3mm rgba(0, 0, 0, 0.24);
}
.cover-logo,
.cover-brand,
.cover-title,
.cover-subtitle,
.cover-meta,
.cover-disclaimer {
  position: relative;
  z-index: 2;
}
.cover-logo img {
  width: 46mm;
  height: auto;
  margin-bottom: 24mm;
  filter: drop-shadow(0 6mm 12mm rgba(0, 0, 0, 0.34));
}
.cover-logo {
  display: flex;
  justify-content: center;
}
.cover-brand {
  color: #d8b86b;
  font-size: 12.5pt;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.cover-title {
  margin: 8mm auto 0;
  max-width: 142mm;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 45pt;
  line-height: 0.98;
  font-weight: 600;
}
.cover-subtitle {
  margin: 11mm auto 0;
  max-width: 128mm;
  color: #d8e3e7;
  font-size: 16pt;
  line-height: 1.32;
}
.cover-meta {
  display: flex;
  justify-content: center;
  gap: 7mm;
  margin-top: 29mm;
  color: #071726;
  font-size: 9.5pt;
  font-weight: 700;
}
.cover-meta div {
  min-width: 43mm;
  padding: 3.2mm 6mm;
  background: #d8b86b;
  border-radius: 999px;
}
.cover-disclaimer {
  position: absolute;
  left: 30mm;
  right: 30mm;
  bottom: 28mm;
  color: #bfccd1;
  font-size: 9pt;
  text-align: center;
}
.toc-page {
  page: auto;
  page-break-after: always;
  min-height: auto;
  padding: 0;
}
.kicker {
  color: #9a7a31;
  font-size: 8pt;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.toc-page h1 {
  margin: 0 0 5mm;
  color: #071726;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 34pt;
  font-weight: 600;
}
.toc-intro {
  width: 126mm;
  margin-bottom: 12mm;
  color: #4c5f6b;
  font-size: 10.4pt;
}
.toc-list {
  border-top: 1px solid #c7a451;
}
.toc-row {
  display: grid;
  grid-template-columns: 13mm auto 1fr 12mm;
  align-items: baseline;
  gap: 3mm;
  min-height: 11.7mm;
  padding: 3.3mm 0;
  border-bottom: 1px solid #e4ddd1;
  color: #071726;
}
.toc-num {
  color: #9a7a31;
  font-size: 8pt;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.toc-title {
  font-family: Georgia, "Times New Roman", serif;
  font-size: 12.8pt;
}
.toc-rule {
  border-bottom: 1px dotted #b8c0c5;
  transform: translateY(-1.5mm);
}
.toc-pageno {
  color: #071726;
  font-weight: 800;
  text-align: right;
}
.manual-section {
  page: auto;
  page-break-before: always;
  min-height: auto;
  padding: 0;
}
.manual-section h2 {
  margin: 0 0 8mm;
  padding: 0 0 4mm;
  color: #071726;
  border-bottom: 1px solid #c7a451;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 25pt;
  line-height: 1.08;
  font-weight: 600;
}
h3 {
  margin: 7mm 0 3mm;
  color: #0a3854;
  font-size: 13.5pt;
  line-height: 1.2;
}
p { margin: 0 0 3.6mm; }
strong { color: #071726; font-weight: 800; }
ul, ol { margin: 1mm 0 4mm 6mm; padding-left: 4mm; }
li { margin: 1.4mm 0; }
table {
  width: 100%;
  margin: 4mm 0 6mm;
  border-collapse: collapse;
  page-break-inside: avoid;
  font-size: 9pt;
}
th {
  color: #071726;
  background: #f3ead8;
  border-top: 1px solid #c7a451;
  border-bottom: 1px solid #c7a451;
  font-weight: 800;
}
td, th {
  padding: 2.6mm 3mm;
  border-bottom: 1px solid #dfe5e8;
  vertical-align: top;
}
td:first-child, th:first-child { border-left: 1px solid #e7ecef; }
td:last-child, th:last-child { border-right: 1px solid #e7ecef; }
blockquote {
  margin: 5mm 0;
  padding: 4mm 5mm;
  color: #263b49;
  background: #f7f4ee;
  border-left: 2mm solid #c7a451;
  page-break-inside: avoid;
}
figure {
  margin: 5mm 0 7mm;
  page-break-inside: avoid;
}
figure img {
  display: block;
  width: 100%;
  max-height: 85mm;
  object-fit: contain;
  border: 1px solid #d8e0e4;
}
#section-13 figure img {
  width: 82%;
  margin: 0 auto;
}
#section-13 figure {
  margin-bottom: 3mm;
}
#section-13 {
  font-size: 9.2pt;
  line-height: 1.34;
}
#section-13 h2 {
  font-size: 23pt;
  margin-bottom: 6mm;
}
#section-13 h3 {
  margin: 5mm 0 2mm;
  font-size: 12pt;
}
#section-13 p,
#section-13 li {
  margin-bottom: 1.2mm;
}
#section-13 table {
  margin: 3mm 0 4mm;
  font-size: 8.5pt;
}
#section-13 td,
#section-13 th {
  padding: 2mm 2.4mm;
}
figcaption {
  margin-top: 1.6mm;
  color: #60727c;
  font-size: 8pt;
}
.footer-brand {
  margin-top: 14mm;
  padding-top: 5mm;
  border-top: 1px solid #c7a451;
  color: #51646f;
  text-align: center;
}
`;
}
