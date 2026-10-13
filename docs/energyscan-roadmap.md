# Anclora EnergyScan — Roadmap y delta de baseline

**Estado:** roadmap de trabajo para desarrollo; ejecución por fases en `development`, con aceptación inicial de Toni · **Fecha de análisis:** 2026-10-12; proceso actualizado 2026-10-13
**Baseline:** `development` · `4870403dfd8237dfa82b2aecc9bd4270cd766bd0` (2026-10-03) · sin cambios rastreados al iniciar; ya existían artefactos de análisis/spec sin seguimiento que se preservaron en backup antes de editarlos.
**Alcance:** siete fases; detalle actual de F0 en `specs/energyscan/000-seguridad-verdad/`. Toni dirige la validación inicial de producto junto con el agente. Cada fase se implementa en `development`, se comprueba con sus gates técnicos y se acepta por Toni antes de iniciar una promoción. La revisión externa se programa antes del uso o lanzamiento público cuando aplique.

## 1. Estado real observado

Categorías: **CONFIRMADO_EN_CÓDIGO** significa presencia estática en el SHA citado; **CONFIRMADO_EN_TEST** solo describe un reporte histórico identificado y no una ejecución actual; **HIPÓTESIS** requiere validación; **FUENTE_PENDIENTE** necesita autoridad/documentación verificable; **BLOQUEADO** identifica una dependencia concreta.

