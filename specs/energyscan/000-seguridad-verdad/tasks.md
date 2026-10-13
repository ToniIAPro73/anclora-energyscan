# F0 — Tareas de desarrollo

**Estado:** ES-0.1 fue validada por Toni y promocionada a `main`. ES-0.2 está en implementación en `development`; ES-0.3 y ES-0.4 siguen pendientes. Toni valida inicialmente producto y alcance junto con el agente. El agente implementa y aporta evidencia técnica. No hay requisito de panel de validadores ni piloto previo a la implementación. Toda prueba que aún no se haya ejecutado está `NOT_RUN`.

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

**Aceptar:** baseline ligado a SHA; requisitos vinculados a tests o limitaciones concretas; fixtures sintéticos y resultados honestos. Si se hace piloto, fijar población, exclusiones, consentimiento, denominadores y errores materiales antes de revisar resultados. No hacer piloto no bloquea desarrollo ni aceptación funcional.

## Aceptación común de tareas

1. El agente realiza el cambio y selecciona QA proporcional según los contratos Anclora.
2. El agente presenta a Toni diff, comprobaciones ejecutadas, resultados, riesgos y limitaciones.
3. Toni acepta el producto o pide ajustes. No hace falta un validador humano diferente por tarea.
4. Registrar estados `PASS`, `FAIL`, `BLOCKED` o `NOT_RUN`; no declarar evidencia que no exista.
5. Tras aceptación y verificación, crear commit y push a `origin/development`.
6. Las promociones de una fase ya comprobada se hacen solo con autorización y gates de release, paso a paso `development → staging → production → main`.

La revisión externa de usuarios sirve para validar usabilidad y encaje de mercado una vez que exista un prototipo utilizable. La revisión técnica/legal/privacy se incorpora antes de usos públicos que dependan de ella. Ninguna sustituye las comprobaciones automáticas de seguridad, privacidad y corrección que correspondan al desarrollo.
