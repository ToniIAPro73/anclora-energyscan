# F0 — Tareas de desarrollo

**Estado:** ES-0.1, ES-0.2 y ES-0.3 están cerradas y promocionadas; las ramas de release observadas están en `ca9dfdc`. ES-0.4 —baseline y plan de validación— queda documentada técnicamente en `es-0.4-baseline.md`; revisión de Toni pendiente. Toni valida inicialmente producto y alcance junto con el agente. El piloto no es prerrequisito de implementación ni aceptación funcional. Toda prueba que no se haya ejecutado para el SHA indicado queda `NOT_RUN`.

## ES-0.1 — Autorización de adjuntos y upload (P0)

**Estado de fase:** VALIDADA POR TONI Y PROMOCIONADA A `main`. Los límites de cobertura técnica aún no documentados se conservan como pendientes de evidencia en `gates.md`; no alteran esta decisión de fase.

**Objetivo:** restringir cada operación por actor, recurso y acción; cerrar IDOR/BOLA.
**Rutas confirmadas:** `src/app/api/assessment/[id]/attachments/[attachmentId]/route.ts`, `src/app/api/blob/upload/route.ts`, `src/lib/stateless-assessment.ts`, `src/lib/blob-storage.ts`. Confirmar consumidores antes de cambiar interfaces.
**Decisión inicial:** owner autorizado; profesional requiere grant explícito; upload anónimo denegado; `local_` no es identidad ni ACL.

| Subtarea | Ejecución | Salida | Estimación orientativa |
|---|---|---|---:|
| 0.1.a Inventariar handlers, consumidores, storage URL/token y demo | Agente | Matriz ruta×actor×recurso×acción | 0,5–1 d |
| 0.1.b Fijar política draft/stateless/anon y entitlement | Toni + agente; aplicar default deny para upload anónimo | Decisión breve documentada | 0,5–1 d |
| 0.1.c Diseñar autorización server-side, respuestas no enumerables y borrado coherente | Agente | Secuencia y casos de prueba negativos | 1–2 d |
| 0.1.d Implementar guardas y tests focales con mocks | Agente; Toni acepta producto | Rutas GET/DELETE/upload protegidas y evidencia | 1–3 d |

**Aceptar:** en los casos ejecutados, 0 accesos cruzados; autenticación/autorización antes de I/O; fallos de Blob/DB no aparentan éxito; el token no concede alcance fuera de su recurso. **Rechazar:** acceso solo por ID/URL, sesión fallida permitida, `local_` usado para entitlement o borrado incoherente. Registrar N y población de casos, SHA y resultado. Un riesgo crítico/alto no corregido debe mantener la ruta afectada deshabilitada o denegada.

## ES-0.2 — Privacidad, ingesta y retención (P0)

**Objetivo:** entender y limitar flujo de documentos y datos. **Reuso:** `src/lib/document-parsing/`, `ocr/`, `vision/`, `ingestion/`, Blob, `AssessmentAttachment.ocrData`, `AttachmentAnalysis.detectedJson`.

**Etapa 1 documental (2026-10-13):** inventario y comparativas en [`es-0.2-data-flow-inventory.md`](es-0.2-data-flow-inventory.md). Decisiones firmes: finalidad exclusiva de generar la valoración; assessment, documentos y derivados vencen desde `Assessment.createdAt + 30 días` con borrado manual anterior; se mantienen Neon y Blob; OpenRouter solo `:free` con allowlist y `data_collection: deny`; no se incorporan proveedores. Lectura PDF/presupuestos con pdf.js/Tesseract.js queda para fase posterior. El resultado de implementación y QA se registra por SHA en `gates.md`; no se alteran criterios de aceptación.

