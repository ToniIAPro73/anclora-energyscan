#!/usr/bin/env node
/**
 * Captura de pantallazos del manual de usuario ES (Anclora EnergyScan) desde PRODUCCIÓN.
 *
 * Uso: node scripts/manual/capture-manual-es.mjs [--only a.png,b.png] [--list] [--no-seed]
 *
 * Reglas:
 *  - Solo la identidad QA qa.energyscan@anclora.local. El script NUNCA maneja contraseñas:
 *    el inicio de sesión lo hace Toni en una ventana visible y se guarda el storageState
 *    en tmp/manual-auth/qa-state.json (tmp/ está en .gitignore).
 *  - Datos: como máximo crea UN análisis QA (vía wizard real) y, si no existe ninguno,
 *    UN Budget Review QA (se vincula al usuario QA). Con --no-seed no escribe nada.
 *  - Nunca envía solicitud profesional, registro de proveedor, checkout ni pagos.
 */
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ─── Configuración ──────────────────────────────────────────────────────────────
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = (process.env.MANUAL_APP_URL || 'https://anclora-energyscan.vercel.app').replace(/\/$/, '');
const QA_EMAIL = process.env.MANUAL_QA_EMAIL || 'qa.energyscan@anclora.local';
const TEST_RC = (process.env.MANUAL_TEST_RC || '').trim();
const OUT_DIR = path.join(root, 'docs', 'manual', 'screenshots');
const DEBUG_DIR = path.join(root, 'tmp', 'manual-capture-debug');
const STATE_PATH = process.env.MANUAL_QA_STATE_PATH || path.join(root, 'tmp', 'manual-auth', 'qa-state.json');
const LOG_PATH = path.join(root, 'tmp', 'manual-capture-log.json');
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const CHROME_ARGS = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'];
const LOGIN_TIMEOUT_MS = 10 * 60 * 1000;

const args = process.argv.slice(2);
const onlyArg = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const ONLY = onlyArg ? new Set(onlyArg.split(',').map((s) => s.trim()).filter(Boolean)) : null;
const NO_SEED = args.includes('--no-seed');
const LIST = args.includes('--list');

// Presupuesto sintético (ficticio) para el Budget Review QA.
const SYNTHETIC_BUDGET = [
  'PRESUPUESTO DE REFORMA ENERGÉTICA (ejemplo ficticio QA)',
  '1. Sustitución de 6 ventanas PVC doble acristalamiento 4/16/4 con rotura de puente térmico: 4.800,00 €',
  '2. Aislamiento SATE en fachada, 90 m2, EPS 80 mm con acabado acrílico: 7.200,00 €',
  '3. Andamiaje y medios auxiliares: 900,00 €',
  'Subtotal: 12.900,00 €  IVA 21 %: 2.709,00 €  TOTAL: 15.609,00 €',
].join('\n');

class PendingError extends Error {}
const pending = (reason) => { throw new PendingError(reason); };

// ─── Utilidades de página ───────────────────────────────────────────────────────
async function settle(page, ms = 1200) {
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(ms);
}
async function go(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 60000 });
  await settle(page);
}
const visibleButton = (page, name) => page.locator('button:visible', { hasText: name }).first();