| Área | Estado y evidencia en HEAD | Delta / consecuencia |
|---|---|---|
| Rama | **CONFIRMADO_EN_CÓDIGO**: `development`, SHA anterior; origen sincronizado (`0/0`), árbol limpio. | El snapshot del prompt sí coincide; revalidar al iniciar cualquier ejecución futura. |
| Runtime | **CONFIRMADO_EN_CÓDIGO/CONTRATO**: `.anclora/PRODUCTION_RUNTIME.md` declara `LOCAL_RUNTIME_MODEL=PRODUCTION_BACKED`, Neon/Postgres, Vercel Blob y Auth.js. | Neon vuelve a ser objetivo operativo vigente por contrato y por instrucción de Toni. Docker Desktop es fallback temporal resuelto, no DB permitida por defecto. No se inspeccionaron variables ni se conectó a DB; el destino efectivo sigue **BLOQUEADO** para QA hasta verificarlo sin revelar valores. |
| Autorización de adjuntos | **CONFIRMADO_EN_CÓDIGO**: `src/app/api/assessment/[id]/attachments/[attachmentId]/route.ts:10-51,54-68` consulta por IDs y lee/borrar storage/registro sin llamar a `auth()` ni validar owner/rol. | Reapertura ES-0.1 prioritaria. Esto es un hallazgo estático, no una explotación demostrada. |
| Upload | **CONFIRMADO_EN_CÓDIGO**: `src/app/api/blob/upload/route.ts:26-57` obtiene sesión tolerando error (`catch(() => null)`) y emite `userId: ... || null`. | ES-0.1 debe definir autenticación/autorización y vinculación segura draft→assessment; auditar callbacks/token. |
| ID stateless | **CONFIRMADO_EN_CÓDIGO**: `src/lib/stateless-assessment.ts:26-49` codifica JSON base64url sin firma/cifrado. | No tratar opacidad/UUID como control de acceso; inventariar consumidores y datos embebidos antes de decidir reemplazo. |
| Claim normativo | **CONFIRMADO_EN_CÓDIGO**: `src/app/page.tsx:15-30` declara clase E residencial obligatoria 2033 en ES/EN/DE. | ES-0.3 debe retirar/corregirlo en superficies públicas; localizar PDF/manual/SEO y comprobar todas las traducciones. La meta residencial EPBD es trayectoria del parque nacional; 2030/2033 son umbrales de stock no residencial (Directiva, art. 9). |
| Scoring | **CONFIRMADO_EN_CÓDIGO**: `src/lib/scoring.ts:185` deja `climateRules` vacío. | No llamar CEE ni cálculo calibrado al score. Definir etiqueta, límites, unidades, incertidumbre y no inferir precisión. |
| Presupuestos | **CONFIRMADO_EN_CÓDIGO**: `src/lib/budget-review/service.ts:17-18,34` y `advanced-analysis.ts:286-287,368` aplican 25/450 y 30.000 como reglas. | ES-0.3 localiza consumidores y define estado neutral/abstención sin umbral universal. Comparabilidad y calibración quedan F1. |
| Trazabilidad/evidencia | **CONFIRMADO_EN_CÓDIGO**: `prisma/schema.prisma:100-212` incluye attachments, CEE, RehabBudget y DataFieldSource; `src/lib/evidence/evidence-matrix.ts:18-25,210-391` calcula fuentes `catastro`, declaradas, CEE y adjuntos. | Reutilizar; demostrar cobertura real para assessments legacy, campo ausente/conflicto y salida/informes. No presumir que cada campo persistido tiene fuente. |
| Modelos de dominio | **CONFIRMADO_EN_CÓDIGO**: `prisma/schema.prisma:136-199,345-366,447-461` incluye EnergyCertificate, RehabBudget, BudgetReview y EnergyBillDataPoint. | Reusar primero; no asumir revisión/versionado longitudinal si el esquema no lo modela. |
| Ingestión/documentos | **CONFIRMADO_EN_CÓDIGO**: rutas `/api/ingestion/{cee,budget}/analyze`, parsers y servicio en `src/lib/document-parsing/`, `src/lib/ocr/`, `src/lib/ingestion/`. | Reutilizar y auditar minimización, retención, payload/logs, límites de archivo y uso de proveedores antes de ampliar OCR/IA. |
| Stripe/catálogo | **CONFIRMADO_EN_CÓDIGO**: rutas checkout/webhook/status existentes; `src/lib/stripe.ts:18` fija `PREMIUM_PRICE_CENTS=990`; existen `src/lib/monetization/products.ts`, checkout de BudgetReview y credit checkout. | Contradice plan maestro histórico que marca paywall pendiente. Monetización existe en código; consistencia catálogo/Price IDs, idempotencia, reembolso y derechos no quedan validados aquí. Precio es decisión de Toni. |
| Spec tooling | Búsqueda estática de manifiestos y directorios no encontró instalación/configuración GitHub Spec Kit/OpenSpec en este checkout. | Especificación manual equivalente. Setup futuro pendiente; no se instalaron herramientas ni ejecutaron slash commands. CBM index/build no ejecutado por límite de la misión. |
| Pruebas | Hay `jest`, tests en `tests/` y workflows `.github/workflows/ci.yml`, `validate-agent-branch.yml`; los gates SDD históricos anotan ejecuciones pasadas. | Ninguna prueba, build, lint, pentest, DB, Stripe, visual QA ni CI se ejecutó para este análisis: todo gate futuro figura `NOT_RUN`. Los reportes históricos no son evidencia del HEAD actual. |
| Contratos bootstrap | `AGENTS.md` exige `.anclora/global/ANCLORA_ECOSYSTEM_CONTEXT.md` y `GLOBAL_AGENT_WORKFLOW.md`; ambas rutas faltan. `.anclora/AGENT_PROJECT_CONTEXT.md`, `PRODUCTION_RUNTIME.md`, `AOS_ADOPTION.md`, `MEMORY.md` sí leídos. | **BLOQUEADO** solo para contenido de esas fuentes ausentes; usar contratos disponibles y señalar el gap sin suplirlos por suposición. |

### Especificaciones históricas: delta