| Subtarea | Ejecución | Salida | Estimación orientativa |
|---|---|---|---:|
| 0.2.a Trazar entrada→Blob→parser/OCR/visión→DB→PDF/logs→retención/borrado | Agente | Diagrama y proveedores identificados | 1–2 d |
| 0.2.b Definir controles de minimización, logs y tratamiento para desarrollo | Agente + Toni | Reglas y pendientes que afectan solo a uso público | 1–2 d |
| 0.2.c Implementar redacción/minimización comprobable | Agente | Diff focal y pruebas con centinelas sintéticos | 1–3 d |

**Aceptar:** rutas y proveedores hallados inventariados o brechas registradas; fixtures/evidencia sin PII; centinelas sintéticos no aparecen en logs. No usar documentos reales ni transmitirlos a servicios externos durante pruebas locales. Cualquier activación de tratamiento que requiera autorización o revisión especializada se mantiene apagada hasta cerrar ese gate de publicación; no bloquea la implementación interna.

**Ejecución ES-0.2 (2026-10-13, SHA `5edfbd36dfcc6b1d083a57de77739de07f85e3c9`):** lógica de expiración, borrado owner, purga protegida, minimización de logs y política de visión implementadas sin migración. Gates lint/typecheck/tests/build: PASS; QA de borrado sin adjunto: PASS; prueba de upload con adjunto: BLOCKED por HTTP 400 en `/api/blob/upload` durante runtime local. Estado detallado y límites en [`gates.md`](gates.md). La aceptación de Toni sigue pendiente. Esta nota registra resultados y no modifica el criterio de aceptación.

**Cierre técnico de borradores huérfanos (código `11505916d59137c98285d71449b20e815d99be23`):** purga estricta de `assessment-drafts/` y `assessments/` integrada al endpoint existente y al CLI; simulación por defecto y borrado solo con `--apply`. Gates lint/typecheck/tests/build: PASS (77 suites/499 tests). Simulación del almacén Preview: BLOCKED porque Vercel CLI no entrega `BLOB_READ_WRITE_TOKEN`; no se consultó ningún almacén ni se borró objeto real. Revisar la evidencia y los límites en [`gates.md`](gates.md) y el inventario. Criterios de aceptación intactos.

**Corrección de arranque CLI (código `3067c3e30584c72cf7c675003d2c059f825b48c9`):** imports relativos en la cadena compartida de Prisma/borrado; eliminado `tsconfig-paths/register` sin `baseUrl`. Arranque sin variables probado hasta el mensaje de configuración esperado; `qa:teardown` cargó módulos y falló cerrado con argumentos ausentes. Gates completos: PASS (78 suites/501 tests). La simulación real queda para Toni.

**Diagnóstico de errores CLI (código `9a53e1a99ae094360db87c5e89164d59d94e1353`):** se añadieron etapas y códigos sanitizados sin registrar mensajes, rutas ni credenciales. Gates completos: PASS (79 suites/509 tests). La hipótesis de causa y los límites de verificación están en el inventario; Toni repetirá la simulación real.

## ES-0.3 — Claims, CEE y estimación (P0)

**Objetivo:** que interfaz, informes y estimaciones sean trazables y no aparenten certificación. **Reuso:** `src/lib/evidence/evidence-matrix.ts`, `scoring.ts`, `budget-review/service.ts`, `advanced-analysis.ts`, `costs/`, `pdf/`, locales. Revisar ES/EN/DE y locales CA/FR/IT/PT, PDFs, manual, SEO, emails y páginas legales dentro del alcance.

| Subtarea | Ejecución | Salida | Estimación orientativa |
|---|---|---|---:|
| 0.3.a Catalogar claims, pantallas, locales y consumidores | Agente | Inventario con ruta/locale | 0,5–1,5 d |
| 0.3.b Corregir claims y etiquetar fuente, incertidumbre y abstención | Agente + Toni | Copy y reglas versionados | 1–2 d |
| 0.3.c Cubrir estados declarado/documentado/estimado/ausente y umbrales neutrales | Agente | Diccionario y casos límite | 0,5–1,5 d |
| 0.3.d Comprobar copy, lógica y salidas focalmente | Agente | Pruebas/diff, evidencia por SHA | 1–3 d |

