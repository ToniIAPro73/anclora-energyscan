# Matriz de gates F0

**Commit de referencia del análisis:** `4870403dfd8237dfa82b2aecc9bd4270cd766bd0`. ES-0.1 fue validada por Toni y promocionada a `main` (verificación Git: `origin/main` y `origin/development` coinciden en `0065396bb893a838542adbda2e4903c1280c42a0`). La aceptación de fase no convierte las comprobaciones técnicas sin evidencia en PASS; se conservan explícitamente como `NOT_RUN` o como limitaciones.

El agente ejecuta los gates técnicos internos. Toni es el validador inicial del producto y acepta o pide cambios en cada fase. La validación externa no bloquea desarrollo; puede ser requisito antes de exponer públicamente una capacidad o afirmación que dependa de ella.

Las filas de ES-0.2–ES-0.4 y el gate padre describen comprobaciones pendientes, no resultados actuales. El estado de fase ES-0.1 registra la aceptación de Toni y la promoción; la evidencia técnica histórica y sus límites se detallan abajo. Ningún `PASS` técnico se hereda de reportes históricos.

| Req → tarea | Comprobación | Fixture/dataset | Método | Criterio de aceptación | Evidencia mínima | Aceptación producto | Estado |
|---|---|---|---|---|---|---|---|
| R01–04 → ES-0.1 | CRUD owner A/B, anon, profesional sin/con grant y revocado; demo/stateless manipulado; rutas de adjuntos | Usuarios, assessments, adjuntos sintéticos; Blob mock | Tests focales e inspección de rutas/storage | 0 accesos cruzados permitidos en N casos; publicar N/población; authz antes de I/O | SHA, casos, resultado redactado, fixture hash | Toni | FASE VALIDADA Y PROMOCIONADA; cobertura exhaustiva de matriz/grants no acreditada en los informes disponibles |
| R02–03 → ES-0.1 | GET/DELETE válido/ausente, Auth error, IDOR, demo, Blob failure, MIME/tamaño/replay/callback | Archivos falsos y storage mock | Tests focales + evidencia Preview enlazada abajo | Denegación antes de I/O no autorizado; éxito válido; fallo sin metadatos engañosos | Aserciones/estados categóricos sin URL, token ni path | Toni | PASS documentado para subida PNG + asociación, persistencia tras recarga, 401 anónimo y borrado; cobertura restante de matriz, replay y callback criptográfico sigue NOT_RUN |
| R05 → ES-0.2 | Data-flow entrada→Blob→OCR/visión→DB→PDF/logs→retención; proveedores | Código, esquema y fixtures sintéticos | Revisión manual | 100% rutas/proveedores inventariados o brecha registrada; minimización y límites definidos | Mapa con fecha y salida sanitizada | Toni | NOT_RUN |
| R05/R11 → ES-0.2 | Redacción de centinelas sintéticos en logs de error | JSON sintético con valores falsos | Test focal futuro | 0 centinelas sensibles en salida; publicar campos/casos evaluados | Fixture hash y salida sanitizada | Toni | NOT_RUN |
| R06–07 → ES-0.3 | Assessment/Evidence Matrix/CEE/budget/score/PDF con fuentes, conflictos, vacíos y baja confianza | Assessment sintético | Test focal de evidencia/scoring/report | Campos críticos muestran fuente/estado/ausencia; desconocido no es cero; EnergyScan no se presenta como CEE oficial | Aserciones/snapshot y PDF sintético si aplica | Toni | NOT_RUN |
| R08/R10 → ES-0.3 | Claims de web/PDF/manual/SEO/locales con fuente, territorio y fecha | Matriz de copy sin PII | Inspección y comprobación automatizada disponible | Todas las superficies encontradas cubiertas; sin afirmación residencial E/2033 ni equivalencia prediagnóstico=CEE | Matriz ruta/locale y diff | Toni; revisión externa antes de lanzar claims regulados | NOT_RUN |
| R09 → ES-0.3 | Casos sin precio, unidad incompatible, IVA/exclusiones desconocidos | Casos límite sintéticos | Test focal de budget review | Sin etiqueta universal caro/barato sin referencia comparable; faltantes visibles/abstención | Tabla de casos y salida | Toni | NOT_RUN |
| R11 → ES-0.4 | Requisito→test→comando e inspección de CI | Tests/workflows del SHA actual | Inspección manual | Cada requisito con prueba propuesta o limitación/bloqueo concreto; ningún gate histórico presentado como actual | Matriz versionada y SHA | Toni | NOT_RUN |
| R11 → ES-0.4 | Preparar protocolo del piloto y métricas | Plantilla vacía; sin corpus real | Revisión documental | Variables, denominadores y autorización definidos antes de ejecutar un piloto; el piloto no bloquea desarrollo | Protocolo y fecha | Toni | NOT_RUN |
| Gate padre → ES-F0 | Revisar lote, resultados y riesgos | Fixtures sintéticos | Verificación documental/técnica | PASS si checks críticos pertinentes pasan y riesgo crítico/alto está corregido o contenido; FAIL con fallo reproducible; BLOCKED solo por dependencia técnica/seguridad concreta | SHA, comandos/salidas sanitizadas y decisión | Toni | NOT_RUN |

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