| SDD anterior | Qué afirma el artefacto | Tratamiento en esta propuesta |
|---|---|---|
| `sdd/features/energyscan-360-product-differentiation/audit-current-state.md` y `GATE_FINAL.md` | Reporta core, Evidence Matrix, cost engine, mercado, checklist y varias áreas; gate con checks históricos. | Revalidar por rutas/modelos. Evidence Matrix ya tiene módulo; conservar y cerrar brecha de cobertura/integración, no duplicar. La recomendación de no cambiar ciertos módulos es histórica, no veto al análisis de seguridad. |
| `sdd/features/energyscan-plan-end-to-end/*` | Declara normativa, scoring modular, adjuntos, ayudas y timeline implementados con gate histórico. | El claim 2033 actual contradice el objetivo de copy preciso; reabrir. Reutilizar scoring/timeline/simulación y volver a comprobar fuente/vigencia. |
| `sdd/features/energyscan-premium-data-ingestion/*` | Reporta modelos/pipelines CEE y presupuesto, tests/build; visual QA histórica bloqueada. | Reutilizar modelos y parsers; evaluar seguridad, procedencia y calidad en F0/F1. Ejecuciones no se trasladan al HEAD como PASS. |
| `sdd/features/energyscan-premium-checkout-monetization/*`, `energyscan-monetization-pending-end-to-end/*` | Reportan Stripe checkout, webhook, gating y recovery ya implementados. | Código actual confirma varios seams; “pending” en el nombre no significa no implementado. F5 solo audita operación, economía, reembolso e idempotencia con precio aprobado. |
| `sources/` — plan maestro | Marca Stripe/paywall como pendiente. | **Desactualizado respecto al código**; contexto de monetización únicamente. Carpeta solo lectura y sin cambios. |

## 2. Hipótesis de producto y restricciones

Hipótesis diferencial, no validada: continuidad, privacidad y trazabilidad desde evidencia hasta oferta comparable, plan por etapas revisado por profesional y seguimiento postobra. No afirmar exclusividad ni disponibilidad/precio comercial de comparadores por referencias de proyecto. CGATE documenta calculadora pública con simulación de CEE XML y reporte; iBRoad2EPC es iniciativa/proyecto de unión CEE+pasaporte y PAS-E referencia de itinerario/expediente; estas páginas no demuestran apps equivalentes comerciales disponibles ni sus precios.

Regulación a revisar en cada fase legal, siempre con territorio, tipo/uso, artículo, vigencia y fecha. La Directiva (UE) 2024/1275 art. 9.2 establece reducción media del consumo primario de vivienda nacional frente a 2020 de al menos 16% a 2030 y 20–22% a 2035; no impone clase E individual residencial universal en 2033. Los plazos 2030/2033 de art. 9.1 son para edificios no residenciales. Comisión: transposición general antes de 29/05/2026; su aviso de 15/07/2026 señala procedimientos de infracción por falta de transposición completa a los 27 Estados. La situación jurídica española concreta debe verificarse con BOE/EUR-Lex antes de afirmar transposición o efecto nacional. RD 659/2025 modifica RD 390/2021 y entró en vigor el 23/07/2026. El prediagnóstico EnergyScan no emite ni sustituye un CEE oficial/técnico competente. El plan de producto no se denomina pasaporte oficial, homologado o reconocido sin base expresa.

## 3. Roadmap de siete fases

Ventana de referencia: 26 semanas desde 12/10/2026 a 12/04/2027; fechas y capacidad son orientativas. Rebasar fechas según capacidad sin relajar gates técnicos. Los porcentajes, tamaños y conversiones son umbrales propuestos, no normas ni resultados medidos. El piloto externo sirve para validar encaje y calidad de producto, pero no bloquea la implementación interna de las fases. Refinar el detalle de cada fase al cerrar la anterior.