**Aceptar:** superficies dentro del inventario cubiertas; ninguna obligación residencial E/2033 sin base; EnergyScan no se presenta como CEE; ausencia e incertidumbre visibles; no se etiquetan precios caro/barato sin comparación compatible. Toni acepta inicialmente el producto. Revisión externa es necesaria antes de publicar afirmaciones jurídicas o resultados presentados como profesionales, pero no antes de implementar copy o lógica internos.

## ES-0.4 — Baseline y plan de validación (P1)

**Objetivo:** disponer de línea base reproducible sin convertir el piloto en prerrequisito. **Reuso:** Jest, CI y especificaciones existentes; los reportes históricos no prueban este SHA.

| Subtarea | Ejecución | Salida | Estimación orientativa |
|---|---|---|---:|
| 0.4.a Fijar SHA, inventario funcional y relación requisito→test | Agente | Matriz confirmado/hipótesis/pendiente | 0,5–1 d |
| 0.4.b Crear fixtures sintéticos y plan de piloto opcional | Agente + Toni | Fixtures para QA; protocolo si se decide piloto | 0,5–1,5 d |
| 0.4.c Definir criterios y denominadores de comprobación | Agente + Toni | Métricas técnicas reproducibles | 0,5–1 d |
| 0.4.d Registrar aceptación, riesgos y rollback | Toni + agente | Ledger, decisiones y enlaces a evidencia | 0,5 d |

**Ejecución:** baseline fijado en `719b228415d70a35d3537f237f762bf91165940d`, aceptado por Toni. Matriz R01–R12, inventario/hash de fixtures sintéticos inline, mapa de CI, denominadores, riesgos y rollback en [`es-0.4-baseline.md`](es-0.4-baseline.md). Plantilla vacía del protocolo opcional en [`es-0.4-pilot-protocol-template.md`](es-0.4-pilot-protocol-template.md). No se añadieron fixtures porque los cuatro escenarios requeridos ya estaban en tests unitarios; no se ejecutó piloto. Tests R04 para payloads `local_` manipulados añadidos en `d428c6d439d1317671c8eb8d8d55d986b0ab41fa`; evidencia en `gates.md`. La cobertura de R04 es parcial, no aceptación integral.

**Aceptar:** baseline ligado a SHA; requisitos vinculados a tests o limitaciones concretas; fixtures sintéticos y resultados honestos. Si se hace piloto, fijar población, exclusiones, consentimiento, denominadores y errores materiales antes de revisar resultados. No hacer piloto no bloquea desarrollo ni aceptación funcional.

## Aceptación común de tareas

1. El agente realiza el cambio y selecciona QA proporcional según los contratos Anclora.
2. El agente presenta a Toni diff, comprobaciones ejecutadas, resultados, riesgos y limitaciones.
3. Toni acepta el producto o pide ajustes. No hace falta un validador humano diferente por tarea.
4. Registrar estados `PASS`, `FAIL`, `BLOCKED` o `NOT_RUN`; no declarar evidencia que no exista.
5. Tras aceptación y verificación, crear commit y push a `origin/development`.
6. Las promociones de una fase ya comprobada se hacen solo con autorización y gates de release, paso a paso `development → staging → production → main`.

La revisión externa de usuarios sirve para validar usabilidad y encaje de mercado una vez que exista un prototipo utilizable. La revisión técnica/legal/privacy se incorpora antes de usos públicos que dependan de ella. Ninguna sustituye las comprobaciones automáticas de seguridad, privacidad y corrección que correspondan al desarrollo.