Inventario estático registrado en [`es-0.2-data-flow-inventory.md`](es-0.2-data-flow-inventory.md), con flujo de código, proveedores, comparativas, brecha de expiración, evidencia ES-0.1 y propuesta no seleccionada para lectura de PDF/presupuestos. La etapa no implementa minimización ni redacción; el gate R05 y el gate de centinelas permanecen `NOT_RUN` hasta completar el alcance y sus evidencias. Las decisiones firmes de Toni son finalidad única de generar valoración, retención 30 días con borrado manual anterior y regla de proveedores (solo OSS o coste cero; proveedor nuevo requiere aprobación y comparativa). Motor OCR y almacenamiento siguen sin seleccionar.

Plan breve para su ejecución, sin ampliar criterios:

1. Inventariar flujo y consumidores desde recepción hasta retención/borrado, incluidos errores y logs.
2. Identificar proveedores, regiones, categorías de datos, finalidad, acceso y retención; marcar explícitamente cualquier tramo no verificable.
3. Aplicar las decisiones confirmadas de finalidad y retención; obtener decisión de Toni sobre OCR, almacenamiento y modalidad de lectura antes de implementar o activar tratamiento nuevo.
4. Crear centinelas y fixtures sintéticos; añadir pruebas focales de redacción y ausencia de centinelas en logs.
5. Implementar minimización/redacción acordada y documentar resultados, SHA y limitaciones.

Riesgos y dependencias: el runtime es `PRODUCTION_BACKED` y no se crearán bases de datos alternativas; no usar documentos reales ni enviar documentos a proveedores en pruebas. Una migración, si se demuestra necesaria, tiene mínimo `QA_MINIMUM_FOR_DATABASE_MIGRATION=FULL`; un cambio de autenticación tiene mínimo `QA_MINIMUM_FOR_AUTH=FULL`; cualquier promoción tiene mínimo `QA_MINIMUM_FOR_RELEASE_PROMOTION=FULL`. Sin migración, auth ni UI, aplicar QA proporcional: revisión del flujo, pruebas focales con centinelas sintéticos y `git diff --check`; QA visual queda fuera si no cambia UI.

Decisiones de Toni: finalidad y retención confirmadas; quedan pendientes elección de OCR y almacenamiento, alcance de la lectura de PDF, y alcance técnico de borrado de derivados. Toda propuesta de proveedor debe compararse y recibir aprobación expresa previa; esta etapa no autoriza servicio nuevo.

Resultados comprobados sobre el código del commit de implementación que acompaña esta evidencia (SHA comunicado en la entrega):

- `npx jest --runInBand tests/attachment-access.test.ts tests/blob-upload-authorization.test.ts tests/assessment-upload-association.test.ts` — PASS, 17 casos; solo fixtures sintéticos y mocks. Cubre owner, no propietario, sesión ausente/fallida, valoración/adjunto inexistente, path de draft de otro propietario, denegación antes de Blob, tipos/tamaño máximos del token, fallos de almacenamiento y compensación cuando falla el borrado de BD; callback completado delegado al handler SDK.
- `npx tsc --noEmit` — PASS.
- `git diff --check` — PASS antes del commit de implementación.
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