| Fase / ventana | Tareas padre | Objetivo / dependencia | Gate padre propuesto (métrica, denominador, evidencia) |
|---|---|---|---|
| **F0 Seguridad y verdad** · semanas 1–2 · 12–26 oct | ES-0.1 Autorización y upload; ES-0.2 Privacidad/ingesta; ES-0.3 Claims, CEE y estimación; ES-0.4 Baseline y diseño piloto | Cerrar riesgos de lectura/borrado/upload, exposición de datos y afirmaciones. | Matriz sintética usuario/recurso/acción: 0 accesos cruzados en casos ejecutados; vulnerabilidades críticas/altas corregidas o explícitamente contenidas antes de habilitar el flujo; 100% de superficies dentro del alcance revisadas; salidas distinguen declarado, documentado, estimado y ausente. Toni acepta F0 con evidencia técnica reproducible. Revisión especialista externa se agenda antes de exposición pública de claims sensibles. |
| **F1 Ofertas comparables** · semanas 3–5 · 26 oct–16 nov | ES-1.1 Extracción/localización; ES-1.2 Comparabilidad/costes; ES-1.3 Revisión/salida accionable | Extraer ofertas a estructura comparable; puede implementarse con fixtures sintéticos y fuentes autorizadas disponibles. | En fixtures: exactitud/cobertura por campo medidas con denominadores; 0 alertas críticas sin evidencia; incompatibles sin orden de equivalencia. Toni acepta la función interna. Corpus externo ≥20 presupuestos es una validación posterior de calidad, no requisito para desarrollar el flujo. |
| **F2 Expediente y roles** · semanas 6–9 · 16 nov–14 dic | ES-2.1 Evidencia/versionado; ES-2.2 Permisos/revocación; ES-2.3 Expediente/exportación | Trazabilidad/revocación entre propietario y profesional; reusar modelos y F0. | 5 fixtures end-to-end; 100% campos críticos con estado/fuente o falta explícita; 100% rutas/storage incluidas en matriz pasan permisos/revocación. Sin documento transmisible por defecto. QA técnico de permisos y privacidad por diseño; revisión externa previa al uso público que lo requiera. |
| **F3 Plan y piloto** · semanas 10–13 · 14 dic–11 ene | ES-3.1 Incertidumbre; ES-3.2 Plan revisable; ES-3.3 Piloto | Construir plan por etapas revisable. El piloto es una actividad de validación que puede ejecutarse después o en paralelo, con consentimiento. | En escenarios sintéticos: trazabilidad de dependencias, rangos y abstención ante datos insuficientes. Toni acepta la experiencia/producto. Los 10–15 casos, medición de tiempo y compras se reportan como evidencia de mercado separada y no bloquean desarrollo ni aceptación funcional. |
| **F4 Norma y ayudas** · semanas 14–16 · 11 ene–1 feb | ES-4.1 Registro versionado; ES-4.2 Elegibilidad condicional; ES-4.3 Coste bruto/neto | Presentar información territorial con fuente, vigencia y abstención. | Casos automatizados de norma vigente, vencida, incompatible e incompleta; cero obligación o concesión afirmada sin base; cada afirmación muestra fuente/fecha/territorio/estado. Revisión legal antes de publicación o uso como orientación jurídica. |
| **F5 Lanzamiento controlado** · semanas 17–20 · 1 feb–1 mar | ES-5.1 Oferta/precio/reembolso; ES-5.2 Operación/recuperación; ES-5.3 Canal/calidad | Operar venta con soporte y economics aprobados; requiere F3 aprobado, no deriva de checkout existente. | 5 operaciones test/piloto pagadas y entregadas de modo consentido, soporte y reembolso ensayados; margen variable positivo según modelo de costes aprobado por Toni; Stripe test mode, recovery/idempotencia con evidencia. No live charges en preparación. |
| **F6 Postobra** · semanas 21–26 · 1 mar–12 abr | ES-6.1 Serie y contexto; ES-6.2 Normalización; ES-6.3 Seguimiento | Seguir consumo/obra sin atribuciones causales no probadas; requiere series consentidas y método revisado. | Beta de método revisada + 5 casos históricos consentidos; abstención si baseline insuficiente; importe factura no se confunde con consumo; sin promesa de resultados 12 meses antes/después en abril. Revisión técnica/privacidad. |

