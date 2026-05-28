# Anclora EnergyScan

[![CI](https://github.com/ToniIAPro73/anclora-energyscan/actions/workflows/ci.yml/badge.svg)](https://github.com/ToniIAPro73/anclora-energyscan/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-private-lightgrey)](LICENSE)

**Plataforma de prediagnóstico energético orientativo para viviendas residenciales.**

Anclora EnergyScan permite a usuarios particulares y profesionales introducir datos sobre su inmueble y obtener una estimación de su situación energética, brecha regulatoria aplicable, escenarios de mejora y proveedores cualificados — todo en un informe Premium descargable.

> **Aviso legal:** Este proyecto **no** genera un Certificado de Eficiencia Energética oficial ni documentación con validez administrativa.

---

## Contenidos

- [Características principales](#características-principales)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Monetización](#monetización)
- [Internacionalización](#internacionalización)
- [Partners y proveedores](#partners-y-proveedores)
- [Encaje en el ecosistema Anclora](#encaje-en-el-ecosistema-anclora)
- [Limitaciones legales](#limitaciones-legales)
- [Roadmap](#roadmap)

---

## Características principales

| Módulo | Descripción |
| ------ | ----------- |
| **Wizard de captura** | Flujo guiado con datos estructurales, sistemas e imagen del inmueble |
| **Motor Scoring v2.1** | Reglas trazables por categoría: envolvente, sistemas, renovables, clima, tipología |
| **Informe PDF Premium** | Generado con `@react-pdf/renderer`; multiidioma (ES/EN/DE), con anexo documental |
| **Catastro** | Autocompletado de referencia catastral + mapa de parcelas (MapLibre) |
| **OCR + Vision** | Análisis de adjuntos (CEE, presupuestos) con Tesseract y OpenRouter Vision |
| **Stripe Checkout** | Pago único para desbloquear informe Premium; webhook idempotente |
| **Proveedores** | Registro, panel, leads y créditos para instaladores y partners |
| **i18n** | ES / EN / DE con moneda (EUR / GBP) y unidades (m² / sq ft) |
| **SEO** | Páginas de ciudad, calculadora de ahorro, sitemap y robots |

---

## Stack tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript 5
- **Base de datos:** Prisma ORM + Neon Postgres (producción) · SQLite (desarrollo local)
- **Almacenamiento:** Vercel Blob para adjuntos en producción; fallback local en desarrollo
- **Autenticación:** Auth.js / NextAuth con Prisma Adapter — credenciales propias + OAuth Google/GitHub
- **Estilos:** Tailwind CSS 3
- **Formularios:** React Hook Form + Zod
- **PDF:** @react-pdf/renderer
- **Pagos:** Stripe Checkout
- **Email:** Resend (transaccional)
- **Analítica:** PostHog (opcional)

---

## Arquitectura

```text
Landing / Wizard
      │
      ▼
POST /api/assessment   ← validación Zod + persistencia Prisma
      │
      ▼
Motor Scoring v2.1     ← reglas por categoría, score, confianza, brecha
      │
      ▼
Pantalla de resultados ← clasificación, escenarios, proveedores, paywall
      │
      ▼
Stripe Checkout ──→ Webhook /api/webhook/stripe ──→ paidAt
      │
      ▼
GET /api/pdf/:id       ← genera informe Premium con anexo documental
```

Adjuntos: guardados en Vercel Blob si `BLOB_READ_WRITE_TOKEN` existe; en disco si no.

---

## Instalación local

```bash
# 1. Clonar e instalar
git clone https://github.com/ToniIAPro73/anclora-energyscan.git
cd anclora-energyscan
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 3. Inicializar base de datos
npx prisma migrate dev
npx prisma generate

# 4. (Opcional) Sembrar catálogo de precios
npm run db:seed:prices

# 5. Arrancar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Comandos útiles

```bash
npm run lint          # ESLint
npm test              # Jest
npm run build         # Build de producción
npx prisma studio     # GUI de base de datos

# Webhook Stripe en local
stripe listen --forward-to localhost:3000/api/webhook/stripe

# Recovery de checkouts no completados
curl -X POST http://localhost:3000/api/cron/checkout-recovery \
  -H "Authorization: Bearer $CRON_SECRET"

# Migración SQLite → Neon
SQLITE_DATABASE_URL="file:./dev.db" \
DATABASE_URL="postgresql://..." \
BLOB_READ_WRITE_TOKEN="..." \
npm run migrate:neon
```

---

## Variables de entorno

Crea `.env` a partir de `.env.example`:

```env
# Base de datos
DATABASE_URL="postgresql://USER:PASS@HOST-pooler.REGION.aws.neon.tech/DB?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@HOST.REGION.aws.neon.tech/DB?sslmode=require"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENABLE_DEMO_PREMIUM="true"

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_PREMIUM=""
NEXT_PUBLIC_PREMIUM_PRICE_EUR="9.90"
NEXT_PUBLIC_PREMIUM_STANDARD_PRICE_EUR="14.90"

# Almacenamiento
BLOB_READ_WRITE_TOKEN=""

# Auth
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Opcionales
EUR_GBP_RATE="0.86"
NEXT_PUBLIC_EUR_GBP_RATE="0.86"
PASSWORD_RESET_WEBHOOK_URL=""
RESEND_API_KEY=""
NEXT_PUBLIC_POSTHOG_KEY=""
ENABLE_ANALYTICS_EVENT_LOG=""
CRON_SECRET=""
ADMIN_EMAILS=""
```

### OAuth — Callback URLs

**Local:**

- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

**Producción:**

- Google: `https://<dominio>/api/auth/callback/google`
- GitHub: `https://<dominio>/api/auth/callback/github`

---

## Monetización

### Informe Premium (consumidor)

Flujo Stripe de pago único:

1. `POST /api/checkout` → crea sesión Stripe Checkout
2. Usuario paga → Stripe envía `checkout.session.completed`
3. `POST /api/webhook/stripe` → escribe `Assessment.paidAt` (idempotente)
4. PDF desbloqueado en `GET /api/pdf/:id`

Precio: **9,90 € (lanzamiento)** · precio estándar de referencia: 14,90 €.

### Proveedores y partners

- Registro: `/provider/register`
- Panel + leads: `/provider/dashboard`, `/provider/leads`
- Créditos: `/provider/billing`
- Partner landing con atribución: `/partner/[slug]`
- Profesional B2B beta: `/profesional`, `/profesional/solicitar`

### Otros módulos

- **Budget Review:** `/budget-review` — segunda opinión orientativa de presupuesto
- **Admin Metrics:** `/admin/metrics` — requiere email en `ADMIN_EMAILS`
- **SEO:** `/ciudad/[slug]`, `/calculadora-ahorro`, `sitemap.ts`, `robots.ts`

---

## Internacionalización

Los diccionarios viven en `public/locales/{es,en,de}/common.json`.

Para añadir un idioma:

1. Añadir el código en [src/lib/preferences.ts](src/lib/preferences.ts)
2. Crear `public/locales/{lang}/common.json`
3. Ampliar [src/lib/i18n.ts](src/lib/i18n.ts) y las etiquetas PDF en [src/lib/pdf/EnerScanReport.tsx](src/lib/pdf/EnerScanReport.tsx)
4. Comprobar que el selector de idioma lo muestre

---

## Partners y proveedores

EnergyScan prepara una red de proveedores y partners para conectar diagnósticos orientativos con solicitudes de presupuesto o contacto. El sistema distingue entre partners comerciales, proveedores técnicos y leads trazables. Esta funcionalidad no implica recomendación garantizada ni sustitución de servicios técnicos oficiales.

La demo incluye una vivienda unifamiliar ficticia con documentación de ejemplo, imágenes e informe CEE demo sin validez oficial.

---

## Encaje en el ecosistema Anclora

Anclora EnergyScan es parte de la familia Premium de Anclora Group. Su fuente de verdad documental vive en la Bóveda Anclora, alineada con los contratos `ANCLORA_PREMIUM_APP_CONTRACT`, `ANCLORA_BRANDING_MASTER_CONTRACT`, `LOCALIZATION_CONTRACT`, `UI_MOTION_CONTRACT` y el Anclora Design System.

| Plataforma | Relación |
| ---------- | -------- |
| **Nexus** | Gestión operativa de leads, estados de evaluación y seguimiento |
| **Data Lab** | Inteligencia agregada y señales territoriales/energéticas |
| **Synergi** | Proveedores, partners y handoff de oportunidades cualificadas |
| **Private Estates** | Enriquecimiento energético orientativo de activos inmobiliarios |

EnergyScan no sustituye a Anclora Private Estates como plataforma principal del vertical Real Estate. Funciona como app Premium especializada de prediagnóstico energético orientativo.

---

## Limitaciones legales

- **Orientativo:** Solo emite valoraciones automáticas en base a la información declarada.
- **Sin validez administrativa:** No sustituye al Certificado de Eficiencia Energética oficial regulado por el Real Decreto 390/2021, no emite certificados y no puede registrarse ante administraciones.
- **Contexto normativo:** Las referencias a la Directiva (UE) 2024/1275, PNIEC, ayudas o subvenciones son informativas y pueden variar según transposición y desarrollo normativo.
- **Ayudas:** No se garantiza elegibilidad, disponibilidad ni importes. Cualquier ayuda debe verificarse en fuentes oficiales.

---

## Roadmap

- [x] Motor Scoring v2.1 (envolvente, sistemas, renovables, clima, tipología)
- [x] Generador PDF Premium multiidioma (`@react-pdf/renderer`)
- [x] Tema Luna/Sol/Ordenador — preferencias persistidas
- [x] i18n ES/EN/DE con moneda y unidades
- [x] Adjuntos (PDF, JPG, PNG, WEBP) con OCR y Vision
- [x] Integración catastral con autocompletado y mapa de parcelas
- [x] Stripe Checkout + webhook idempotente
- [x] Red de proveedores — registro, panel, leads y créditos
- [x] Budget Review — segunda opinión de presupuesto
- [x] SEO — páginas de ciudad, calculadora, sitemap
- [x] Hermes Vision Curator — análisis de imágenes con política de coste
- [ ] Panel Admin de Proveedores completo
- [ ] Integración Nexus — sincronización de leads
- [ ] Data Lab — señales energéticas territoriales
## Global Preferences Toggle

Esta app sigue el contrato global de preferencias de Anclora Group.

Incluye:
- idioma
- moneda, porque muestra precios/importes
- unidades, porque muestra superficies/medidas

El Theme Toggle se gestiona por separado y solo aparece en grupos Premium, Internal y Portfolio.