// ─── Lista declarativa de pantallas ────────────────────────────────────────────
// run(page, h) → undefined (captura del viewport) | { target: Locator } | { fullPage: true } | { done: true }
const SCREENS = [
  {
    file: 'logo.png', auth: 'none', mode: 'auto',
    run: async () => { copyFileSync(path.join(root, 'public', 'brand', 'anclora-energyscan.png'), path.join(OUT_DIR, 'logo.png')); return { done: true }; },
  },
  { file: 'hero-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/'); } },
  { file: 'auth-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/auth'); } },
  { file: 'hero-light.png', auth: 'guest', theme: 'light', mode: 'auto', run: async (p) => { await go(p, '/'); } },
  {
    file: 'home-dark.png', auth: 'guest', mode: 'auto',
    // Página de inicio con el menú «Producto» desplegado.
    run: async (p) => { await go(p, '/'); await visibleButton(p, 'Producto').click(); await p.waitForTimeout(500); },
  },
  {
    file: 'imagen-pag9-es.png', auth: 'guest', mode: 'auto',
    run: async (p) => {
      await go(p, '/calculadora-ahorro');
      await p.locator('select[name=propertyType]').selectOption('flat');
      await p.locator('input[name=area]').fill('85');
      await p.locator('select[name=currentLetter]').selectOption('E');
      await p.locator('select[name=measure]').selectOption('windows');
      await p.locator('input[name=monthlySpend]').fill('120');
      await p.getByRole('button', { name: 'Calcular rango orientativo' }).click();
      const res = p.getByText(/^Resultado para:/).first();
      await res.waitFor({ timeout: 15000 });
      await res.scrollIntoViewIfNeeded();
      await p.evaluate(() => window.scrollBy(0, -120));
      await p.waitForTimeout(600);
    },
  },
  {
    file: 'calculator-advanced-dark.png', auth: 'guest', mode: 'auto',
    run: async (p) => {
      await go(p, '/calculadora-ahorro');
      const adv = visibleButton(p, 'Opciones avanzadas');
      await adv.click();
      await p.waitForTimeout(400);
      const bills = visibleButton(p, 'Importar facturas de suministros');
      if (await bills.count()) await bills.click();
      await p.waitForTimeout(400);
      await p.locator('button:visible', { hasText: /Ocultar opciones avanzadas|Opciones avanzadas/ }).first().scrollIntoViewIfNeeded();
    },
  },
  { file: 'wizard-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/wizard'); } },
  {
    file: 'wizard-target-dark.png', auth: 'guest', mode: 'auto',
    run: async (p) => {
      await go(p, '/wizard');
      await p.getByRole('button', { name: /Alcanzar una letra concreta/ }).click();
      await p.getByRole('button', { name: 'B', exact: true }).click();
      await p.getByRole('button', { name: /Continuar con la letra B/ }).waitFor();
    },
  },
  {
    file: 'wizard-map-dark.png', auth: 'guest', mode: TEST_RC ? 'auto' : 'pending',
    reason: TEST_RC ? undefined : 'Requiere una referencia catastral real: define MANUAL_TEST_RC con una referencia pública.',
    run: async (p) => {
      await go(p, '/wizard');
      await p.getByRole('button', { name: /Conocer situación actual/ }).click();
      await p.waitForTimeout(1500);
      await p.getByRole('button', { name: 'Referencia Catastral', exact: true }).click();
      await p.locator('input[placeholder="Ej. 1234567AB1234C0001DE"]').fill(TEST_RC);
      await p.getByRole('button', { name: 'Buscar vivienda' }).click();
      await p.waitForTimeout(8000);
      const use = p.locator('button:visible', { hasText: /Usar estos datos|Confirmar y usar estos datos/ }).first();
      if (await use.count()) { await use.click(); await p.waitForTimeout(5000); }
      await settle(p, 2500);
    },
  },
  {
    file: 'wizard-envelope-dark.png', auth: 'guest', mode: 'auto',
    // Paso 3 (Envolvente) como paso representativo 3-5.
    run: async (p) => {
      await go(p, '/wizard');
      await p.getByRole('button', { name: /Conocer situación actual/ }).click();
      await p.waitForTimeout(1500);
      await visibleButton(p, /^Siguiente$/).click();
      await p.getByRole('heading', { name: 'Envolvente' }).waitFor();
    },
  },
  {
    file: 'assessment-target-viability-dark.png', auth: 'qa', mode: 'auto',
    run: (p, h) => qaOrStateless(p, h, (pg) => pg.locator('div.rounded-2xl', { hasText: /Alcanzar la letra|Tu objetivo \(letra/ }).first()),
  },
  {
    file: 'assessment-photos-premium-banner-dark.png', auth: 'guest', mode: 'auto',
    // El análisis QA no lleva fotos: se usa el demo modificado (sin escritura en BD).
    run: async (p, h) => {
      h.note('análisis sin guardar (demo modificado, sin escritura)');
      await go(p, await h.statelessRoute('target'));
      const t = p.locator('div.rounded-2xl', { hasText: 'Tus imágenes se conservan como evidencias' }).last();
      await t.waitFor({ timeout: 15000 });
      return { target: t };
    },
  },
  {
    file: 'assessment-free-pdf-dark.png', auth: 'qa', mode: 'auto',
    run: (p, h) => qaOrStateless(p, h, (pg) => pg.locator('section', { hasText: 'Descarga tu prediagnóstico gratuito' }).first()),
  },
  {
    file: 'assessment-evidence-dark.png', auth: 'qa', mode: 'auto',
    run: (p, h) => qaOrStateless(p, h, (pg) => pg.locator('section', { has: pg.getByRole('heading', { name: 'Evidencias y fuentes de datos' }) }).first()),
  },
  {
    file: 'assessment-condition-risk-dark.png', auth: 'qa', mode: 'auto',
    run: (p, h) => qaOrStateless(p, h, (pg) => pg.locator('section', { has: pg.getByRole('heading', { name: /Estado & Riesgo/ }) }).first()),
  },
  {
    file: 'assessment-premium-demo-dark.png', auth: 'guest', mode: 'auto',
    // Resultado con Premium visible usando el demo oficial (datos ficticios, sin escritura).
    run: async (p, h) => {
      await go(p, await h.statelessRoute('demo'));
      const t = p.locator('section', { has: p.getByRole('heading', { name: 'Simulador de mejoras' }) }).first();
      if (await t.count()) { await t.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); }
    },
  },
  {
    file: 'imagen-pag15-es.png', auth: 'qa', mode: 'auto',
    run: async (p, h) => { await h.qaAssessments(); await go(p, '/dashboard'); },
  },
  {
    file: 'dashboard-connected-mobile.png', auth: 'qa', mobile: true, mode: 'auto',
    run: async (p, h) => { await h.qaAssessments(); await go(p, '/dashboard'); },
  },
  { file: 'profile-dark.png', auth: 'qa', mode: 'auto', run: async (p) => { await go(p, '/profile'); } },
  { file: 'settings-dark.png', auth: 'qa', mode: 'auto', run: async (p) => { await go(p, '/settings'); } },
  { file: 'pricing-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/pricing'); } },
  { file: 'budget-review-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/budget-review'); } },
  {
    file: 'budget-review-result-dark.png', auth: 'qa', mode: 'auto',
    // Reutiliza un Budget Review QA existente; si no hay y se permite, crea uno (queda vinculado al usuario QA).
    run: async (p, h) => {
      await go(p, '/dashboard');
      const existing = p.locator('a[href^="/budget-review?review="]').first();
      if (await existing.count()) {
        h.note('Budget Review QA existente');
        await go(p, await existing.getAttribute('href'));
      } else {
        if (NO_SEED) pending('No hay Budget Review QA y --no-seed impide crearlo.');
        await go(p, '/budget-review');
        await p.locator('textarea[name=text]').fill(SYNTHETIC_BUDGET);
        await p.getByRole('button', { name: 'Analizar presupuesto' }).click();
        h.note('Budget Review QA creado con presupuesto sintético');
      }
      const t = p.locator('section', { has: p.getByRole('heading', { name: /Resultado gratuito|Informe completo desbloqueado/ }) }).first();
      await t.waitFor({ timeout: 120000 });
      await p.waitForTimeout(800);
      return { target: t };
    },
  },
  { file: 'profesional-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/profesional'); } },
  { file: 'profesional-solicitar-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/profesional/solicitar'); } },
  {
    file: 'profesional-dashboard-dark.png', auth: 'qa', mode: 'pending',
    reason: 'Requiere una solicitud profesional APROBADA por un administrador para el email QA.',
  },
  { file: 'proveedores-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/proveedores'); } },
  {
    file: 'provider-register-dark.png', auth: 'guest', mode: 'auto',
    // Solo marca categorías (estado visual); nunca envía el formulario.
    run: async (p) => {
      await go(p, '/provider/register');
      for (const cat of ['Aislamiento', 'Fotovoltaica']) {
        const b = p.getByRole('button', { name: cat, exact: true });
        if (await b.count()) await b.first().click();
      }
    },
  },
  {
    file: 'imagen-pag30-es.jpeg', auth: 'qa', mode: 'pending',
    reason: 'Requiere un proveedor VERIFICADO vinculado al email QA (registro + aprobación de un administrador).',
  },
  {
    file: 'imagen-pag31-es.jpeg', auth: 'qa', mode: 'pending',
    reason: 'Requiere un proveedor VERIFICADO vinculado al email QA y leads asignados con consentimiento.',
  },
  {
    file: 'imagen-pag33-es.jpeg', auth: 'qa', mode: 'pending',
    reason: 'Requiere un proveedor vinculado al email QA (registro + aprobación de un administrador).',
  },
  {
    file: 'preferences-dark.png', auth: 'guest', mode: 'auto',
    run: async (p) => {
      await go(p, '/');
      await p.locator('button[aria-label="Preferencias globales"]:visible').first().click();
      await p.getByRole('dialog', { name: 'Ajustes de preferencias globales' }).waitFor();
    },
  },
  {
    file: 'cookies-banner-dark.png', auth: 'guest', consent: false, mode: 'auto',
    run: async (p) => { await go(p, '/'); await p.locator('[role=dialog][aria-labelledby="cookie-consent-title"]').waitFor(); },
  },
  {
    file: 'cookies-settings-dark.png', auth: 'guest', mode: 'auto',
    run: async (p) => {
      await go(p, '/');
      await p.getByRole('button', { name: 'Preferencias de cookies' }).click();
      await p.getByRole('heading', { name: 'Gestionar cookies' }).waitFor();
    },
  },
  { file: 'legal-dark.png', auth: 'guest', mode: 'auto', run: async (p) => { await go(p, '/legal'); } },
];

