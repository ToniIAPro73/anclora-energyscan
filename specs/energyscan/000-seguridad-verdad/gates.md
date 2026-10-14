# Matriz de gates F0

**Commit de referencia del análisis:** `4870403dfd8237dfa82b2aecc9bd4270cd766bd0`. ES-0.1 fue validada por Toni y promocionada a `main` (verificación Git: `origin/main` y `origin/development` coinciden en `0065396bb893a838542adbda2e4903c1280c42a0`). La aceptación de fase no convierte las comprobaciones técnicas sin evidencia en PASS; se conservan explícitamente como `NOT_RUN` o como limitaciones.

El agente ejecuta los gates técnicos internos. Toni es el validador inicial del producto y acepta o pide cambios en cada fase. La validación externa no bloquea desarrollo; puede ser requisito antes de exponer públicamente una capacidad o afirmación que dependa de ella.

Las filas de ES-0.2 registran resultados técnicos y límites por SHA; las filas de ES-0.3 y ES-0.4 siguen pendientes. En Preview pasa upload, asociación y persistencia del adjunto, además del borrado completo de la valoración; el borrado individual y la comprobación independiente de cero objetos/filas de adjunto siguen pendientes, así que el gate padre de ES-F0 continúa bloqueado. El estado de fase ES-0.1 registra la aceptación de Toni y la promoción; la evidencia técnica histórica y sus límites se detallan aparte. Ningún `PASS` técnico se hereda de reportes históricos.

| Req → tarea | Comprobación | Fixture/dataset | Método | Criterio de aceptación | Evidencia mínima | Aceptación producto | Estado |
|---|---|---|---|---|---|---|---|
| R01–04 → ES-0.1 | CRUD owner A/B, anon, profesional sin/con grant y revocado; demo/stateless manipulado; rutas de adjuntos | Usuarios, assessments, adjuntos sintéticos; Blob mock | Tests focales e inspección de rutas/storage | 0 accesos cruzados permitidos en N casos; publicar N/población; authz antes de I/O | SHA, casos, resultado redactado, fixture hash | Toni | FASE VALIDADA Y PROMOCIONADA; cobertura exhaustiva de matriz/grants no acreditada en los informes disponibles |
| R02–03 → ES-0.1 | GET/DELETE válido/ausente, Auth error, IDOR, demo, Blob failure, MIME/tamaño/replay/callback | Archivos falsos y storage mock | Tests focales + evidencia Preview enlazada abajo | Denegación antes de I/O no autorizado; éxito válido; fallo sin metadatos engañosos | Aserciones/estados categóricos sin URL, token ni path | Toni | PASS documentado para subida PNG + asociación, persistencia tras recarga, 401 anónimo y borrado; cobertura restante de matriz, replay y callback criptográfico sigue NOT_RUN |
| R05 → ES-0.2 | Data-flow entrada→Blob→OCR/visión→DB→PDF/logs→retención; proveedores | Código, esquema y fixtures sintéticos | Revisión manual + Preview protegido | 100% rutas/proveedores inventariados o brecha registrada; minimización y límites definidos | Mapa con fecha y salida sanitizada | Toni | PASS en inventario, upload Blob y persistencia en Preview, código `10a04fa`; borrado individual/no-servicio y cero filas/objetos requieren evidencia adicional; aceptación de Toni pendiente |
| R05/R11 → ES-0.2 | Redacción de centinelas sintéticos en logs de error | JSON sintético con valores falsos | Test focal | 0 centinelas sensibles en salida; publicar campos/casos evaluados | Fixture hash y salida sanitizada | Toni | PASS técnico en `5edfbd3` (tests de analítica/logger con fixtures sintéticos; auditoría de `console.*`), Vercel Runtime Logs no inspeccionados; aceptación de Toni pendiente |
| R06–07 → ES-0.3 | Assessment/Evidence Matrix/CEE/budget/score/PDF con fuentes, conflictos, vacíos y baja confianza | Assessment sintético | Test focal de evidencia/scoring/report | Campos críticos muestran fuente/estado/ausencia; desconocido no es cero; EnergyScan no se presenta como CEE oficial | Aserciones/snapshot y PDF sintético si aplica | Toni | NOT_RUN |
| R08/R10 → ES-0.3 | Claims de web/PDF/manual/SEO/locales con fuente, territorio y fecha | Matriz de copy sin PII | Inspección y comprobación automatizada disponible | Todas las superficies encontradas cubiertas; sin afirmación residencial E/2033 ni equivalencia prediagnóstico=CEE | Matriz ruta/locale y diff | Toni; revisión externa antes de lanzar claims regulados | NOT_RUN |
| R09 → ES-0.3 | Casos sin precio, unidad incompatible, IVA/exclusiones desconocidos | Casos límite sintéticos | Test focal de budget review | Sin etiqueta universal caro/barato sin referencia comparable; faltantes visibles/abstención | Tabla de casos y salida | Toni | NOT_RUN |
| R11 → ES-0.4 | Requisito→test→comando e inspección de CI | Tests/workflows del SHA actual | Inspección manual | Cada requisito con prueba propuesta o limitación/bloqueo concreto; ningún gate histórico presentado como actual | Matriz versionada y SHA | Toni | NOT_RUN |
| R11 → ES-0.4 | Preparar protocolo del piloto y métricas | Plantilla vacía; sin corpus real | Revisión documental | Variables, denominadores y autorización definidos antes de ejecutar un piloto; el piloto no bloquea desarrollo | Protocolo y fecha | Toni | NOT_RUN |
| Gate padre → ES-F0 | Revisar lote, resultados y riesgos | Fixtures sintéticos | Verificación documental/técnica | PASS si checks críticos pertinentes pasan y riesgo crítico/alto está corregido o contenido; FAIL con fallo reproducible; BLOCKED solo por dependencia técnica/seguridad concreta | SHA, comandos/salidas sanitizadas y decisión | Toni | BLOCKED para validar upload/adjunto real: Blob HTTP 400 en runtime local; automatización PASS en `5edfbd3`; requiere repetir QA de adjunto y aceptación de Toni |

## Evidencia ejecutada para ES-0.1

### Estado de fase y sincronización (2026-10-13)

