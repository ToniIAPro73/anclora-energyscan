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
    '--use-gl=swiftshader',
    '--enable-webgl',
    '--enable-webgl2',
  ],
  acceptInsecureCerts: true,
});

/**
 * @param {string} url
 * @param {string} filename
 * @param {{ mobile?: boolean, lang?: 'es'|'en'|'de', theme?: 'dark'|'light', afterLoad?: Function }} opts
 */
async function shot(url, filename, { mobile = false, lang = 'es', theme = 'dark', afterLoad } = {}) {
  const currency = lang === 'en' ? 'GBP' : 'EUR';
  const measurement = lang === 'en' ? 'imperial' : 'metric';

  const pg = await browser.newPage();
  await pg.setViewport(mobile
    ? { width: 390, height: 844, deviceScaleFactor: 2 }
    : { width: W, height: H, deviceScaleFactor: 1.5 });

  await pg.evaluateOnNewDocument((theme, lang, currency, measurement) => {
    // Preferencias de la app (cookie names reales de EnergyScan)
    const set = (name, value) => {
      document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    };
    set('enerscan-theme', theme);
    set('enerscan-language', lang);
    set('enerscan-currency', currency);
    set('enerscan-measurement-system', measurement);
    // Marcar cookies como aceptadas para que no aparezca el banner
    set('cookie_consent', 'accepted');
    set('cookieConsent', 'accepted');
    // localStorage fallback
    localStorage.setItem('enerscan-theme', theme);
    localStorage.setItem('enerscan-language', lang);
    localStorage.setItem('enerscan-currency', currency);
    localStorage.setItem('enerscan-measurement-system', measurement);
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookieConsent', 'accepted');
  }, theme, lang, currency, measurement);

  await pg.goto(`${BASE}${url}`, { waitUntil: 'networkidle2', timeout: 40000 });

  // Cerrar banner de cookies si aparece igualmente
  try {
    await pg.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const accept = btns.find(b => /accept|aceptar|akzeptieren/i.test(b.textContent ?? ''));
      if (accept) accept.click();
    });
    await new Promise(r => setTimeout(r, 600));
  } catch {}

  if (afterLoad) await afterLoad(pg);

  // Pequeña pausa para que las animaciones se estabilicen
  await new Promise(r => setTimeout(r, 800));

  const ext = filename.endsWith('.jpeg') ? 'jpeg' : 'png';
  await pg.screenshot({
    path: path.join(OUT, filename),
    fullPage: false,
    type: ext,
    ...(ext === 'jpeg' ? { quality: 90 } : {}),
  });

  console.log(`✓ ${filename}  [${lang} · ${theme}]`);
  await pg.close();
}

// ── Helpers para el wizard ───────────────────────────────────────────────────
async function wizardTarget(pg) {
  await pg.evaluate(() => {
    const btns = [...document.querySelectorAll('button[type="button"]')];
    const opt = btns.find(b => /alcanzar|letter|letra concreta|reach|bestimmte/i.test(b.textContent ?? ''));
    opt?.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await pg.evaluate(() => {
    const btns = [...document.querySelectorAll('button[type="button"]')];
    const b = btns.find(btn => btn.textContent?.trim() === 'B');
    b?.click();
  });
  await new Promise(r => setTimeout(r, 500));
}

async function wizardMap(pg) {
  await pg.evaluate(() => {
    const btns = [...document.querySelectorAll('button[type="button"]')];
    const opt = btns.find(b => /conocer|estado actual|current|kennenlernen|aktuellen/i.test(b.textContent ?? ''));
    opt?.click();
  });
  await new Promise(r => setTimeout(r, 3000));
}

// ════════════════════════════════════════════════════════════════════════════
// LANDING PAGE — hero + home completa (3 idiomas × 2 temas en hero)
// Afectados por: navbar reordenado, botón Descubrir, social rail, sección #precios
// ════════════════════════════════════════════════════════════════════════════

// ES
await shot('/', 'hero-dark.png',  { lang: 'es', theme: 'dark' });
await shot('/', 'hero-light.png', { lang: 'es', theme: 'light' });
await shot('/', 'home-dark.png',  { lang: 'es', theme: 'dark',
  afterLoad: async (pg) => {
    // Scroll hasta el final para que la página completa sea visible en viewport superior
    await pg.evaluate(() => window.scrollTo(0, 0));
  }
});

// EN
await shot('/', 'imagen-pag3-en.png', { lang: 'en', theme: 'dark' });
await shot('/', 'imagen-pag7-en.png', { lang: 'en', theme: 'light' });
await shot('/', 'imagen-pag8-en.png', { lang: 'en', theme: 'dark' });

// DE
await shot('/', 'imagen-pag3-de.png', { lang: 'de', theme: 'dark' });
await shot('/', 'imagen-pag7-de.png', { lang: 'de', theme: 'light' });
await shot('/', 'imagen-pag8-de.png', { lang: 'de', theme: 'dark' });

// ════════════════════════════════════════════════════════════════════════════
// PÁGINA PROFESIONAL — botón renombrado a "Registrar profesional"
// ════════════════════════════════════════════════════════════════════════════

// ES (filename no tiene número de página en el manual ES pero existe en la carpeta)
await shot('/profesional', 'profesional-dark.png', { lang: 'es', theme: 'dark' });

// EN
await shot('/profesional', 'imagen-pag25-en.jpeg', { lang: 'en', theme: 'dark' });

// DE
await shot('/profesional', 'imagen-pag25-de.jpeg', { lang: 'de', theme: 'dark' });

// ════════════════════════════════════════════════════════════════════════════
// RESTO DE PÁGINAS (navbar actualizado — mantiene idioma ES por coherencia
// con manual ES; las versiones EN/DE de estas páginas no cambiaron de fondo)
// ════════════════════════════════════════════════════════════════════════════

await shot('/pricing',      'pricing-dark.png',            { lang: 'es', theme: 'dark' });
await shot('/proveedores',  'proveedores-dark.png',         { lang: 'es', theme: 'dark' });
await shot('/proveedores',  'proveedores-en-dark.png',      { lang: 'en', theme: 'dark' });
await shot('/proveedores',  'proveedores-de-dark.png',      { lang: 'de', theme: 'dark' });
await shot('/dashboard',    'dashboard-connected-dark.png', { lang: 'es', theme: 'dark' });
await shot('/dashboard',    'dashboard-connected-mobile.png', { lang: 'es', theme: 'dark', mobile: true });

// Wizard — selector de letra objetivo
await shot('/wizard', 'wizard-target-dark.png', {
  lang: 'es', theme: 'dark',
  afterLoad: wizardTarget,
});

// Wizard — paso 2 con mapa catastral
await shot('/wizard', 'wizard-map-dark.png', {
  lang: 'es', theme: 'dark',
  afterLoad: wizardMap,
});

await browser.close();
console.log('\n✅ Capturas guardadas en docs/manual/screenshots/');