// Bloque de resultado: primero en un análisis QA; si no aparece, demo modificado sin guardar.
async function qaOrStateless(p, h, sel) {
  const route = await h.findQaAssessmentWith(p, sel);
  if (!route) {
    h.note('análisis sin guardar (demo modificado, sin escritura)');
    await go(p, await h.statelessRoute('target'));
  }
  const t = sel(p);
  await t.waitFor({ timeout: 15000 });
  await t.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  return { target: t };
}

if (LIST) {
  for (const s of SCREENS) console.log(`${s.mode.padEnd(8)} ${s.auth.padEnd(6)} ${s.file}${s.reason ? `  — ${s.reason}` : ''}`);
  process.exit(0);
}

// ─── Playwright ─────────────────────────────────────────────────────────────────
async function loadChromium() {
  const candidates = [];
  const require = createRequire(pathToFileURL(path.join(root, 'package.json')));
  for (const id of ['playwright', 'playwright-core']) {
    try { candidates.push(require.resolve(id)); } catch { /* no instalado en este repo */ }
  }
  if (process.env.MANUAL_PLAYWRIGHT_CORE) {
    const p = path.resolve(process.env.MANUAL_PLAYWRIGHT_CORE);
    candidates.push(/\.(m?js)$/.test(p) ? p : path.join(p, 'index.mjs'));
  }
  candidates.push(path.resolve(root, '..', 'anclora-shiftimport', 'qa', 'e2e-acceptance', 'node_modules', 'playwright-core', 'index.mjs'));
  for (const c of candidates) {
    if (!existsSync(c)) continue;
    try {
      const mod = await import(pathToFileURL(c).href);
      const chromium = mod.chromium || mod.default?.chromium;
      if (chromium) { console.log(`Playwright: ${c}`); return chromium; }
    } catch { /* siguiente candidato */ }
  }
  throw new Error('No se encontró Playwright. Define MANUAL_PLAYWRIGHT_CORE=/ruta/a/playwright-core o ten disponible ../anclora-shiftimport/qa/e2e-acceptance/node_modules/playwright-core.');
}

