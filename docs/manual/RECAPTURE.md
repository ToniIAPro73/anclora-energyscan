# Recaptura del manual de usuario — Anclora EnergyScan

Documento operativo generado el 2026-09-25 (CHG-0014). Fuente de verdad: `docs/manual/screenshots.manifest.json`.

## Estado actual

| CURRENT | STALE | PLACEHOLDER | STATIC |
| ---: | ---: | ---: | ---: |
| 0 | 0 | 25 | 0 |

- **CURRENT**: la UI capturada sigue vigente; solo se actualizó el branding.
- **STALE**: la UI cambió después de la captura; pendiente de recaptura real (no se parchea).
- **PLACEHOLDER**: imagen de relleno o ausente; pendiente de captura real.
- **STATIC**: asset de marca del documento; no se captura.

## Reglas QA-safe

- Solo la identidad QA persistente definida en `.anclora/PRODUCTION_RUNTIME.md`; nunca la cuenta personal ni cuentas operativas.
- El ejecutor **no siembra, no crea y no borra datos**: navega y fotografía. Reutiliza los datos QA existentes (`QA_REUSE=true`).
- Las pantallas `assisted` las prepara el operador dentro de la cuenta QA; cualquier acción con escritura se hace solo sobre datos QA.
- Trabajo y commits en `development` (el script se niega a ejecutarse en otra rama).

## Requisitos

1. Dependencias del repo (`npm ci`). El repo no declara Playwright: `npm i --no-save playwright && npx playwright install chromium`.
2. Variables en `.env.local` (no versionado): `MANUAL_QA_PASSWORD`, ninguna adicional. Opcional `MANUAL_APP_URL` (por defecto `http://localhost:3000`).
3. Datos QA necesarios: Vivienda y evaluación sintéticas de la cuenta QA (dirección ficticia o referencia catastral de prueba).

## Identidades QA por rol

| Rol | Identidad | Variables | Acceso |
| --- | --- | --- | --- |
| `qa` | qa.energyscan@anclora.local | `MANUAL_QA_EMAIL` / `MANUAL_QA_PASSWORD` | inicio de sesión manual en el navegador abierto |

## Ejecución (en el Mac)

```bash
# 1. Arrancar la app en una terminal
npm run dev

# 2. En otra terminal, desde la raíz del repo
bash scripts/manual/recapture-manual.sh              # todas las capturas pendientes
bash scripts/manual/recapture-manual.sh --auto-only  # solo las automáticas
bash scripts/manual/recapture-manual.sh --only a.png,b.png
node scripts/manual/recapture-manual.mjs --list      # ver el inventario
```

El script comprueba rama, fichero de entorno y que la app responde; captura en `docs/manual/screenshots/`, deja un registro en `tmp/manual-recapture-log.json` y regenera el documento con:

```bash
npm run manual:pdf
```

Documentos que se regeneran: `public/manuals/anclora-energyscan-manual-usuario-es.pdf`, `public/manuals/anclora-energyscan-user-manual-en.pdf`, `public/manuals/anclora-energyscan-benutzerhandbuch-de.pdf`.

Tras revisar capturas y documento: actualiza `status` a `CURRENT` en el manifiesto para las pantallas recapturadas, registra el cambio en el changelog del manual si existe y haz commit en `development`.

## Pantallas

| Archivo | Estado | Modo | Rol | Ruta inicial | Qué capturar |
| --- | --- | --- | --- | --- | --- |
| `logo.png` | PLACEHOLDER | static | - | — | Ausente (carpeta ignorada por git): copiar public/brand/anclora-energyscan.png (logo Premium) a docs/manual/screenshots/logo.png antes de generar. |
| `hero-dark.png` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Página de inicio en modo oscuro (sección «1. Qué es Anclora EnergyScan») |
| `auth-dark.png` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Pantalla de acceso (sección «3.1 Crear cuenta o iniciar sesión») |
| `hero-light.png` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Página de inicio en modo claro (sección «3.2 Preferencias de idioma, tema, moneda y unidades») |
| `home-dark.png` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Página de inicio completa (sección «4.1 Página de inicio») |
| `imagen-pag9-es.png` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Calculadora de ahorro energético (sección «4.2 Calculadora de ahorro energético») |
| `wizard-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Wizard de prediagnóstico (sección «4.3 Wizard de prediagnóstico») |
| `wizard-target-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Selección de letra objetivo energética (sección «4.3.1 Selección de clasificación energética objetivo») |
| `wizard-map-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Datos de la vivienda con buscador catastral y mapa (sección «4.4 Búsqueda catastral y mapa del inmueble») |
| `assessment-target-viability-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Viabilidad de objetivo de letra (sección «4.5 Resultado gratuito») |
| `assessment-photos-premium-banner-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Banner de fotografías guardadas como evidencia (sección «4.5 Resultado gratuito») |
| `assessment-free-pdf-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Descarga de PDF gratuito (sección «4.5 Resultado gratuito») |
| `imagen-pag15-es.png` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Dashboard conectado en escritorio (sección «5. Mi panel EnergyScan») |
| `dashboard-connected-mobile.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Dashboard conectado en móvil (sección «5.6 Vista móvil») |
| `pricing-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Página de precios (sección «6. Informe Premium y pagos») |
| `budget-review-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Segunda opinión de presupuesto (sección «7. Segunda opinión de presupuesto») |
| `profesional-solicitar-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Formulario de solicitud profesional (sección «8.3 Solicitar acceso beta») |
| `profesional-dashboard-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Panel profesional beta (sección «8.5 Panel profesional») |
| `provider-register-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Registro de proveedor (sección «9.3 Registro de proveedor») |
| `imagen-pag30-es.jpeg` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Panel de proveedor (sección «9.5 Panel de proveedor») |
| `imagen-pag31-es.jpeg` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Leads de proveedor (sección «9.6 Leads asignados») |
| `imagen-pag33-es.jpeg` | PLACEHOLDER | assisted | guest | / | Ausente en el repo — Créditos de proveedor (sección «9.10 Créditos y billing») |
| `cookies-banner-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Panel de cookies (sección «10.1 Banner de cookies») |
| `cookies-settings-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Configuración de cookies (sección «10.2 Configuración detallada») |
| `legal-dark.png` | PLACEHOLDER | assisted | qa | / | Ausente en el repo — Aviso legal (sección «13. Aviso legal») |