### Registro de tareas padre (22)

ES-0.1–ES-0.4 forman el alcance activo de desarrollo. F1–F6 se refinan progresivamente, manteniendo el objetivo y los gates técnicos. Toni es responsable de producto y aceptación inicial; el agente implementa y documenta evidencia. Especialistas externos no son requisitos previos para empezar o completar trabajo interno, pero sí pueden ser necesarios para afirmar conformidad legal/técnica o habilitar funcionalidades y comunicaciones públicas reguladas.

| ID | Fase/prioridad | Objetivo diferencial | Reuso/ruta real confirmada | Dependencia / gate propio | Riesgo / esfuerzo orientativo |
|---|---|---|---|---|---|
| ES-0.1 | F0 / P0 | Asegurar acceso por actor/recurso/acción | API adjuntos, upload, Auth.js, Assessment/Attachment | Matriz auth 100% segura; F0 gate | Alto; 2–3 d; revisión security |
| ES-0.2 | F0 / P0 | Privacidad y minimización documental | parsing/OCR/vision, Blob, datos `ocrData`/hash | Inventario de flujo, controles y retención documentados; no hace falta dictamen externo para desarrollo interno | Alto; 2–3 d |
| ES-0.3 | F0 / P0 | Resultados veraces y abstención | claims públicos/i18n, scoring, budget review, reports | Copy y lógica revisados contra fuentes disponibles; uso público sensible requiere revisión especializada previa | Alto; 2–3 d |
| ES-0.4 | F0 / P1 | Fijar baseline y plan de validación | tests/CI y SDD previas como índice | Baseline reproducible y fixtures internos; estudio con usuarios planificado, no bloqueante | Medio; 1–2 d |
| ES-1.1 | F1 / P1 | Extraer campos críticos con cobertura visible | OCR/parsers, RehabBudget | F0 + corpus autorizado | Alto; 4–7 d |
| ES-1.2 | F1 / P1 | Comparar alcance/unidades/IVA/exclusiones | cost engine, budget review | 1.1 + criterios/corpus | Alto; 4–6 d |
| ES-1.3 | F1 / P1 | Revisión corregible que produce preguntas | Evidence Matrix, informes | 1.1, 1.2 | Medio; 3–5 d |
| ES-2.1 | F2 / P1 | Trazar cambios y procedencia temporal | DataFieldSource, Assessment, CEE, Budget | F0; decisión versionado | Alto; 4–6 d |
| ES-2.2 | F2 / P0 | Roles/revocación completos | Auth roles, leads, attachments/storage | F0.1 + modelo actores aprobado | Alto; 5–8 d |
| ES-2.3 | F2 / P2 | Expediente/export controlado | PDF existentes, report routes | 2.1, 2.2 y consentimiento | Alto; 4–6 d |
| ES-3.1 | F3 / P1 | Mostrar incertidumbre/intervalo/abstención | scoring, cost estimates, confidence | F0.3, F1 | Alto; 3–5 d |
| ES-3.2 | F3 / P1 | Plan secuencial con revisión profesional | scenario matrix/simulator | 3.1, técnico participante | Alto; 5–8 d |
| ES-3.3 | F3 / P0 | Preparar medición de adopción/error | dashboard y flujo actuales | 3.2; piloto con usuarios externos opcional y posterior | Alto; 3–5 d |
| ES-4.1 | F4 / P1 | Fuente normativa con jurisdicción/vigencia | regulatory, KnowledgeEntry | Fuentes primarias y reglas de vigencia; revisión legal previa a publicación | Medio; 3–5 d |
| ES-4.2 | F4 / P1 | Elegibilidad como estimación condicional | subsidies | 4.1 + casos por territorio | Alto; 3–5 d |
| ES-4.3 | F4 / P2 | Separar bruto, ayuda potencial, neto | cost engine/subsidies | 4.1, 4.2 | Medio; 2–4 d |
| ES-5.1 | F5 / P0 | Oferta comercial, términos y reembolso claros | Stripe/product catalog existentes | decisión Toni, F3 | Alto; 3–5 d |
| ES-5.2 | F5 / P0 | Soportar entrega, recuperación e idempotencia | checkout/webhook/recovery | 5.1, pruebas test mode | Alto; 4–6 d |
| ES-5.3 | F5 / P1 | Medir canal y calidad sin invadir privacidad | analytics/events existentes | 5.1, consentimiento legal | Medio; 3–5 d |
| ES-6.1 | F6 / P1 | Recoger serie longitudinal contextualizada | EnergyBillDataPoint | consentimiento, fuente y frecuencia | Alto; 3–5 d |
| ES-6.2 | F6 / P1 | Normalizar clima/ocupación/energía | datos de factura; diseño nuevo PROPUESTA | 6.1, método revisado | Alto; 5–8 d |
| ES-6.3 | F6 / P2 | Seguimiento y explicación sin causalidad falsa | dashboard/report | 6.1, 6.2 | Alto; 3–5 d |