async function launch(chromium, headless) {
  try {
    return await chromium.launch({ channel: 'chrome', headless, args: CHROME_ARGS });
  } catch (e1) {
    try {
      return await chromium.launch({ headless, args: CHROME_ARGS });
    } catch (e2) {
      throw new Error(`No se pudo abrir Google Chrome ni el Chromium de Playwright. Instala Google Chrome o ejecuta «npx playwright install chromium» en el entorno de Playwright.\n  chrome: ${e1.message.split('\n')[0]}\n  chromium: ${e2.message.split('\n')[0]}`);
    }
  }
}

// initScript: preferencias ES y (salvo el banner) consentimiento de cookies ya guardado.
async function prepareContext(ctx, { theme = 'dark', consent = true } = {}) {
  await ctx.addInitScript(({ theme, consent }) => {
    try {
      localStorage.setItem('enerscan-theme', theme);
      localStorage.setItem('enerscan-language', 'es');
      localStorage.setItem('enerscan-currency', 'EUR');
      localStorage.setItem('enerscan-measurement-system', 'metric');
      if (consent) {
        localStorage.setItem('anclora-cookie-consent-v1', JSON.stringify({ necessary: true, analytics: false, marketing: false, updatedAt: '2026-09-25T00:00:00.000Z', version: 'v1' }));
      } else {
        localStorage.removeItem('anclora-cookie-consent-v1');
      }
    } catch { /* sin almacenamiento */ }
  }, { theme, consent });
  await ctx.addCookies([
    ['enerscan-language', 'es'], ['enerscan-currency', 'EUR'], ['enerscan-measurement-system', 'metric'], ['enerscan-theme', theme],
  ].map(([name, value]) => ({ name, value, url: BASE })));
}

