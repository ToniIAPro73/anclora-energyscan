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