**ES-0.2 diagnóstico de DB (código `9bb3e689a32aac98010d56050b6a5863a687eb22`):** CLI `--check-db` de solo lectura conectado a la DB configurada por `vc env run` y ejecutó `SELECT 1` con token Blob retirado del proceso hijo. Falla DB_CONNECT anterior no reproducida. Corregido etiquetado obsoleto de errores post-connect y preservada causa original permitida. Gates: 79 suites/514 tests, lint/typecheck/build PASS. La simulación completa y la identificación de cualquier fallo de DB_CLASSIFY quedan para Toni; no hubo acceso a Blob ni `--apply`.


**ES-0.2 contraste DB check/full (código `276fe20d25bdadc9dda02396e2e4d6db676057e7`):** reproducido con Blob token sintético, sin `--apply`. `--check-db` pasa conexión, `SELECT 1` y probe `AssessmentAttachment.path`; el flujo completo falla antes de Blob como `DB_CONNECT / Error / ERR_DB_PREFLIGHT`, incluso tras check PASS en la misma sesión. Ambos modos comparten ahora el mismo preflight; pruebas verifican el orden y la sanitización. Gates completos: 79 suites/519 tests, lint/typecheck/build PASS. La causa raíz de la diferencia permanece sin identificar; no se alteró la base.

**ES-0.2 localización segura y etiquetas de etapa (código `921214ba26843fc92e14daff08c90ff2c4b622a1`):** el full sintético alcanzó `BLOB_LIST` y falló con `ERR_BLOB_AUTH`; el marco filtrado ubicó el handler de listado en `src/lib/orphaned-assessment-blob-purge-runtime.ts:116`. La etapa obsoleta se debía a `instanceof BlobPurgeStageError` que no reconocía de forma fiable el error envuelto por el CLI ts-node; se sustituyó por una guarda estructural. `DB_CONNECT` y `DB_QUERY` avanzan explícitamente y después se informan `BLOB_LIST`, `CLASSIFY`, `DELETE`. Añadidos marcos limitados a rutas relativas del proyecto y filtro para mensajes, absolutos y `node_modules`; pruebas con centinelas. Gates secuenciales: lint, typecheck, 79 suites/521 tests y build PASS. Sin `--apply`, token Blob real ni migración.

**ES-0.2 clasificación de formas desconocidas (código `30c44e9fcd24893bc96321fa75c1e6ea643c3d55`):** rutas bajo los prefijos EnergyScan que no coinciden con el formato estricto se agregan a tipo `d`, franja de edad y bytes; nunca abortan ni se borran. El informe incorpora histograma de formas con tipo por segmento, número de segmentos, recuento, bytes y edad, sin rutas/nombres/extensiones/IDs. Se ignoran rutas fuera del prefijo pedido. Tests con dobles verifican desconocidos conservados con `--apply`, forma válida purgable, categorías del histograma y anonimización. Gates completos: lint, typecheck, 79 suites/522 tests, build PASS. Simulación real y `--apply` NOT_RUN; Toni revisará el histograma antes de decidir si amplía la regla.

**ES-0.2 purga acotada de drafts legados (código `b613ffc623d474aba920baa9baf16ee115eb808d`):** se habilita exclusivamente `assessment-drafts/{uuid-v4}/{file}` de 3 segmentos, UUID v4 válido, archivo no vacío y sin `..` ni barras. Referenciados se reportan `a-legacy`; huérfanos >30 días, `b`; recientes, `c`; cualquier otra forma sigue en `d`. `findReferencedPaths` se ejecuta con rutas raw y `blob:` durante clasificación y vuelve a ejecutarse por cada candidato justo antes del borrado. Un recheck con referencia nueva omite y actualiza a `a-legacy`; el lote permanece en 100 por defecto. Tests cubren referencias, 31/29 días, formas inválidas, prefijos ajenos, recheck y anonimización. Gates secuenciales: lint, typecheck, 79 suites/526 tests, build PASS. Sin token real ni `--apply`; Toni hará primero simulación con `--batch-limit 5`.