// ─── Sesión QA (sin contraseñas) ────────────────────────────────────────────────
async function readSession(ctx) {
  const res = await ctx.request.get(`${BASE}/api/auth/session`);
  if (!res.ok()) return null;
  return res.json().catch(() => null);
}
function checkQaSession(session) {
  const email = session?.user?.email;
  if (!email) return 'sin sesión';
  if (email !== QA_EMAIL) return `la sesión es de «${email}», no de ${QA_EMAIL}`;
  if (session.user.isAdmin) return 'la cuenta QA figura como administradora (debe ser un usuario normal)';
  return null;
}

async function ensureQaState(chromium) {
  if (existsSync(STATE_PATH)) {
    const b = await launch(chromium, true);
    try {
      const ctx = await b.newContext({ storageState: STATE_PATH });
      const problem = checkQaSession(await readSession(ctx).catch(() => null));
      if (!problem) { console.log(`Sesión QA reutilizada (${QA_EMAIL}).`); return; }
      console.log(`Estado QA guardado no válido (${problem}). Se pedirá un nuevo inicio de sesión.`);
      rmSync(STATE_PATH, { force: true });
    } finally { await b.close(); }
  }
  const headed = await launch(chromium, false);
  try {
    const ctx = await headed.newContext({ viewport: { width: 1280, height: 860 } });
    await prepareContext(ctx);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/auth`, { waitUntil: 'load' });
    console.log(`\nInicia sesión en la ventana con la cuenta QA ${QA_EMAIL} (si no existe, créala con «Crear cuenta» usando ese email)…`);
    console.log('Esperando hasta 10 minutos. No cierres la ventana.\n');
    const deadline = Date.now() + LOGIN_TIMEOUT_MS;
    let session = null;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000));
      session = await readSession(ctx).catch(() => null);
      if (session?.user?.email) break;
    }
    if (!session?.user?.email) throw new Error('Tiempo de espera agotado sin inicio de sesión QA.');
    const problem = checkQaSession(session);
    if (problem) {
      // Cerrar sesión y no guardar nada.
      await page.evaluate(async () => {
        const { csrfToken } = await (await fetch('/api/auth/csrf')).json();
        await fetch('/api/auth/signout', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken }) });
      }).catch(() => {});
      rmSync(STATE_PATH, { force: true });
      throw new Error(`Abortado: ${problem}. Se ha cerrado la sesión y no se ha guardado estado.`);
    }
    mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    await ctx.storageState({ path: STATE_PATH });
    console.log(`Sesión QA verificada (${QA_EMAIL}). Estado guardado en ${path.relative(root, STATE_PATH)}.`);
  } finally { await headed.close(); }
}

// ─── Principal ──────────────────────────────────────────────────────────────────
const selected = SCREENS.filter((s) => !ONLY || ONLY.has(s.file));
if (ONLY) for (const f of ONLY) if (!SCREENS.some((s) => s.file === f)) console.warn(`Aviso: «${f}» no está en la lista de pantallas.`);
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(DEBUG_DIR, { recursive: true });

console.log(`App: ${BASE}${NO_SEED ? ' · sin crear datos (--no-seed)' : ''}`);
const chromium = await loadChromium();
if (selected.some((s) => s.auth === 'qa' && s.mode === 'auto')) await ensureQaState(chromium);

const browser = await launch(chromium, true);
const contexts = new Map();
async function pageFor(s) {
  const key = `${s.auth}:${s.mobile ? 'm' : 'd'}:${s.theme || 'dark'}:${s.consent === false ? 'nc' : 'c'}`;
  if (contexts.has(key)) return contexts.get(key);
  const opts = { ...(s.mobile ? MOBILE : DESKTOP), locale: 'es-ES' };
  if (s.auth === 'qa') opts.storageState = STATE_PATH;
  const ctx = await browser.newContext(opts);
  await prepareContext(ctx, { theme: s.theme || 'dark', consent: s.consent !== false });
  const page = await ctx.newPage();
  contexts.set(key, page);
  return page;
}

// Ayudantes compartidos (memoizados).
let qaAssessmentsCache = null;
const statelessCache = {};
let currentNote = null;
const h = {
  note(text) { currentNote = currentNote ? `${currentNote}; ${text}` : text; },

  // Rutas /assessment/<id> del QA; si no hay ninguna y se permite, crea UNA con el wizard real.
  async qaAssessments() {
    if (qaAssessmentsCache) return qaAssessmentsCache;
    const page = await (await pageFor({ auth: 'qa' })).context().newPage();
    try {
      await go(page, '/dashboard');
      let hrefs = await page.locator('a[href^="/assessment/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
      hrefs = hrefs.filter((x) => x && !x.includes('/local_'));
      if (!hrefs.length && !NO_SEED) {
        console.log('La cuenta QA no tiene análisis: creando uno con el wizard (objetivo letra B, datos manuales)…');
        const created = await seedAssessment(page);
        if (created) hrefs = [created];
      }
      qaAssessmentsCache = hrefs;
      return hrefs;
    } finally { await page.close(); }
  },

  // Recorre los análisis QA (máx. 5) hasta encontrar el bloque buscado.
  async findQaAssessmentWith(page, sel) {
    const list = await h.qaAssessments();
    for (const route of list.slice(0, 5)) {
      await go(page, route);
      if (await sel(page).count()) { h.note(`análisis QA ${route}`); return route; }
    }
    return null;
  },

  // Demo oficial vía /api/assessment/demo, decodificado y (opcionalmente) modificado. Sin escritura en BD.
  async statelessRoute(variant) {
    if (statelessCache[variant]) return statelessCache[variant];
    const page = await pageFor({ auth: 'guest' });
    const res = await page.context().request.get(`${BASE}/api/assessment/demo`, { maxRedirects: 0 });
    const location = res.headers()['location'] || res.url();
    const id = decodeURIComponent(new URL(location, BASE).pathname.split('/').pop() || '');
    if (!id.startsWith('local_')) throw new Error('No se obtuvo el análisis demo sin guardar.');
    const payload = JSON.parse(Buffer.from(id.slice(6), 'base64url').toString('utf8'));
    if (variant !== 'demo') {
      payload.isDemo = false;
      payload.propertyData = { ...payload.propertyData, objective: 'target_letter', targetLetter: 'B', budgetRange: 'medium' };
    }
    statelessCache[variant] = `/assessment/local_${Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')}`;
    return statelessCache[variant];
  },
};

// Crea UN análisis QA con el wizard real (sin catastro ni fotos). Devuelve la ruta o null.
async function seedAssessment(page) {
  try {
    await go(page, '/wizard');
    await page.getByRole('button', { name: /Alcanzar una letra concreta/ }).click();
    await page.getByRole('button', { name: 'B', exact: true }).click();
    await page.getByRole('button', { name: /Continuar con la letra B/ }).click();
    // Paso 2: datos de la vivienda (sin Catastro).
    await page.locator('select[name=propertyType]').waitFor();
    await page.locator('select[name=propertyType]').selectOption('flat');
    await page.locator('input[name=year]').fill('1985');
    await page.locator('input[name=area]').fill('85');
    await page.locator('input[name=zipcode]').fill('07001');
    await page.locator('select[name=orientation]').selectOption('south');
    await page.locator('select[name=roofType]').selectOption('shared');
    await visibleButton(page, /^Siguiente$/).click();
    // Paso 3: envolvente.
    await page.locator('select[name=windows]').selectOption('double');
    await page.locator('select[name=facadeInsulation]').selectOption('none');
    await page.locator('select[name=roofInsulation]').selectOption('unknown');
    await page.locator('select[name=ventilation]').selectOption('natural');
    await visibleButton(page, /^Siguiente$/).click();
    // Paso 4: instalaciones.
    await page.locator('select[name=heating]').selectOption('gas');
    await page.locator('select[name=cooling]').selectOption('split');
    await page.locator('select[name=waterHeating]').selectOption('gas');
    await page.locator('select[name=renewables]').selectOption('none');
    await visibleButton(page, /^Siguiente$/).click();
    // Paso 5: presupuesto y confirmación (sin fotos).
    await page.locator('select[name=budgetRange]').selectOption('medium');
    await page.locator('select[name=timelineHorizon]').selectOption('one_year');
    await page.locator('#acceptTerms').check();
    await page.getByRole('button', { name: 'Obtener resultado' }).click();
    await page.waitForURL(/\/assessment\/[^/]+$/, { timeout: 120000 });
    const route = new URL(page.url()).pathname;
    if (route.includes('/local_')) {
      console.warn('El análisis no se guardó en BD (id local_). Se usará el demo sin guardar como respaldo.');
      return null;
    }
    console.log(`Análisis QA creado: ${route}`);
    return route;
  } catch (error) {
    console.warn(`No se pudo crear el análisis QA: ${error.message.split('\n')[0]}`);
    await page.screenshot({ path: path.join(DEBUG_DIR, 'seed-wizard.png') }).catch(() => {});
    return null;
  }
}

const results = [];
for (const s of selected) {
  currentNote = null;
  if (s.mode === 'pending') {
    results.push({ file: s.file, auth: s.auth, status: 'pending', reason: s.reason });
    console.log(`… ${s.file}: pendiente — ${s.reason}`);
    continue;
  }
  let page = null;
  try {
    if (s.auth !== 'none') page = await pageFor(s);
    const outcome = (await s.run(page, h)) || {};
    if (!outcome.done) {
      const shot = { path: path.join(OUT_DIR, s.file), ...(s.file.endsWith('.jpeg') ? { type: 'jpeg', quality: 90 } : {}) };
      if (outcome.target) await outcome.target.screenshot(shot);
      else await page.screenshot({ ...shot, fullPage: Boolean(outcome.fullPage) });
    }
    results.push({ file: s.file, auth: s.auth, status: 'ok', reason: currentNote || undefined });
    console.log(`✓ ${s.file}${currentNote ? `  (${currentNote})` : ''}`);
  } catch (error) {
    const isPending = error instanceof PendingError;
    const reason = error.message.split('\n')[0];
    if (!isPending && page) await page.screenshot({ path: path.join(DEBUG_DIR, s.file.replace(/\.jpeg$/, '.png')) }).catch(() => {});
    results.push({ file: s.file, auth: s.auth, status: isPending ? 'pending' : 'failed', reason });
    console.error(`${isPending ? '…' : '✗'} ${s.file}: ${reason}`);
  }
}

await browser.close();
mkdirSync(path.dirname(LOG_PATH), { recursive: true });
writeFileSync(LOG_PATH, JSON.stringify({ base: BASE, qa: QA_EMAIL, noSeed: NO_SEED, finishedAt: new Date().toISOString(), results }, null, 2));

// Resumen.
const width = Math.max(10, ...results.map((r) => r.file.length));
console.log(`\n${'Archivo'.padEnd(width)}  Estado    Motivo / fuente`);
console.log(`${'-'.repeat(width)}  --------  ---------------`);
for (const r of results) console.log(`${r.file.padEnd(width)}  ${r.status.padEnd(8)}  ${r.reason || ''}`);
const count = (st) => results.filter((r) => r.status === st).length;
console.log(`\nok: ${count('ok')} · pendientes: ${count('pending')} · fallidas: ${count('failed')}`);
console.log(`Capturas: ${path.relative(root, OUT_DIR)} · Registro: ${path.relative(root, LOG_PATH)} · Depuración: ${path.relative(root, DEBUG_DIR)}`);
if (count('failed')) process.exitCode = 1;
