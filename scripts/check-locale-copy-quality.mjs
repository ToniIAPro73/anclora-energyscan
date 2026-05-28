/**
 * Anclora EnergyScan — Locale Copy Quality Check
 * ESM, zero external dependencies.
 *
 * Detects:
 *   1. Prohibited literalisms in all locale JSON files
 *   2. Keys containing legal/disclaimer content requiring human review
 *
 * Outputs:
 *   reports/locale-copy/copy-quality-report.md
 *
 * Usage:
 *   node scripts/check-locale-copy-quality.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const localesDir = path.join(root, 'public', 'locales');
const reportsDir = path.join(root, 'reports', 'locale-copy');

// ─── Prohibited literalisms ────────────────────────────────────────────────────
// Patterns that should NOT appear in Premium copy: informal, anglicised or
// legally ambiguous phrasings.
const PROHIBITED_PATTERNS = [
  // Anglicisms / calques
  { pattern: /siéntete libre/i, reason: 'Calco anglicista: "feel free to"' },
  { pattern: /no dudes en/i, reason: 'Calco anglicista: "do not hesitate to"' },
  { pattern: /propiedades únicas/i, reason: 'Literalismo: "unique properties"' },
  { pattern: /Wir begrüßen Ihre Fragen/i, reason: 'Formulaic DE phrase (prohibited)' },
  { pattern: /n'hésitez pas/i, reason: 'Literalismo FR: "do not hesitate"' },
  { pattern: /sentiti libero/i, reason: 'Literalismo IT: "feel free to"' },
  { pattern: /feel free/i, reason: 'Literalismo EN: "feel free to"' },
  { pattern: /don't hesitate/i, reason: 'Literalismo EN: "do not hesitate"' },
  // Over-promising / guarantee language (must never appear)
  { pattern: /garantiz[a-záéíóú]*/i, reason: 'Posible promesa de garantía' },
  { pattern: /garantie\b/i, reason: 'Posible promesa de garantía (FR/DE)' },
  { pattern: /garantiamo/i, reason: 'Posible promesa de garantía (IT)' },
  { pattern: /garantim/i, reason: 'Posible promesa de garantía (CA)' },
  { pattern: /garantimos/i, reason: 'Posible promesa de garantía (PT)' },
  // "Official certificate" — must always be negated/qualified
  { pattern: /certificado oficial\b(?!\s*(no|ni))/i, reason: 'Mención a certificado oficial sin negación' },
];

// ─── Keys that contain legal/disclaimer content requiring LEGAL_REVIEW_REQUIRED tag
const LEGAL_KEYS = [
  'legalDisclaimer',
  'paywall.legalNotice',
  'seo.disclaimer',
  'providerHandoff.consent',
  'partnerLanding.disclaimer',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function loadLocaleFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    return null;
  }
}

function scanForProhibited(data, lang, file) {
  const findings = [];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string') continue;
    for (const { pattern, reason } of PROHIBITED_PATTERNS) {
      if (pattern.test(value)) {
        findings.push({ lang, key, value: value.slice(0, 120), reason });
      }
    }
  }
  return findings;
}

function scanForLegalKeys(data, lang) {
  const findings = [];
  for (const key of LEGAL_KEYS) {
    if (data[key] !== undefined) {
      findings.push({ lang, key, value: String(data[key]).slice(0, 200) });
    }
  }
  return findings;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const allProhibited = [];
const allLegal = [];
const localesSummary = [];

if (!existsSync(localesDir)) {
  console.error(`Locales directory not found: ${localesDir}`);
  process.exit(1);
}

const langs = readdirSync(localesDir).filter((f) => {
  try {
    return readdirSync(path.join(localesDir, f)).length > 0;
  } catch {
    return false;
  }
}).sort();

for (const lang of langs) {
  const commonPath = path.join(localesDir, lang, 'common.json');
  if (!existsSync(commonPath)) {
    localesSummary.push({ lang, keys: 0, status: 'MISSING common.json' });
    continue;
  }
  const data = loadLocaleFile(commonPath);
  if (!data) {
    localesSummary.push({ lang, keys: 0, status: 'PARSE ERROR' });
    continue;
  }
  const keyCount = Object.keys(data).length;
  localesSummary.push({ lang, keys: keyCount, status: 'OK' });
  allProhibited.push(...scanForProhibited(data, lang, commonPath));
  allLegal.push(...scanForLegalKeys(data, lang));
}

// ─── Report ────────────────────────────────────────────────────────────────────
mkdirSync(reportsDir, { recursive: true });

const now = new Date().toISOString().slice(0, 10);
const lines = [];

lines.push(`# Locale Copy Quality Report`);
lines.push(`Generated: ${now}`);
lines.push(``);

// Summary table
lines.push(`## Locales scanned`);
lines.push(``);
lines.push(`| Locale | Keys | Status |`);
lines.push(`| --- | ---: | --- |`);
for (const { lang, keys, status } of localesSummary) {
  lines.push(`| ${lang} | ${keys} | ${status} |`);
}
lines.push(``);

// Prohibited findings
lines.push(`## Prohibited literalism findings`);
lines.push(``);
if (allProhibited.length === 0) {
  lines.push(`No prohibited patterns detected.`);
} else {
  lines.push(`| Locale | Key | Reason | Value (truncated) |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const { lang, key, reason, value } of allProhibited) {
    lines.push(`| ${lang} | \`${key}\` | ${reason} | ${value.replace(/\|/g, '\\|')} |`);
  }
}
lines.push(``);

// Legal keys
lines.push(`## Legal / disclaimer keys — LEGAL_REVIEW_REQUIRED`);
lines.push(``);
lines.push(`The following keys contain legal or disclaimer content. Each entry requires`);
lines.push(`review by a qualified legal professional before any official or regulatory use.`);
lines.push(``);
if (allLegal.length === 0) {
  lines.push(`No legal keys found (unexpected — check LEGAL_KEYS list).`);
} else {
  lines.push(`| Locale | Key | Value (truncated) |`);
  lines.push(`| --- | --- | --- |`);
  for (const { lang, key, value } of allLegal) {
    lines.push(`| ${lang} | \`${key}\` | ${value.replace(/\|/g, '\\|')} |`);
  }
}
lines.push(``);
lines.push(`---`);
lines.push(`Anclora EnergyScan · locale copy quality check`);

const reportPath = path.join(reportsDir, 'copy-quality-report.md');
writeFileSync(reportPath, lines.join('\n'), 'utf8');

// Console summary
const prohibitedCount = allProhibited.length;
const legalCount = allLegal.length;

console.log(`\nAnclora EnergyScan — Locale Copy Quality Check`);
console.log(`================================================`);
console.log(`Locales scanned : ${langs.join(', ')}`);
console.log(`Prohibited hits : ${prohibitedCount}`);
console.log(`Legal keys found: ${legalCount}`);
console.log(`Report saved to : ${reportPath}`);

if (prohibitedCount > 0) {
  console.warn(`\nWARNING: ${prohibitedCount} prohibited pattern(s) found. Review the report.`);
  process.exitCode = 1;
} else {
  console.log(`\nAll clear — no prohibited patterns detected.`);
}
