/**
 * Captura pantallazos limpios (sin dialog de cookies) para el manual.
 * Uso: node scripts/capture-manual-screenshots.mjs
 *
 * Requisitos: Google Chrome instalado en /usr/bin/google-chrome
 * Variables de entorno: NEXT_PUBLIC_APP_URL (por defecto https://anclora-energyscan.vercel.app)
 */

import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'docs', 'manual', 'screenshots');
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://anclora-energyscan.vercel.app';
const CHROME = '/usr/bin/google-chrome';
const W = 1440;
const H = 900;

mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--ignore-certificate-errors',
    // SwiftShader: WebGL por software (necesario para MapLibre sin GPU física)
    '--use-gl=swiftshader',
    '--enable-webgl',
    '--enable-webgl2',
  ],
  acceptInsecureCerts: true,
});

async function page(url, filename, { mobile = false, afterLoad } = {}) {
  const pg = await browser.newPage();
  await pg.setViewport(mobile
    ? { width: 390, height: 844, deviceScaleFactor: 2 }
    : { width: W, height: H, deviceScaleFactor: 1.5 });

  // Pre-set preferencias: dark theme, ES, cerrar cookie consent
  await pg.evaluateOnNewDocument(() => {
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('locale', 'es');
    localStorage.setItem('currency', 'EUR');
    localStorage.setItem('units', 'm2');
    // Marcar cookies como aceptadas para que no aparezca el banner
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookieConsent', 'accepted');
    document.cookie = 'cookie_consent=accepted; path=/';
    document.cookie = 'cookieConsent=accepted; path=/';
  });

  await pg.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 30000 });

  // Cerrar banner de cookies si aparece igualmente
  try {
    const btn = await pg.$('button[data-accept], button::-p-text(Aceptar todas), [data-testid="cookie-accept"]');
    if (btn) await btn.click();
  } catch {}
  try {
    await pg.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const accept = btns.find(b => /aceptar todas/i.test(b.textContent));
      if (accept) accept.click();
    });
    await new Promise(r => setTimeout(r, 600));
  } catch {}

  if (afterLoad) await afterLoad(pg);

  await pg.screenshot({
    path: path.join(OUT, filename),
    fullPage: false,
    type: 'png',
  });

  console.log(`✓ ${filename}`);
  await pg.close();
}

// ── Reemplazar pantallazos con cookie dialog ────────────────────────────────
await page('/pricing', 'pricing-dark.png');
await page('/proveedores', 'proveedores-dark.png');
await page('/dashboard', 'dashboard-connected-dark.png');
await page('/dashboard', 'dashboard-connected-mobile.png', { mobile: true });

// ── Wizard paso 1b: selector de letra objetivo ──────────────────────────────
await page('/wizard', 'wizard-target-dark.png', {
  afterLoad: async (pg) => {
    // Clic en la opción "Alcanzar una letra concreta" (2ª de las 3 opciones)
    await pg.evaluate(() => {
      const btns = [...document.querySelectorAll('button[type="button"]')];
      const opt = btns.find(b => /alcanzar|letter|letra concreta/i.test(b.textContent ?? ''));
      opt?.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    // Seleccionar letra B
    await pg.evaluate(() => {
      const btns = [...document.querySelectorAll('button[type="button"]')];
      const b = btns.find(btn => btn.textContent?.trim() === 'B');
      b?.click();
    });
    await new Promise(r => setTimeout(r, 500));
  },
});

// ── Wizard paso 2: datos de la vivienda con mapa catastral ──────────────────
await page('/wizard', 'wizard-map-dark.png', {
  afterLoad: async (pg) => {
    // Paso 1: clic en cualquier objetivo que avance directamente al paso 2
    // "Conocer el estado actual" → nextStep() directo sin letter picker
    await pg.evaluate(() => {
      const btns = [...document.querySelectorAll('button[type="button"]')];
      const opt = btns.find(b => /conocer|estado actual|current/i.test(b.textContent ?? ''));
      opt?.click();
    });
    // Esperar a que React renderice el paso 2 con el mapa
    await new Promise(r => setTimeout(r, 3000));
  },
});

await browser.close();
console.log('\nCapturas guardadas en docs/manual/screenshots/');
