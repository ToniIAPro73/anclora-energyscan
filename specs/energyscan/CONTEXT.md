# Contexto de trabajo EnergyScan — estado a 2026-10-14

**Propósito:** que cualquier agente o persona retome el trabajo sin releer el historial. No contiene secretos ni valores de credenciales.
**Última promoción:** `development`, `staging`, `production` y `main` se sincronizaron en `205e84c83180b6b822a19e78063deae78d330a32`. ES-1.1 (código verificado en `13a19448a3ca754bab85d4e924c543651a56c08b`) fue validada por Toni y promovida; ES-1.2 tiene SDD propuesta pendiente de decisiones y no tiene implementación.

## 1. Cómo se trabaja (flujo v1)

1. Trabajar directamente en `development`. No crear ramas por fase.
2. Verificación **por hitos**: pruebas focalizadas durante el trabajo; el paquete completo (`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, en secuencia, nunca en paralelo) una vez al final. Cambios de riesgo (auth, base de datos, borrado de datos, dependencias): paquete completo antes de cada commit. Solo documentación: `git diff --check`.
3. Commit y `git push origin development`. **Detenerse.**
4. Toni valida con `docs/VALIDATION_CHECKLIST.md` (se sobrescribe en cada entrega).
5. Solo tras la orden `PROMOTE=FULL` de Toni se promociona, un salto cada vez: `staging` → `production` → `main`, con el workflow `.github/workflows/promote.yml` (fast-forward, comprueba el estado del origen).
6. Nunca: force push, leer o imprimir `.env*`, imprimir secretos, pegar valores de credenciales en el chat, `rm -f`, despliegue directo, borrar la identidad QA.
7. La QA visual sigue `docs/qa/visual-qa-runbook.md`. El teardown de datos QA es `npm run qa:teardown` (modos: valoración, solo adjuntos, identidad, y `--budget-review-id`); dry-run primero.
8. Contrato del repositorio: `.anclora/PRODUCTION_RUNTIME.md` (clave `ANCLORA_FLOW_VERSION=1`, claves `QA_*`). Los datos de las aplicaciones son ficticios; Preview y desarrollo usan la base de producción por contrato.

## 2. Entorno y operaciones

| Elemento | Estado |
| --- | --- |
| Hosting | Vercel (proyecto `anclora-energyscan`); dominio principal `energyscan.anclora.com`; alias `anclora-energyscan.vercel.app` |
| Base de datos y Blob | Neon (Postgres) y Vercel Blob privado (`anclora-content-generator-a-blob`, compartido con otro proyecto) conectados a Production y Preview |
| Auth | Auth.js. Google y Stripe solo están configurados en Production. Preview está protegido por SSO de Vercel; el modo fiable de prueba es local con `vc env run` y `AUTH_URL=http://localhost:3000` |
| Purga programada | `.github/workflows/purge-expired-assessments.yml`, diaria 03:17 UTC, más ejecución manual. Llama a `POST /api/cron/purge-expired-assessments` con `Authorization: Bearer`. Requiere **Repository secret** `CRON_SECRET` (igual que en Vercel Production) y **Repository variable** `ENERGYSCAN_PRODUCTION_URL` (`https://energyscan.anclora.com`). Última ejecución verificada: 200, 2 de 2 borradas, 0 fallos |
| Retención | 30 días desde `Assessment.createdAt`; borrado por el propietario; purga de huérfanos de Blob (`npm run blob:purge-assessment-orphans`, simulación por defecto, `--apply --batch-limit N`) |
| Token de Blob para CLI | Nunca en archivos ni en pantalla: `read -s LINE` con el snippet de Vercel, `eval "export $LINE"; unset LINE`, ejecutar con `vc env run -- …`, luego `unset BLOB_READ_WRITE_TOKEN; pbcopy < /dev/null` |
| QA | Identidad persistente `qa-es01` (contrato); perfil `agent-browser` local |

## 3. Lo realizado

### Infraestructura y gobierno
1. Hooks de agente verificados en Codex, Claude Code y pre-push de Git; contratos de flujo adoptados en EnergyScan; reorganización de documentación del workspace.
2. Promoción gobernada de ES-0.1–ES-0.4 hasta `main` en `73b83dce7c528375a2a51a3aa615480c8b0b7e70`.
3. Entorno Preview configurado (secreto de Auth, Neon y Blob).
4. Runbook de QA visual, herramienta de teardown de datos QA y política de verificación por hitos.
5. Alerta de secret scanning de Stripe (secreto temporal de `stripe listen`, modo test) cerrada como «Used in tests»; el documento ya estaba redactado.

### ES-0.1 — Autorización de adjuntos y upload (ACEPTADA)
Acceso por actor, recurso y acción; subida anónima bloqueada; errores de inicio de sesión explícitos (`OAuthAccountNotLinked`).

### ES-0.2 — Privacidad e ingesta (ACEPTADA)
Retención de 30 días, borrado por el propietario, endpoint de purga con `CRON_SECRET`, logs sin datos personales, política de IA solo con modelos gratuitos, purga de huérfanos de Blob (8 objetos, 14,7 MB). Correcciones surgidas en producción: rutas legadas `assessment-drafts/{uuid-v4}/{file}`, `failureReasons` sin contenido en la respuesta del endpoint y omisión del borrado de ficheros con ruta local de otra máquina (la base de datos se comparte con el desarrollo local).

### ES-0.3 — Claims, CEE y estimación (CERRADA en lo técnico; aceptación de Toni registrada)
1. Landing: eliminada la afirmación de «clase E obligatoria en 2033» en los 7 idiomas; ahora «Metas europeas de consumo medio 2030–2035».
2. Estadística «80 % del parque deficiente» (sin fuente) sustituida por «75 % de los edificios de la UE con bajo rendimiento energético» (Comisión Europea, SRC-11).
3. Alertas de presupuesto: eliminados los umbrales universales (450 €, 25 €, 30.000 €); toda partida muestra «Sin referencia comparable» (`NO_REFERENCE`); las revisiones antiguas se muestran igual.
4. Cabecera móvil sin recorte; etiqueta alemana del PDF acortada.
5. Matriz de evidencias: un valor ausente ya no se muestra como dato (superficie, año y código postal), no se atribuye al CEE un campo vacío y un conflicto con el Catastro exige revisión.

### Spec nueva
`specs/energyscan/010-referencias-precios/spec.md` (ES-1.2.R): conjunto de precios anónimo a partir de presupuestos con consentimiento. Decisiones de Toni: N ≥ 30 observaciones, M ≥ 10 presupuestos distintos, territorio por provincia, revisión legal antes de activar; sin contrapartida en la primera versión.

## 4. Dónde se dejó

1. **ES-0.3:** cerrada y promocionada.
2. **ES-0.4 (Baseline y plan de validación, P1):** baseline técnico aceptado por Toni, ligado al SHA de partida `719b228415d70a35d3537f237f762bf91165940d`; la fase quedó aceptada y promovida. Tests focales de límites para `local_` manipulado añadidos en `d428c6d`; por decisión de Toni, el flujo local se mantiene sin firma ni validación server-side. En `463e179` se añadió el aviso «estimación local no verificada» a la página y al PDF básico, con pruebas y QA visual sintético; Toni aprobó la promoción en `73b83dce`. R04 mantiene la limitación técnica de que el score/datos del enlace continúan editables. El protocolo de piloto está vacío y es opcional; no se ejecutó piloto.
3. **ES-1.1:** validada por Toni y promovida; SDD y evidencia en [`sdd/features/energyscan-budget-extraction-localization/`](../../sdd/features/energyscan-budget-extraction-localization/). La prueba sintética cubre cinco partidas, seis campos y 27 valores aplicables; no mide exactitud sobre documentos reales.
4. **ES-1.2:** implementación en `development` (`7111ef151af875a3e85c9fb2820c38440e7edb84`), aceptación de Toni pendiente. Compara dos textos mediante `/api/budget-review/compare`; procesamiento transitorio, sin persistencia/telemetría, y sin valoración de precio. Alcance e IVA siguen desconocidos. Evidencia de ejecución en [`docs/VALIDATION_CHECKLIST.md`](../../docs/VALIDATION_CHECKLIST.md).
5. **ES-1.2.R:** spec redactada, sin implementación. Falta el catálogo cerrado de categorías.
6. Evidencia por SHA de F0: `specs/energyscan/000-seguridad-verdad/gates.md`. Estado de hallazgos: `es-0.3-claims-inventory.md`.

## 5. Próximos pasos (en orden)

1. **ES-1.2:** Toni revisa y acepta la implementación en `development`; no promover hasta aceptación explícita y `PROMOTE=FULL`.
2. Decidir el catálogo de categorías de ES-1.2.R y planificar su implementación dentro de F1.
3. Mantener visibles en `gates.md` las limitaciones residuales de F0; no se reabren ni se declaran resueltas por ES-1.1.
4. Después de ES-1.2, refinar ES-1.3 (revisión corregible).

## 6. Puntos pendientes de resolver

### EnergyScan — producto y técnica
1. Borrado **individual** de adjuntos (función Premium): sin verificar en ES-0.2.
2. Mensaje por partida de `src/lib/budget-review/service.ts` solo en castellano; el resumen guardado de revisiones antiguas conserva «Presupuesto alto» en `summary.alert`.
3. Cobertura de idiomas: etiquetas de la matriz de evidencias y emails solo en ES, EN y DE; CA, FR, IT y PT usan el respaldo.
4. Traducción alemana de `partnersCopy` en `src/lib/i18n.ts` con la palabra española «puede» (hallazgo C-08, sin corregir).
5. Verificación visual de la tarjeta «75 %» (etiqueta más larga) en móvil.
6. Mensaje del teardown genérico: no distingue «no encontrado» de «no es de la identidad QA».
7. UX del marcador del código postal en el formulario («Invalid input» observado en QA).
8. Pagos: configuración de Stripe en modo test para Preview, y el endpoint del webhook (nombre con errata en el Dashboard: «anclora-eneryscan»).
9. Perfil local `agent-browser` de `qa-es01`: decidir si se conserva.
10. Lectura de PDF/OCR en el navegador (pdf.js y Tesseract.js): idea futura, con la decisión de conservar el PDF o solo los campos aceptados (recomendado: solo los campos aceptados).

### Seguridad y credenciales
1. `CRON_SECRET`: un valor se pegó en el chat durante esta sesión y se pidió regenerarlo; confirmar que el vigente en GitHub y Vercel es el regenerado.
2. Clave de OpenRouter dedicada a EnergyScan (límite 0, sin créditos, lista de modelos `:free`, `provider.data_collection: "deny"`); hoy se comparte con el agente Hermes. Comprobar Settings → Privacy sobre entrenamiento con endpoints gratuitos.
3. Conexión de desarrollo del almacén Blob con el proyecto `anclora-content-generator-ai`: verificar que se retiró.

### Spec de precios (ES-1.2.R)
1. Revisión legal del texto de consentimiento y del uso comercial antes de activar la captura.
2. Catálogo de categorías de la primera versión.

### Ecosistema Anclora
1. Aplicar los parches de contrato al resto de repositorios: GuestHub primero (con la retirada de Memanto), después ShiftImport, FileStudio y SecureFlow; luego CleanSheet y PurgeDoc; luego los 3 repositorios de Cloudflare. Después, scripts de arranque de QA en cada uno.
2. Mods de flujo (`anclora-mods`): comando `/anclora-close`, banner, afinado de la guarda para `rm -f`, clave de contrato `QA_VISUAL_RUNBOOK` inyectada al inicio.
3. `.anclora/global`: enlace simbólico roto (el VPS está inactivo) y archivos de contexto de ecosistema ausentes; algunos agentes se detienen al no encontrarlos.
4. Hermes: bloque en `~/.hermes/config.yaml` si se usa.
5. Agy (Google Antigravity CLI): adaptador de `anclora-mods` implementado y verificado (guarda, puertas e inyección de contexto; `/hooks` lo muestra activo; bloqueó un `git push --force` real). Los commits (`e61abf3`, `c0add4b`, `80cd9a9`, `b620ce3`) están **solo en local**; decidir si se publican. Límites: Agy no tiene evento de prompt, así que no recibe `PROMOTE=FULL` y las promociones se hacen desde Claude Code, Codex o GitHub Actions; la guarda solo actúa en repositorios adoptados (`ANCLORA_FLOW_VERSION=1`) y bajo el matcher configurado. El hook de Agy apunta a una ruta absoluta del equipo de Toni; si `anclora-mods` se mueve, hay que reinstalar. Comprobar que el hook de telemetría ajeno (`dak-telemetry`, matcher `*`) no envía comandos ni secretos fuera del equipo.
6. `CLAUDE.md` exige registrar el cierre en Memanto (`memanto remember … --type event` y `memanto memory sync`); no ejecutado en esta sesión remota. Hacerlo desde un entorno con la CLI.

## 7. Referencias rápidas

| Qué | Dónde |
| --- | --- |
| Índice y estado de specs | `specs/energyscan/README.md` (este documento: `specs/energyscan/CONTEXT.md`) |
| F0: spec, plan, tareas, gates, inventarios | `specs/energyscan/000-seguridad-verdad/` |
| Referencias de precios | `specs/energyscan/010-referencias-precios/spec.md` |
| Roadmap y fuentes | `docs/energyscan-roadmap.md`, `docs/energyscan-sources.md` |
| QA visual y teardown | `docs/qa/visual-qa-runbook.md`, `scripts/qa/teardown-qa-data.ts` |
| Promoción y purga | `.github/workflows/promote.yml`, `.github/workflows/purge-expired-assessments.yml` |
| Contrato de runtime | `.anclora/PRODUCTION_RUNTIME.md` |