- Toni validó ES-0.1 y la fase fue promocionada a `main`. `git fetch origin --prune` mostró `origin/main`, `origin/staging`, `origin/production` y `origin/development` en `0065396bb893a838542adbda2e4903c1280c42a0`; el first-parent de `main` incluye los commits de ES-0.1 y sus mejoras posteriores.
- La aceptación de Toni se registra separada de la cobertura automatizada. Las notas históricas que dicen que Toni debía validar o que ES-0.1 no había sido aceptada quedan supersedidas por esta decisión posterior.
- Aún no hay evidencia en los informes versionados de acceso profesional con grant/revocación, replay ni validación criptográfica real del callback. Se mantienen como límites `NOT_RUN`; no se reescriben como resultados PASS.
- Evidencia concreta posterior para Blob/Preview: el [checklist de ejecución versionado en 9eece1a](https://github.com/ToniIAPro73/anclora-energyscan/blob/9eece1aff64882bb90a76418cae4cae98b6d0938/docs/VALIDATION_CHECKLIST.md), sobre código `7eddfd2ca1191a4aa969a6af28486f38d0a51e23`, reporta PASS en PNG sintético de 68 B subido y asociado a valoración, persistencia tras recarga, POST anónimo `/api/blob/upload` HTTP 401 y DELETE del adjunto HTTP 200 / GET posterior 404 / cero adjuntos en DB. El checklist también registra éxito y persistencia visual en desktop y móvil. Esos comportamientos concretos sustituyen el anterior “éxito Blob pendiente”; no acreditan el resto de la fila ni gates de grant, IDOR, replay o callback.
- Mejoras incorporadas durante ES-0.1: mensajes claros para errores de acceso en `/auth` (incluido `OAuthAccountNotLinked`); `scripts/qa/teardown-qa-data.ts` declarado como `QA_TEARDOWN_TOOL` y ejecutado una vez; runbook de QA visual en `docs/qa/visual-qa-runbook.md`.
- Estado de entorno declarado por Toni: Preview de `development` conectado con `AUTH_SECRET`, Neon (misma base de datos que Production por contrato) y Vercel Blob. Esta configuración no se verificó mediante el panel de Vercel en esta actualización documental.
- Diferencia documental: el checklist histórico en 9eece1a sí aporta evidencia de subida real a Blob en Preview; la nota previa que decía que no había evidencia de éxito Blob estaba desactualizada. La evidencia concreta está enlazada y acotada arriba.
- Pendientes declarados: Stripe test no configurado en Preview (solo Production); login Google solo existe en Production; `.anclora/global` enlaza a una ruta VPS inexistente en este checkout; el mensaje del teardown no distingue registro no encontrado de fallo real; el placeholder de `zipcode` puede aparentar un valor y el error `Invalid input` no identifica el campo.

### ES-0.2 — etapa 1 documental

Inventario y comparativas en [`es-0.2-data-flow-inventory.md`](es-0.2-data-flow-inventory.md). Esta etapa fue solo documental; el resultado de implementación se registra aparte. Decisiones firmes de Toni: finalidad única de generar la valoración; assessment, documentos y derivados vencen a los 30 días desde `Assessment.createdAt`, con borrado manual anterior; Neon y Vercel Blob se mantienen; OpenRouter solo admite la allowlist `:free` con `data_collection: deny`; no se incorpora proveedor nuevo. Lectura de PDF con pdf.js/Tesseract.js queda como fase posterior.

### ES-0.2 — implementación (2026-10-13)

Código y pruebas evaluados en `5edfbd36dfcc6b1d083a57de77739de07f85e3c9` (último commit de código; la documentación se añadirá en commit posterior). No se modificaron criterios de aceptación ni se hizo migración.

- Lint `npm run lint` — PASS, sin avisos ESLint.
- Typecheck `npx tsc --noEmit` — PASS.
- Tests `npm test -- --runInBand` — PASS, 76 suites / 491 tests. Incluye corte exacto de 30 días con reloj controlado; cutoff en lectura/borrado/pago; borrado propietario de assessment y relaciones; purga protegida por `CRON_SECRET`; allowlist/modelo `:free`, `data_collection: deny`, fallback al fallar endpoints; EXIF ausente y tamaño reducido; bandera Anthropic apagada; centinelas sintéticos en logger y analítica.
- Build `npm run build` — PASS.
- QA con sesión persistente QA en runtime local: creación de una valoración sin adjunto y borrado desde la interfaz — PASS; `DELETE` HTTP 200, regreso al inicio y detalle sin datos. La valoración de prueba quedó borrada por el flujo que se estaba validando.
- QA histórica con adjunto sintético en localhost: el wizard llegó al upload, `POST /api/blob/upload` devolvió HTTP 400; creación posterior devolvió 503 y la UI informó error sin éxito falso. Este resultado era solo local, donde Blob no está conectado; la repetición correcta en Preview queda registrada en la actualización de QA de abajo.
- Expiración en runtime: no se envejeció un registro real. El caso se simuló con fecha controlada en Jest y la ruta de adjunto deniega antes de leer Blob al llegar al cutoff.
- No se programó la purga. Runtime Logs de Vercel no se consultaron. La bandera Anthropic queda apagada por defecto; no se configuró ninguna clave ni secreto externo durante este trabajo.

QA exigido por contrato: no se requirió migración porque `Assessment.createdAt` ya existe; si la implementación hubiera requerido cambio de esquema, se habría detenido bajo `QA_MINIMUM_FOR_DATABASE_MIGRATION=FULL`. Se usó identidad QA dedicada conforme a `QA_MINIMUM_FOR_AUTH=FULL`; el lote no se promociona y conserva el gate de release/promotion `QA_MINIMUM_FOR_RELEASE_PROMOTION=FULL`. La creación y persistencia de adjunto pasan en Preview; el borrado individual permanece sin evidencia.

Acciones de Toni: revisar inventario y resultados; decidir cómo validar el borrado individual de adjuntos en el nivel de cuenta probado; configurar su propia `OPENROUTER_API_KEY` en Preview si procede; configurar `CRON_SECRET` en Vercel y decidir por separado la programación de la purga.

Resultados comprobados sobre el código del commit de implementación que acompaña esta evidencia (SHA comunicado en la entrega):

- `npx jest --runInBand tests/attachment-access.test.ts tests/blob-upload-authorization.test.ts tests/assessment-upload-association.test.ts` — PASS, 17 casos; solo fixtures sintéticos y mocks. Cubre owner, no propietario, sesión ausente/fallida, valoración/adjunto inexistente, path de draft de otro propietario, denegación antes de Blob, tipos/tamaño máximos del token, fallos de almacenamiento y compensación cuando falla el borrado de BD; callback completado delegado al handler SDK.
- `npx tsc --noEmit` — PASS.
- `git diff --check` — PASS antes del commit de implementación.

### ES-0.2 — purga de borradores huérfanos (código `11505916d59137c98285d71449b20e815d99be23`)

Sin cambios a criterios de aceptación ni migración. Alcance estricto: prefijos EnergyScan `assessment-drafts/` y `assessments/`; `avatars/` y cualquier otra raíz quedan fuera. La lógica valida formas de clave conocidas, pagina por cursor usando `uploadedAt`, compara las rutas de cada página con filas de adjuntos de cualquier valoración, conserva objetos referenciados y huérfanos de hasta 30 días, y limita las eliminaciones a un lote. Simulación CLI por defecto; `--apply` explícito para borrar; errores individuales se cuentan y no detienen el lote. La ruta cron existente mantiene `POST` y autorización Bearer `CRON_SECRET`; no se configuró horario.

| Gate | Comando/medio | Resultado sobre código | Evidencia/limitación |
|---|---|---|---|
| Lint | `npm run lint` | PASS | Sin warnings ni errores ESLint |
| Typecheck | `npx tsc --noEmit` | PASS | Sin errores TypeScript |
| Tests | `npm test -- --runInBand` | PASS; 77 suites / 499 tests | Incluye 7 pruebas nuevas del purgador: cursor/prefijos, referencia, 31/29 días, fallo parcial, lote, simulación y salida sin rutas/IDs |
| Build | `npm run build` | PASS | Dos advertencias existentes de APIs `CompressionStream`/`DecompressionStream` de `jose` para Edge Runtime; build completado |
| Simulación real Blob Preview | `vc env run -e preview --git-branch development` + CLI sin `--apply` | BLOCKED | `BLOB_READ_WRITE_TOKEN` no lo entrega el entorno Preview al CLI. Se comprobó presencia booleana, no su valor. Para evitar fallback inadvertido a credenciales locales se quitó la carga automática local del CLI. No hubo llamada a Blob, no hay matriz de recuentos y no se borraron objetos |
| `git diff --check` | Validación previa al commit documental | PASS | Sin errores de whitespace |

### ES-0.2 — corrección de arranque CLI (código `3067c3e30584c72cf7c675003d2c059f825b48c9`)

La corrección reemplaza los alias `@/` de la cadena CLI/Prisma por imports relativos y quita `tsconfig-paths/register` (sin `baseUrl`) y su dependencia directa. No cambia configuración Next ni comportamiento de la aplicación.

| Gate/comprobación | Comando | Resultado | Evidencia |
|---|---|---|---|
| Lint | `npm run lint` | PASS | Sin avisos ni errores ESLint |
| Typecheck | `npx tsc --noEmit` | PASS | Sin errores TypeScript |
| Tests | `npm test -- --runInBand` | PASS; 78 suites / 501 tests | Incluye arranque CLI con variables ausentes y prueba de inicio de `qa:teardown` con URL sintética |
| Build | `npm run build` | PASS | Dos advertencias existentes de compresión `jose` para Edge Runtime |
| Smoke del CLI sin credenciales | `env -u BLOB_READ_WRITE_TOKEN -u DATABASE_URL npm run blob:purge-assessment-orphans` | PASS de arranque; termina en código 1 intencional | Salida exacta `Required storage configuration is unavailable.`; sin `MODULE_NOT_FOUND` y sin llamadas a proveedores |
| QA teardown | `npm run qa:teardown` desde prueba con URL sintética no enrutable y sin Blob token | PASS de carga; modo sin argumentos falla cerrado | Cargó los módulos compartidos antes del rechazo de argumentos; no consultó la base ni borró datos |
| QA bootstrap | Smoke de módulos compartidos con variables ausentes | PASS de carga | `prisma` y `password` cargaron; no se ejecutó el bootstrap que podría crear/rotar la identidad QA |

La simulación real de Blob sigue pendiente para Toni, quien ejecutará el CLI desde un entorno con el token Preview disponible. No se ejecutó `--apply` ni se promocionó.

### ES-0.2 — diagnóstico seguro del purgador CLI (código `9a53e1a99ae094360db87c5e89164d59d94e1353`)

| Gate/comprobación | Resultado | Evidencia |
|---|---|---|
| Lint | PASS | `npm run lint`, sin warnings ni errores |
| Typecheck | PASS | `npx tsc --noEmit` |
| Tests | PASS; 79 suites / 509 tests | `npm test -- --runInBand`; nuevos dobles por DB_CONNECT/BLOB_LIST/DB_CLASSIFY/DELETE, mapeo de errores y centinelas sin salida |
| Build | PASS | `npm run build`; dos advertencias conocidas de `jose` en Edge Runtime |
| CLI sin secretos | PASS de arranque; exit 1 intencional | Variables de Blob/DB ausentes; salida exacta `Required storage configuration is unavailable.`; no `MODULE_NOT_FOUND` |
| `git diff --check` | PASS antes del commit | Sin errores de whitespace |

La simulación real no se ejecutó en esta tarea. La etapa que falló en la ejecución de Toni anterior aún no es conocida; el próximo intento comunicará únicamente etapa, clase, código propio/corto y estado HTTP, sin el mensaje crudo. No se tocó el almacén y no se ejecutó `--apply`.

El inventario [`es-0.2-data-flow-inventory.md`](es-0.2-data-flow-inventory.md) incluye las formas de clave, clasificación, salidas agregadas y alternativas de programación. No se modificó ni creó configuración en `.anclora/`. La simulación real queda como acción pendiente: Toni debe habilitar una forma segura para que el CLI reciba el token del entorno Preview y revisar sus recuentos antes de decidir si se ejecuta `--apply`. No se programó la purga.

- Visual: `anclora-visual-qa doctor`, `anclora-visual-qa check http://127.0.0.1:3000/wizard`, navegación `agent-browser` hasta el paso de adjuntos, fixture PNG sintético, envío sin sesión y captura del estado de denegación — PASS. Captura local: `/tmp/es01-upload-unauth-final.png`. La sesión local de Auth.js devolvió `500` por `Invalid URL` con el valor redactado; se observó el modo cerrado y la UI pidió iniciar sesión. No se ejercitó una sesión autenticada real ni se conectó a Neon/Blob.
- Sin ejecución: suite Jest completa, build, migraciones, pruebas contra Neon/Blob reales, profesional con grant explícito/revocación, replay y firma criptográfica real del callback, asociación válida completa y rollback ante fallo real de persistencia — `NOT_RUN`.

Las filas de gate ES-0.1 permanecen `NOT_RUN`: la muestra focal pasó, pero no cubre toda la población/criterios allí descritos; en particular, el repo no ofrece un modelo existente de grants explícitos para profesionales. No se atribuye aceptación de producto a Toni.

## Estados

- `PASS`: criterio comprobado sobre el SHA y evidencia reproducible; Toni acepta el resultado de producto. Su aceptación no es dictamen legal/profesional ni validación de mercado.
- `FAIL`: fallo demostrado y reproducible; corregir antes de aceptar la capacidad afectada.
- `BLOCKED`: dependencia concreta que impide construir o comprobar de forma segura. La ausencia de DPO, corpus piloto, especialista o usuarios externos no bloquea desarrollo con fixtures sintéticos.
- `NOT_RUN`: comprobación no ejecutada; no es evidencia favorable ni desfavorable.
- Para QA con DB, seguir `.anclora/PRODUCTION_RUNTIME.md`: verificar destino efectivo sin revelar credenciales y usar identidad QA dedicada persistente. No conectar a DB para esta edición documental.

## Ciclo de aceptación y promoción

1. Implementar el lote en `development`.
2. El agente ejecuta QA proporcional y comparte resumen, limitaciones y evidencia con Toni.
3. Toni acepta o solicita correcciones. Registrar aceptación de producto separada de los resultados automatizados.
4. Tras aceptación y verificación, crear commit y push a `origin/development`.
5. Una promoción posterior requiere autorización de Toni y gates de release; avanzar `development → staging → production → main`, verificando cada transición. No se requiere validación externa de usuarios para commits de desarrollo.

## Seguimiento ES-0.1 — evidencia inicial (2026-10-13)

Evidencia focal ejecutada sobre el árbol de trabajo derivado de `633095a1936db87985de6f7faab60dbd14db78c8` (el SHA final se asentará al cerrar este lote):

- `npm test -- --runInBand tests/attachment-access.test.ts tests/blob-upload-authorization.test.ts tests/assessment-upload-association.test.ts` — PASS, 3 suites / 22 tests. Incluye asociación válida del propietario, fallo de persistencia del assessment y de metadatos con compensación de Blob/DB, denegación del profesional sin grant en lectura y borrado, sesión ausente/fallida, denegación antes de almacenamiento, fallos de borrado en Blob/DB y callback del SDK mock.
- `npm test -- --runInBand` — PASS, 66 suites / 453 tests.
- `npx tsc --noEmit` — PASS.
- `npx eslint src/app/api/assessment/route.ts tests/assessment-upload-association.test.ts tests/attachment-access.test.ts` — PASS.
- `npm run lint` — PASS, sin avisos ESLint.
- `npm run build` — PASS. Next.js informó dos advertencias en `jose` por APIs de compresión no disponibles en Edge Runtime; no impidieron el build.
- `git diff --check` — PASS.
- `anclora-visual-qa doctor` — PASS para disponibilidad y smoke test del navegador. La repetición visual **autenticada** de la aplicación sigue `NOT_RUN`: no había sesión QA activa ni credencial disponible para el agente; se dejó abierta la ventana aislada de `/auth` para que Toni complete el acceso a la identidad QA declarada. La observación no autenticada de `/wizard` no sustituye esta comprobación.

El gate padre de ES-0.1 no se aceptó. La autorización profesional sigue siendo default-deny por propiedad; no se añadió ni asumió modelo de grants en ES-0.1.

## Seguimiento ES-0.1 — actualización tras bootstrap QA (2026-10-13)

Esta actualización sustituye el estado de la comprobación visual autenticada indicado en el seguimiento inicial. La validación se realizó en el árbol de trabajo que se entrega en `development`; no representa aceptación de Toni.

- Bootstrap QA: `npx ts-node --compiler-options '{"module":"commonjs"}' scripts/qa/bootstrap-local-credentials.ts` — PASS. Creó la identidad contractual sintética en Neon y el archivo local ignorado `.env.qa.local` con modo `0600`; no se imprimieron secretos ni se cambió la configuración de Neon.
- Visual autenticada: `agent-browser auth login` y lectura de `/api/auth/session` — sesión QA autenticada. En el paso 5 se adjuntó un PNG sintético de 8×8. El token Blob local fue rechazado por el SDK (`POST /api/blob/upload` 400, `Invalid token parameter`); el fallback devolvió `POST /api/assessment` 503 y la interfaz mostró “No se pudo guardar la valoración con sus adjuntos”. No hubo estado de éxito falso. El log registró compensación de adjuntos sin informar rollback incompleto. Captura temporal: `/tmp/energyscan-es01-upload-failure.png`.
- URLs inválidas del entorno local provocaron `Invalid URL` en el primer intento de login; se corrigieron únicamente como variables del proceso QA (`AUTH_URL` y `NEXT_PUBLIC_APP_URL` a localhost), sin editar `.env.local`.
- Se verificó el estado de error en escritorio. El éxito autenticado con Blob válido, apertura/descarga y borrado real siguen `NOT_RUN` por token Blob inválido. Mobile, acceso real desde otra identidad, replay y callback criptográfico real también siguen `NOT_RUN`.
- Tests focales: `npm test -- --runInBand tests/attachment-access.test.ts tests/blob-upload-authorization.test.ts tests/assessment-upload-association.test.ts` — PASS, 3 suites / 22 tests. Suite completa: `npm test -- --runInBand` — PASS, 66 suites / 453 tests. Typecheck, lint, build y `git diff --check` — PASS; el build conserva dos advertencias de APIs de compresión `jose` en Edge Runtime.

En el momento de ese seguimiento, el gate técnico tenía tests y gates PASS, pero la verificación de la ruta real de éxito estaba `BLOCKED` por el token Blob local inválido. El estado posterior de fase (aceptación de Toni y promoción a `main`) consta arriba. Esa decisión no cambia el resultado histórico ni aporta evidencia técnica nueva para las rutas que siguen sin probar.

## Actualización de QA funcional en Preview — 2026-10-13

Despliegue protegido `dpl_DaKaD7g91bkb3B9LqBxcXCQqkrPn`, `READY`, para el commit de código `10a04fa7dbb6f94877da250942a79b711c1f72d0`. Identidad dedicada `qa-es01`; fixture PNG sintético de 128×96, 423 B. Sin cambio de código ni de criterios de aceptación.

- Login QA y `/api/auth/session`: PASS, HTTP 200 y sesión autenticada.
- Upload: `POST /api/blob/upload` HTTP 200, escritura directa a Blob HTTP 200 y `POST /api/assessment` HTTP 200.
- Persistencia: después de recargar la ruta de valoración, el resultado mostró `Photos submitted: 1` — PASS.
- Borrado completo owner desde interfaz: `DELETE /api/assessment/{id}` HTTP 200; segunda llamada HTTP 404 — PASS.
- GET de ruta de adjunto con ID centinela bajo la valoración borrada: HTTP 404 — no acredita el ID real ni la ausencia de filas/objetos.
- Borrado individual del adjunto: NOT_RUN; la lista/control solo se renderiza en la sección Premium y la respuesta de creación no revela el ID de adjunto. Sin comprobación independiente del conteo de filas ni del objeto privado Blob.
- El 400 anterior ocurrió en localhost, sin conexión Blob; en el Preview indicado no se reprodujo. Por esa condición no se inspeccionaron Runtime Logs de Vercel. No se clasifica como defecto de Preview.
- El dry-run contractual `npm run qa:teardown -- --assessment-id …` se intentó después del borrado funcional y terminó con el mensaje genérico de fallo seguro. No se aplicó ninguna mutación; no se usó SQL ni Prisma para limpieza. La cuenta QA persistente no se eliminó.

El resultado de upload/persistencia y borrado completo queda PASS en Preview, pero el gate padre no cierra hasta aportar evidencia del borrado individual y de ausencia de filas/objetos adjuntos. QA visual de diseño y revisión de logs live: NOT_RUN/NOT_REQUIRED respectivamente; esta ejecución comprueba el flujo funcional solicitado, no revisa diseño visual.


### ES-0.2 — check DB del purgador y preservación de causa (código `9bb3e689a32aac98010d56050b6a5863a687eb22`)

| Gate/comprobación | Resultado | Evidencia |
|---|---|---|
| Lint | PASS | `npm run lint` |
| Typecheck | PASS | `npx tsc --noEmit`; no existe script npm `typecheck` |
| Tests | PASS; 79 suites / 514 tests | `npm test -- --runInBand`; incluye causa Prisma anidada, modo check sin Blob, y etapa PURGE después de connect |
| Build | PASS | `npm run build` |
| DB real de solo lectura | PASS | `vc env run` con proceso hijo sin `BLOB_READ_WRITE_TOKEN`; `$connect()` + `SELECT 1`; salida sanitizada `Database check passed (DB_CONNECT).` |
| Check sin DATABASE_URL | PASS cerrado | Sin DB ni Blob: `Required database configuration is unavailable.` |
| Simulación Blob / borrado real | NOT_RUN | Toni repetirá el dry-run completo; esta tarea no usó Blob ni `--apply` |

La falla histórica de DB_CONNECT no se reprodujo en la sesión actual. Se confirmó y corrigió que errores posteriores al connect podían heredar erróneamente esa etapa; el test con límite inválido valida la corrección. No se atribuye la ejecución anterior a Neon, pooler, SSL, cliente Prisma ni esquema. `SELECT 1` no valida las tablas EnergyScan: una incompatibilidad aparecería como `DB_CLASSIFY` en la siguiente simulación.


### ES-0.2 — reproducción full y preflight DB compartido (código `276fe20d25bdadc9dda02396e2e4d6db676057e7`)

| Gate/comprobación | Resultado | Evidencia |
|---|---|---|
| Lint | PASS | `npm run lint` |
| Typecheck | PASS | `npx tsc --noEmit`; no existe script npm `typecheck` |
| Tests | PASS; 79 suites / 519 tests | `npm test -- --runInBand`; igualdad del preflight check/full, patrones de mensajes y centinelas |
| Build | PASS | `npm run build` |
| `--check-db` con token Blob sintético | PASS | `vc env run`; `$connect()`, `SELECT 1` y probe `AssessmentAttachment.path` |
| Full con token Blob sintético, sin `--apply` | FAIL reproducible, `DB_CONNECT / Error / ERR_DB_PREFLIGHT` | No llegó a Blob. Mensaje original nunca se mostró |
| Check seguido de full en la misma sesión | PASS → FAIL | Check pasa; full falla en DB_CONNECT con el mismo código seguro |
| Blob real / borrado / migración | NOT_RUN | Sin credenciales reales, Blob I/O o mutación DB |

El código ahora comparte la rutina de preflight y añade subetapas; el test confirma mismo orden de lecturas. El probe confirma que existen `AssessmentAttachment` y `path`, por lo que no se observó el desajuste de esquema propuesto. La causa raíz de que full falle en DB_CONNECT mientras check-only pasa sigue sin resolverse; `ERR_DB_PREFLIGHT` es el fallback seguro, no una explicación del fallo. No cambiar/migrar la base. Toni repetirá la simulación completa y enviará solo el diagnóstico permitido.

### ES-0.2 — etapa de fallo y traza segura (código `921214ba26843fc92e14daff08c90ff2c4b622a1`)

| Gate/comprobación | Resultado | Evidencia |
|---|---|---|
| Lint | PASS | `npm run lint` |
| Typecheck | PASS | `npx tsc --noEmit` |
| Tests | PASS; 79 suites / 521 tests | `npm test -- --runInBand`; traza sanitizada y rechazo Blob cubiertos |
| Build | PASS | `npm run build` |
| Full con token Blob sintético | FAIL esperado en `BLOB_LIST / ERR_BLOB_AUTH` | `vc env run`; consultas DB completadas; no se usó `--apply` |
| Traza de fallo | PASS | Handler de listado en `src/lib/orphaned-assessment-blob-purge-runtime.ts:116`; mensajes, absolutos y `node_modules` excluidos |
| Blob real / `--apply` | NOT_RUN | Sin credencial real ni mutaciones |

La etiqueta obsoleta `DB_CONNECT` se debía a la comprobación `instanceof BlobPurgeStageError`: el CLI ejecutado por ts-node no reconocía de forma fiable el error envuelto y el catch exterior reutilizaba la última etapa externa. La guarda estructural conserva el diagnóstico original. El preflight actualiza expresamente `DB_CONNECT` y `DB_QUERY`; el runtime avanza a `BLOB_LIST`, `CLASSIFY` y `DELETE`. La pila filtrada localizó el handler de listado (línea 116). El SDK rechazó el token sintético como acceso denegado, ahora mapeado a `ERR_BLOB_AUTH`. No se modificó la DB ni se usó Blob real.

### ES-0.2 — formas Blob desconocidas e histograma (código `30c44e9fcd24893bc96321fa75c1e6ea643c3d55`)

| Gate/comprobación | Resultado | Evidencia |
|---|---|---|
| Lint | PASS | `npm run lint` |
| Typecheck | PASS | `npx tsc --noEmit` |
| Tests | PASS; 79 suites / 522 tests | `npm test -- --runInBand`; forma desconocida, no borrado y anonimización cubiertos |
| Build | PASS | `npm run build` |
| Forma desconocida bajo prefijo EnergyScan | PASS | Clase `d`, contabilizada por edad y tamaño; nunca se añade a candidatos |
| Forma reconocida antigua del fixture | PASS | Única borrada por el doble bajo `--apply` |
| Ruta fuera del prefijo listado | PASS | Ignorada, sin borrado |
| Blob real / `--apply` | NOT_RUN | Toni revisará antes el dry-run y el histograma |

Los formatos desconocidos ya no abortan la ejecución. La salida muestra histogramas por forma anonimizada, número de segmentos, categoría de segmento, recuento, bytes y franja de edad; no incorpora rutas, IDs, nombres ni extensiones. El conjunto de borrado conserva la regla: solo forma reconocida, huérfana y con más de 30 días. Toni decidirá tras revisar la simulación real si se cambia esa regla en una fase posterior.

### ES-0.2 — purga acotada de forma legada (código `b613ffc623d474aba920baa9baf16ee115eb808d`)

| Gate/comprobación | Resultado | Evidencia |
|---|---|---|
| Lint | PASS | `npm run lint` |
| Typecheck | PASS | `npx tsc --noEmit` |
| Tests | PASS; 79 suites / 526 tests | `npm test -- --runInBand`; referencias, retención, formas inválidas, anonimización y recheck |
| Build | PASS | `npm run build` |
| Legado exacto referenciado | PASS | clase `a-legacy`, sin borrado |
| Legado huérfano >30 días | PASS con dobles | candidato `b`; límite 5 y recheck antes de borrar |
| Legado huérfano de 29 días | PASS | clase `c`, conservado |
| Formas inválidas y prefijo ajeno | PASS | clase `d`/ignorado; sin borrado |
| Blob real / `--apply` | NOT_RUN | Toni hará primero simulación con token real y `--batch-limit 5` |

La forma elegible añadida se limita a `assessment-drafts/{uuid-v4}/{file}` con exactamente tres segmentos, UUID v4, nombre no vacío y sin `..` ni barras. Se vuelve a consultar `findReferencedPaths` con y sin `blob:` inmediatamente antes del borrado. Una referencia aparecida durante la ejecución cancela el borrado, actualiza la matriz a `a-legacy` y suma `skipped_referenced`. El informe incluye referencias/huérfanos legados por edad sin exponer rutas ni nombres. Ninguna otra forma `d` se hace elegible.

### ES-0.2 — purga real en Producción y workflow programado (códigos `413e181`, `823a632`, `0aaffac`)

Ejecuciones reales, 2026-10-13/14, datos ficticios. Autorización de Toni por cada acción.

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Purga CLI de huérfanos Blob | PASS | 8 objetos (14,7 MB) borrados en dos lotes (5 + 3); simulación final: 0 candidatos |
| Workflow `purge-expired-assessments` con `CRON_SECRET` en Repository secrets y variable `ENERGYSCAN_PRODUCTION_URL` | PASS | Autorización correcta; respuesta 401 inicial resuelta tras alinear el secreto en GitHub y Vercel |
| Endpoint en Producción, ejecución 1 (`488f100`) | FAIL parcial | `http_status=503`: 15 borradas, 15 con error por ruta legada `assessment-drafts/{uuid-v4}/{file}` rechazada |
| Endpoint, ejecución 2 (`413e181`) | FAIL parcial | `http_status=503`: 13 borradas, 2 con error; los 59 objetos legados desaparecieron del Blob |
| Endpoint, ejecución 3 (`823a632`) | FAIL parcial, causa identificada | `failureReasons={"unexpected_path:local_path":2}`: rutas de disco de otra máquina (BD compartida con desarrollo local) |
| Endpoint, ejecución 4 (`0aaffac`) | PASS | `http_status=200`, `considered=2 deleted=2 failed=0`, `failureReasons={}`; quedó solo el adjunto actual (1 objeto, 117 KB) |
| Paquete completo antes de cada commit de riesgo | PASS | lint, `tsc`, 527/528/530 tests, build |

Cambios de código: aceptar la forma legada estricta en la validación de rutas; `failureReasons` sin contenido en la respuesta; omitir el borrado de ficheros con ruta local ajena (solo filas de BD, nunca se toca el disco). Pendiente: aceptación de Toni del gate ES-0.2 y borrado individual de adjuntos (Premium).

### ES-0.3.b — corrección de claims landing C-01–C-03

**SHA de código validado:** `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b`. El alcance se limita a la timeline ES/EN/DE, las etiquetas `statsTarget` existentes y un test de regresión; no se cambiaron criterios de aceptación ni otros hallazgos.

| Comprobación | Estado | SHA | Comando o método/evidencia |
|---|---|---|---|
| SRC-01 respalda los años residenciales 2030 y 2035 (Directiva (UE) 2024/1275, art. 9) | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | `rg -n '2030|2035|2024/1275' docs/energyscan-sources.md`; inspección de SRC-01, fecha de consulta 2026-10-12 |
| Regresión: no se afirma obligación residencial clase E/2033 en landing/i18n | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | `npx jest --runInBand tests/landing-regulatory-claims.test.ts` — 1 suite / 1 test |
| Lint | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | `npm run lint` |
| Typecheck | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | `npx tsc --noEmit` |
| Suite completa | PASS — 80 suites / 531 tests | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | `npm test -- --runInBand` |
| Build | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | `npm run build` |
| Visual QA de landing (ES, EN, DE; escritorio 1440×900 y móvil 390×844) | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | Runbook `docs/qa/visual-qa-runbook.md`; `agent-browser` con `qa-es01`; se comprobaron título/copy/estado/estadística y ausencia del claim anterior; capturas sintéticas revisadas en `/tmp` y retiradas según runbook |
| Diferencia de documentación | PASS | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | `git diff --check` después de editar `docs/` y `specs/` |
| Validación de producto por Toni | NOT_RUN | `8c38cf1f2bd37f1c6a075eff54660f6ad297fb3b` | Pendiente de la revisión manual de esta entrega |

Resultado visual: en los tres idiomas se presenta el horizonte `2030–2035`, el título y la descripción solicitados, y el estado de regulación. La estadística muestra `Horizonte europeo` / `European horizon` / `Europäischer Horizont`. La evidencia visual fue sintética; no se creó una valoración ni se incluyeron datos personales. El detalle por idioma y viewport está en `docs/VALIDATION_CHECKLIST.md`.

### ES-0.3 — cobertura de los locales CA, FR, IT y PT en la landing (corrección posterior a `8c38cf1`)

El primer bloque solo cubrió ES, EN y DE. Los cuatro locales restantes del selector usan `i18n-ca/fr/it/pt.ts` (estadística) y, hasta esta corrección, heredaban la línea de tiempo de ES (CA) o EN (FR, IT, PT).

| Comprobación | Resultado | Evidencia |
|---|---|---|
| `statsTarget` en CA, FR, IT, PT | PASS | Antes «Objectiu/Objectif/Obiettivo/Objectivo classe E» junto al valor «2030–2035»; ahora «Horitzó europeu», «Horizon européen», «Orizzonte europeo», «Horizonte europeu» |
| Línea de tiempo propia en CA, FR, IT, PT | PASS | Se indexa por `selectedLanguage`; traducción fiel del texto de ES |
| Test de regresión ampliado | PASS | Cubre los 7 locales y exige una línea de tiempo por locale |
| Lint, `tsc`, suite completa (80 suites / 532 tests), build | PASS | Ejecutados en secuencia |
| QA visual CA/FR/IT/PT | NOT_RUN | Pendiente de la validación manual de Toni |

La traducción de la Directiva a CA/FR/IT/PT es fiel al texto aprobado de ES; la revisión de un especialista se agenda antes de publicar afirmaciones normativas.

### ES-0.3.b-2 — alertas de presupuesto sin umbrales universales (código `d509905172b9ffde3f6eb2893821e239d646ea30`)

Opción A decidida por Toni (C-04, C-05, C-06). Requisito F0-R09.

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Etiquetas alto/bajo/en rango | PASS | `buildAdvancedFindings` y `buildBudgetReviewFindings` devuelven `NO_REFERENCE`; sin umbrales 450 / 25 |
| Alerta de total > 30.000 € | PASS | Eliminada; `alertKey` siempre `budget.alert_general` |
| Etiqueta `NO_REFERENCE` en 7 locales (lógica) y ES/EN/DE (pantalla y PDF) | PASS | Tests de etiqueta; i18n de monetización con fallback para CA/FR/IT/PT |
| Revisiones persistidas con estado antiguo | PASS | `normalizeFindingStatus` las muestra como `NO_REFERENCE` en lógica, pantalla y PDF |
| Lint, `tsc`, suite completa (80 suites / 529 tests), build | PASS | En secuencia |
| QA visual de Budget Review (pantalla, locales, responsive y PDF) | FAIL | Código bajo prueba `d509905172b9ffde3f6eb2893821e239d646ea30` (ancestro de `development` `e8470835fb8579584e2ddd58d119b75ca40e3d4e`). Runtime local con `vc env run -- sh -c 'AUTH_URL=http://localhost:3000 npm run dev'`, sesión QA persistente `qa-es01`. Se crearon A (dos partidas; total 1.220 EUR) y B (una partida; total 35.000 EUR); el análisis real en EN mostró `No comparable reference` y no mostró alerta de total alto. Para recorrer ES/EN/DE en 1440×900 y 390×844 sin crear filas adicionales, se usó `agent-browser network route '**/api/budget-review/analyze' --body <fixture sintético>` tras las dos creaciones reales. Las capturas temporales se revisaron y eliminaron. ES: `Sin referencia comparable`; EN: `No comparable reference`; DE: `Keine vergleichbare Referenz`. En A/B no aparecieron estados alto/bajo/en rango ni texto de presupuesto alto; el color de estado observado fue ámbar. Defecto visual: en `/budget-review`, 390×844, la cabecera/nav se recorta en el borde derecho en ES/EN/DE. La QA adicional se detuvo al encontrarlo. PDFs A/B: `NOT_RUN`; la exportación requiere `paidAt` y no se hizo ninguna compra. CA muestra `Sin referencia comparable`; FR, IT y PT muestran `No comparable reference`; las pantallas cargan sin error. Teardown por IDs: dry-run `budgetReviews: 2`; aplicado solo con recuento exacto y terminó `APPLIED — VERIFIED ZERO`, `budgetReviews: 0`. |
| Mensajes de partida solo en ES en `service.ts` (C-06) | PARCIAL | El texto sigue en castellano; la pantalla usa la etiqueta localizada |

Límite conocido: el resumen guardado de revisiones antiguas conserva el texto «Presupuesto alto» en `summary.alert`.

QA visual (2026-10-15): reemplaza el bloqueo histórico por falta de teardown. El teardown acotado `--budget-review-id` ya existe y se verificó con dos registros sintéticos. La comprobación de pantalla encontró el recorte horizontal de cabecera indicado en la fila; no se modifica código en esta tarea. La descarga de PDFs queda pendiente porque requiere una revisión pagada y la prueba se detuvo al hallar el defecto móvil.

### Revalidación de cabecera móvil y PDF demo (2026-10-14)

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Cabecera móvil | PASS | Código `078075016e83688ab2f734985b1f6945b6ce1716`. `agent-browser` con identidad QA: `/`, `/dashboard` y `/budget-review`, 320/360/390/430×844, los 7 idiomas (84 casos); además ES/EN/DE con y sin sesión a 390×844. `document.documentElement.scrollWidth` coincide con `innerWidth`; ningún elemento de cabecera rebasa el viewport. En sesión anónima `/dashboard` redirige a `/auth`, también sin overflow. En 320 px, el título alemán de Budget Review era el contenido que ampliaba el documento; su tamaño ahora se reduce bajo `sm`. El halo decorativo de la landing se extiende fuera del viewport, pero `.app-shell` lo recorta y el documento no se ensancha. Escritorio 1440×900: sin overflow y tamaño de título 36 px. Capturas temporales revisadas y retiradas. |
| PDF | FAIL | Código `078075016e83688ab2f734985b1f6945b6ce1716`. Método b: descarga de `/api/budget-review/demo/pdf?lang=es|en|de`, que renderiza `BudgetReviewReport`; extracción de texto con `pdftotext`. Sin pagos ni revisiones persistentes. ES y EN: cinco etiquetas localizadas completas y sin estados antiguos de precio. DE: las cinco celdas cortan `Keine vergleichbare Referenz` como `Keine vergleichbare Ref-`; defecto en la columna de estado de `src/lib/pdf/BudgetReviewReport.tsx` (ancho 20%). |
| Lint | PASS | SHA `078075016e83688ab2f734985b1f6945b6ce1716`; `npm run lint` |
| Typecheck | PASS | SHA `078075016e83688ab2f734985b1f6945b6ce1716`; `npx tsc --noEmit` |
| Tests completos | PASS — 80 suites / 534 tests | SHA `078075016e83688ab2f734985b1f6945b6ce1716`; `npm test -- --runInBand` |
| Build | PASS | SHA `078075016e83688ab2f734985b1f6945b6ce1716`; `npm run build` |

### ES-0.3.b-2 — etiqueta alemana en el PDF (código `73477b5bd7a5b79b91321708ec3b29c195c65979`)

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Etiqueta DE «Keine vergleichbare Referenz» truncada en la columna de estado del PDF | CORREGIDO | Etiqueta acortada a «Kein Vergleichswert»; test de longitud por locale (ES/EN/DE) |
| Lint, `tsc`, suite completa (80 suites / 535 tests), build | PASS | En secuencia |
| Verificación visual del PDF DE tras la corrección | NOT_RUN | Pendiente de Toni: `/api/budget-review/demo/pdf?lang=de` |
| Cabecera móvil (corrección del agente, `0780750`) | PASS | 84 casos autenticados y 9 anónimos según el informe del agente |

### ES-0.3 — inventario de superficies restantes (`development@ed40558`)

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Manuales PDF ES/EN/DE | PASS | `pdftotext`: sin «2033» ni obligación de clase E; avisos de no-garantía presentes |
| Copy de pricing, proveedores y profesional; emails ES/EN/DE | PASS | Avisos de no-CEE y no-garantía presentes |
| «Reducción 16 %» (landing) | PASS | SRC-01 |
| «80 % del parque deficiente» (landing) | FAIL | Sin fuente registrada (C-09); decisión de Toni pendiente |
| Textos de score y ahorro; PDF `EnerScanReport` | NOT_RUN | Pendiente: procedencia declarado/documentado/estimado/no disponible (F0-R06) |

### ES-0.3 — estadística de la landing (código `be12a23608ebff509488db5f8f32c0d995344e55`)

Decisión de Toni: buscar fuente (B) y, si no existe, retirar (A). Se encontró una fuente oficial de la UE, no de España.

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Fuente | PASS | Comisión Europea, DG Energy: «75 % de los edificios de la UE tienen un rendimiento energético deficiente» (Eurostat/AEMA 2023); registrada como SRC-11 |
| Cifra española oficial | NO ENCONTRADA | Las cifras de prensa y entidades privadas (81 %, 86,9 %, 94,2 %) difieren entre sí; no se usan |
| Landing en 7 locales | PASS | «75 %» con etiqueta «Edificios de la UE con bajo rendimiento energético» (y equivalentes); sin «%» inicial en la etiqueta |
| Test de regresión, lint, `tsc`, suite (80 suites / 536 tests), build | PASS | En secuencia |
| QA visual de la estadística (etiqueta más larga en la tarjeta) | NOT_RUN | Pendiente de Toni |

### ES-0.3 — procedencia en resultados (`development@97703cc`)

| Comprobación | Resultado | Evidencia |
|---|---|---|
| Matriz de evidencias con fuente, confianza y «no disponible» | PASS (lectura de código) | `src/lib/evidence/evidence-matrix.ts`; usada en `assessment/[id]/page.tsx` y `EnerScanReport.tsx` |
| Valores por defecto a 0 en costes y score | PASS (búsqueda en código) | Sin coincidencias; los datos ausentes se registran como `missingData` y bajan la confianza |
| Etiquetas de la matriz en CA, FR, IT y PT | LÍMITE | Solo ES, EN y DE; los demás idiomas usan el respaldo |
| Comprobación funcional con casos límite (campo ausente, conflicto) | NOT_RUN | Pendiente si Toni lo exige para cerrar ES-0.3 |

### ES-0.3 — casos límite de la matriz de evidencias (código `fa5eefb360f3164a92751d44d1c7a46c07ce8aad`)

Toni pidió comprobar campo ausente y conflicto antes de cerrar ES-0.3. F0-R06.

| Caso | Antes | Ahora | Resultado |
|---|---|---|---|
| Superficie 0, negativa o NaN | Mostrada como dato declarado (0) | `not_available`, confianza desconocida, requiere revisión | CORREGIDO |
| Año 0 o NaN | Mostrado como declarado | `not_available`, requiere revisión | CORREGIDO |
| Código postal vacío | Declarado con valor vacío | `not_available`, requiere revisión | CORREGIDO |
| Calefacción y agua caliente sin valor con CEE adjunto | Atribuidas al CEE con confianza alta | `not_available` | CORREGIDO |
| Año declarado distinto del catastral | El Catastro sustituía sin avisar | Fuente Catastro y requiere revisión | CORREGIDO |
| Superficie declarada distinta del Catastro (>20 m²) | Requiere revisión | Sin cambios | PASS |
| Valor con CEE adjunto | Fuente CEE | Sin cambios | PASS |
| Lint, `tsc`, suite (80 suites / 544 tests), build | PASS | PASS | En secuencia |

### ES-0.4 — baseline reproducible y plan de validación

SHA de partida fijado antes de editar: `719b228415d70a35d3537f237f762bf91165940d` (`development`, árbol limpio y alineado con `origin/development`). Al fijarlo, `origin/staging`, `origin/production` y `origin/main` estaban en `ca9dfdc2a5e0d65a75d80755f4a7ba2328ae1ea1`. Esto fija el objeto revisado; no significa que cada requisito F0 esté completamente demostrado.

| Comprobación | Resultado | SHA base | Comando / método | Evidencia y límite |
|---|---|---|---|---|
| Estado de Git y referencias | PASS | `719b228415d70a35d3537f237f762bf91165940d` | `git status --short`; `git fetch origin --prune`; `git pull --ff-only origin development`; `git rev-parse HEAD`; `git show-ref` | Árbol inicial limpio; desarrollo coincidía con origin; referencias de release en `ca9dfdc`. |
| Matriz F0-R01..R12 y auditoría de casos | PASS | `7348a838f2d2a95785603ab8febe39d37b52f4d4`, actualizada en `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` | Inspección de `spec.md` §5 y archivos/casos de test enlazados en [`es-0.4-baseline.md`](es-0.4-baseline.md) | 12/12 requisitos tienen una comprobación mapeada (11 test de código y R11 documental); 0/12 quedan confirmados a nivel integral; R04 tiene evidencia parcial de payload manipulado. |
| Inventario y hash de fixtures | PASS | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | `rg --files tests scripts/qa`; `shasum -a 256 tests/budget-ingestion.test.ts tests/cee-parser-premium.test.ts tests/evidence-matrix.test.ts` | Los cuatro escenarios existen inline; sin ficheros nuevos ni datos reales. Hashes y nombres de casos en baseline. |
| Mapa de workflows CI | PASS | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | Lectura de `.github/workflows/ci.yml` y `.github/workflows/validate-agent-branch.yml` | Registrados disparadores y pasos. `tsc --noEmit` explícito, QA visual, servicios reales y piloto no están cubiertos por estos workflows. |
| Métricas/denominadores | PASS | `7348a838f2d2a95785603ab8febe39d37b52f4d4`, actualizada en `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` | Recuento manual y tabla reproducible en `es-0.4-baseline.md`; ejecutar comandos allí enlazados | Comprobación mapeada 12/12 (11 tests de código + R11 documental); casos negativos de la matriz acotada 5/12. No representa la superficie completa de auth. |
| Protocolo de piloto | PASS | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | Revisión de `es-0.4-pilot-protocol-template.md` | Plantilla vacía; no ejecutada. El piloto no bloquea la aceptación de desarrollo. |
| Lint | NOT_RUN | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | `npm run lint` | Solo cambios de documentación; política de hitos exige `git diff --check`. |
| Typecheck | NOT_RUN | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | `npx tsc --noEmit` | Solo cambios de documentación; no hubo código, tests ni fixtures nuevos. |
| Tests | NOT_RUN | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | `npm test` | Solo cambios de documentación; los tests citados son inventariados, no ejecutados en esta tarea. |
| Build | NOT_RUN | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | `npm run build` | Solo cambios de documentación; no hubo cambios de aplicación. |
| Diff documental | PASS | `7348a838f2d2a95785603ab8febe39d37b52f4d4` | `git diff --check` | Diff sin errores; vuelve a ejecutarse antes del commit de gates/checklist. |

**Resultado ES-0.4:** baseline documental aceptado por Toni. No se cambian criterios de aceptación de F0, no se inicia piloto ni se promueve como parte de esta actualización.

### ES-0.4 — R04: límites de payload `local_` manipulado

Baseline aceptado por Toni. Se añadieron pruebas de regresión con payloads base64url sintéticos que falsifican `isDemo`, `paidAt`, score y metadatos de adjunto. Decisión de Toni: mantener el flujo local sin firma ni validación server-side. La página y el PDF básico muestran el resultado como estimación local no verificada; esto aclara su naturaleza, pero no hace íntegros los datos del enlace.

| Comprobación | Resultado | SHA | Comando / método | Evidencia y límite |
|---|---|---|---|---|
| Checkout rechaza payload `local_` manipulado | PASS | `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` | `npm test -- --runInBand tests/checkout.test.ts` | HTTP 400; sin consulta a DB ni creación de sesión Stripe pese a los claims falsos. |
| Adjunto privado no accesible desde metadatos falsificados | PASS | `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` | `npm test -- --runInBand tests/attachment-access.test.ts` | HTTP 404; no busca fila ni lee bytes privados. Solo el catálogo estático de IDs demo puede servirse en la rama demo. |
| Flag `isDemo` / `paidAt` falso no concede Premium | PASS | `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` | `npm test -- --runInBand tests/premium-access.test.ts` | La función recibe el estado demo server-side como false y mantiene acceso no pagado, incluso con `ENABLE_DEMO_PREMIUM=true`. |
| Tests focales | PASS — 3 suites / 25 tests | `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` | `npm test -- --runInBand tests/checkout.test.ts tests/attachment-access.test.ts tests/premium-access.test.ts` | Casos nuevos y regresiones existentes. |
| Aviso local en pantalla/PDF y fallback de idiomas | PASS — 11 casos | `463e179da7b32a35ae652626966e1b5b9de0f209` | `npm test -- --runInBand tests/local-assessment-notice.test.tsx` | Verifica aviso visible, fallback de los siete idiomas del selector, PDF ES/EN/DE y ausencia del aviso en valoración guardada. |
| QA visual de resultado local sintético | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` | Runbook `agent-browser`; viewport 1280 y 390; payload anónimo sintético | Nota visible en ES/EN; sin desbordamiento a 390 px. No se usó identidad QA ni se creó fila en DB; capturas temporales eliminadas. |
| Tests focales R04 | PASS — 4 suites / 36 tests | `463e179da7b32a35ae652626966e1b5b9de0f209` | `npm test -- --runInBand tests/local-assessment-notice.test.tsx tests/checkout.test.ts tests/attachment-access.test.ts tests/premium-access.test.ts` | Límites de checkout, Blob privado, premium y señalización de resultados locales. |
| Lint | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` | `npm run lint` | Sin errores ni avisos. |
| Typecheck | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` | `npx tsc --noEmit` | Exit 0. |
| Suite completa | PASS — 81 suites / 558 tests | `463e179da7b32a35ae652626966e1b5b9de0f209` | `npm test -- --runInBand` | Ejecución secuencial. |
| Build | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` | `npm run build` | Exit 0. |
| Integridad de score/propiedad en todas las superficies locales | NOT_RUN | `463e179da7b32a35ae652626966e1b5b9de0f209` | No se ejecutó integración exhaustiva | La decisión conserva `local_` editable sin firma; el aviso no prueba ni proporciona integridad criptográfica. Checkout, acceso privado y Premium siguen denegando los claims falsos según tests focales. |
| Diff documental | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` | `git diff --check` | Sin errores de whitespace tras actualizar el ledger y el checklist. |

**Estado R04:** HIPÓTESIS. La presentación comunica que los datos y score de `local_` son editables y no están verificados. Los tests cierran límites de checkout, Blob privado y premium; no prueban integridad del score/propiedad ni cada consumidor. Sin cambio de criterios ni promoción.