## 4. Supuestos, decisiones y estados

| Decisión | Valor recomendado | Owner/estado | Efecto si difiere |
|---|---|---|---|
| Segmento inicial (propietario, comunidad, técnico) | elegir un segmento tras entrevistas del piloto | Toni — PENDIENTE | cambia onboarding, permisos y corpus |
| Precio, paquete, reembolso y unidad de cobro | mantener no decidido; auditar actual sin cambiarlo | Toni — PENDIENTE | bloquea F5; no aplicar `990` como precio validado |
| Jurisdicción piloto | municipio/CCAA elegidos por Toni para acotar implementación; revisión legal antes de uso público normativo | Toni — PENDIENTE | sin fuente primaria no se muestran claims/ayudas territoriales; el resto del desarrollo continúa |
| Revisión externa técnica/legal/RGPD | planificarla como parte de preparación de uso público | Toni — POSTERIOR | no bloquea desarrollo; sí claims regulados, asesoramiento o despliegue público que dependa de ella |
| Piloto, consentimiento y corpus | solo material sintético o autorizado/anónimo | Toni — POSTERIOR/OPCIONAL | necesario para medir ajuste de mercado o calibración real; no bloquea construir funcionalidad ni pruebas con fixtures sintéticos |
| Neon efectivo para futuras QA DB | verificar endpoint efectivo sin exponer secretos; contrato indica producción | rol DevOps — pendiente de ejecución futura | DB QA bloqueada hasta verificación; no conectar en esta tarea |
| Versionado de fuente y expediente | reusar tablas/modelos; cambio de esquema solo con evidencia de brecha | producto/arquitectura — PENDIENTE | evita migración prematura |

**Definition of Ready global:** objetivo, alcance, dependencias, fuentes/fixtures y gate definidos; una decisión de producto pendiente se eleva a Toni solo si impide una elección irreversible. **Definition of Done de desarrollo:** requisitos enlazados a diff y evidencia técnica apropiada, casos negativos/límite/autorización, privacidad/logging, migración/rollback evaluados y aceptación de Toni. El estado de ejecución se registra con honestidad (`PASS`, `FAIL`, `BLOCKED`, `NOT_RUN`). La revisión externa y los pilotos de mercado son gates separados de preparación pública/comercial, no bloqueos de implementación.

### Flujo de ramas y promoción

El trabajo se realiza directamente en `development`. Al cerrar un lote funcional: ejecutar QA proporcional, presentar el resultado a Toni, crear commit y push a `origin/development`. Una vez que Toni confirme que la fase está comprobada, la promoción autorizada sigue, paso a paso, `development → staging → production → main`, con sus gates de release y verificación entre pasos. No se promueve automáticamente como parte del desarrollo ni se salta ninguna etapa.
