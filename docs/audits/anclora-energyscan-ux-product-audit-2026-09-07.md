# Auditoría UX/UI de Producto — Anclora EnergyScan

**Skill:** `ux-product-experience-review` v1.3.0 (`~/Developer/anclora/anclora-infrastructure/skills/ux-product-experience-review`)
**Modo:** AUDIT_WITH_REPO_CONTEXT
**Fecha de ejecución:** 7 de septiembre de 2026
**Entorno auditado:** Producción — `CANONICAL_FRONTEND_URL = https://energyscan.anclora.com`
**Repo:** `~/Developer/anclora/anclora-energyscan`, rama `development`, HEAD `5a4e1a9`
**Deployment drift:** Ninguno — el deployment de producción (`target: production`) corresponde exactamente al commit `5a4e1a9`, igual que `development`.
**Entorno de testing:** navegación anónima, 1 intento de login inválido con credenciales sintéticas (sin cuenta real creada), 1 resultado de assessment generado con datos sintéticos de vivienda (sin PII, sin pago). Sin uso de Stripe live. Sin credenciales de Provider/Professional/Admin.
**Findings:** 16 (4 P1 · 4 P2 · 5 P3 · 3 P4)
**Estado final:** `PASS_WITH_GAPS`
**Artefactos hermanos:** `anclora-energyscan-ux-product-audit-2026-09-07.html` (Claude HTML Artifact), `anclora-energyscan-ux-product-audit-2026-09-07.xml` (XHTML válido), evidencia en `evidence/anclora-energyscan-2026-09-07/` (37 capturas).

---

## 01. Resumen ejecutivo

El núcleo diagnóstico de EnergyScan es sólido: un visitante anónimo completa un prediagnóstico de 5 pasos sin crear cuenta, con opciones "no lo sé" en los campos técnicos, y llega a una pantalla de resultado que explica clase energética, nivel de confianza y datos faltantes con trazabilidad por factor. Ese núcleo está siendo erosionado por tres familias de defectos de **consistencia de contenido** que aparecen justo donde el usuario necesita más certeza: precios distintos del mismo producto según dónde se miren, un disclaimer legal que cambia de idioma según la carga, y una navegación móvil que pierde el 100% de sus enlaces, incluido el acceso a la cuenta.

- **Mayor fricción de usuario:** navegación móvil/tablet sin enlaces ni acceso a "Entrar", sin menú alternativo (EGY-004).
- **Mayor riesgo de confianza/explicabilidad:** disclaimer "no es CEE oficial" en inglés sobre sesión en español, en el checkbox de consentimiento del wizard (EGY-002).
- **Mayor oportunidad de simplificación:** unificar el precio de Budget Review (14,90€ en hero vs 19,90€ en landing/`/pricing`) (EGY-001/003).
- **Mayor quick win:** página 404 genérica de Next.js sin marca ni retorno (EGY-008).
- **Mayor oportunidad estructural:** consolidar 4 capas independientes de i18n (diccionario activo, ficheros `i18n-xx.ts`, metadatos de 7 idiomas, `common.json` desconectado).
- **Mayor oportunidad de superficie premium:** corregir contraste de texto secundario en tema oscuro (`#7A7A7A`), detectado por análisis automático en landing y resultado.
- **Economía de viewport:** ya es buena en desktop (92,8% del viewport para la tarea primaria); el problema en móvil es ausencia de navegación, no exceso de chrome.
- **Mayor oportunidad en el flujo diagnóstico:** búsqueda catastral por dirección bloqueada permanentemente en "Cargando provincias…" (EGY-005).

**Valoración global: FAIR con núcleo GOOD.** El motor de scoring y la pantalla de resultado son la pieza más madura del producto; los defectos de consistencia (precios, idioma, navegación) inciden justo sobre confianza y claridad de coste, que son los dos activos más críticos de un producto de prediagnóstico energético.

---

## 02. Modelo de producto

Next.js 14.2 (App Router), Node 24, NextAuth v5 beta, Prisma, Stripe 22, MapLibre GL 5 + 7 endpoints propios de Catastro, Tesseract.js para OCR, `@anthropic-ai/sdk` acotado al análisis visual de fotos de vivienda (no a todo el producto). Desplegado en Vercel bajo `energyscan.anclora.com`.

| Capacidad declarada | Estado real | Evidencia |
|---|---|---|
| OCR (Tesseract) | EXISTE | `src/lib/ocr/image-ocr.ts`, `tesseract.js@7` |
| Mapa/Catastro (MapLibre) | EXISTE | `PropertyMap.tsx`, `api/catastro/*` (7 rutas) |
| IA generativa (Anthropic) | PARCIAL | `api/ingestion/image/analyze` — solo visión de fotos |
| Stripe | EXISTE | `stripe@22`, `api/checkout`, `api/webhook/stripe` |
| i18n 7 idiomas | PARCIAL — profundidad real ES/EN/DE | `preferences.ts::toDictLanguage()` fuerza `ca→es`, `fr/it/pt→en` |
| Tema claro/oscuro | EXISTE | `AppPreferencesProvider::applyTheme()`, oscuro por defecto |
| CEE oficial | NO APLICA por diseño | `legal-content.ts:51` |

No existe paquete de design system compartido (`@anclora/*`); tokens Tailwind ad-hoc. El propio repo se autoevalúa "Partial" en `docs/design-system-audit.md`.

---

## 03. Promesa de producto vs experiencia observada

| Promesa | Observado | Veredicto |
|---|---|---|
| Prediagnóstico orientativo, no CEE oficial | Disclaimer en 3 capas, coherente en contenido; se renderiza en inglés de forma intermitente en el consentimiento | CUMPLE PARCIALMENTE |
| Empezar sin cuenta | Confirmado, wizard completo sin login | CUMPLE |
| Precios claros (0€/9,90€/19,90€) | Budget Review muestra 14,90€ y 19,90€ según pantalla | NO CUMPLE |
| Multi-idioma (7 idiomas) | Profundidad real ES/EN/DE; resto con fallback | CUMPLE PARCIALMENTE |
| Conexión con proveedores | Rutas/datos existen; handoff no verificado en esta pasada | NO VERIFICADO |

---

## 04. Tipos de usuario y estados

| Tipo | Objetivo | CTA | Bloqueadores |
|---|---|---|---|
| Visitante anónimo | Entender su situación energética | Iniciar análisis gratuito | Precio inconsistente (EGY-001) |
| Usuario con resultado (anónimo) | Interpretar y decidir pago | Desbloquear Premium | Ninguno crítico |
| Usuario en móvil | Iniciar/consultar sin PC | Cualquiera del header | Sin navegación ni login (EGY-004) |
| Usuario Budget Review | Validar presupuesto de reforma | Importar PDF | Precio inconsistente |
| Usuario existente | Recuperar acceso | Entrar | Mensaje correcto; inaccesible en móvil |
| Proveedor/profesional | Recibir leads | Registro/dashboard | No cubierto (sin credenciales) |
| Admin | Gobernar leads/KPIs | Panel (9 subsecciones) | No cubierto |

---

## 05. Inventario de tareas

CORE: completar wizard y obtener clase con confianza; entender siguiente acción. FRECUENTE: localizar vivienda; comparar coste de planes. OCASIONAL: login para recuperar análisis previo; subir presupuesto. EDGE: cambiar idioma/moneda/unidades. ADMIN: gestión de leads (no verificado).

---

## 06. Journeys críticos

**Primario (prediagnóstico anónimo):** Landing → Iniciar análisis → Vivienda/localización → *(fricción: búsqueda por dirección bloqueada)* → fallback clic en mapa → envolvente/instalaciones → *(fricción: consentimiento en idioma mezclado)* → Resultado. Completado de extremo a extremo con evidencia `MEASURED_BROWSER`.

**Secundario (decisión de pago):** Landing/hero *(14,90€)* → sección Precios *(19,90€)* → `/pricing` *(19,90€, tarjetas en inglés)*.

**Recuperación (login fallido):** `/auth` → credenciales sintéticas inválidas → "Email o contraseña incorrectos." (claro, sin enumerar usuarios, email conservado). Evaluación: GOOD.

**Móvil forzado:** sin navegación ni acceso a "Entrar" en 390×844/768×1024, sin menú hamburguesa. Único camino: escribir `/auth` manualmente. Evaluación: CRITICAL.

---

## 07. Mapa de pantallas

| Pantalla | Propósito | Auth | Issues |
|---|---|---|---|
| `/` | Landing | No | EGY-001,002,009,013 |
| `/wizard` | Captura de datos | No | EGY-005,006,002 |
| `/assessment/[id]` | Resultado | No | EGY-007 |
| `/pricing` | Planes | No | EGY-003 |
| `/budget-review` | Revisión de presupuesto | No (demo disponible) | No probado con datos reales |
| `/auth` | Login | — | Inaccesible en móvil (EGY-004) |
| `/calculadora-ahorro` | Ahorro estimado | No | No cubierto por navegador |
| `/provider`, `/profesional` | Alta/dashboard | Sí | No cubierto |
| `/admin/*` | Gobernanza | Sí (admin) | No cubierto |
| 404 | Recuperación | — | EGY-008 |

---

## 08. Mapa de experiencia

Entrada (landing clara) → objetivo (saber mi clase energética) → acción (iniciar análisis) → respuesta del sistema (wizard 5 pasos, progreso visible) → fricción (búsqueda por dirección rota; consentimiento en idioma mezclado) → resultado (clase + confianza + evidencia) → recuperación (fallback de mapa funciona; no existe fallback de idioma).

---

## 09-10. Scorecards UX / UI

**UX:** Claridad FAIR · Eficiencia GOOD · Consistencia **CRITICAL** · Feedback FAIR · Recuperación de errores FAIR · Carga cognitiva GOOD · Navegación **POOR** · Onboarding GOOD · Accesibilidad FAIR · Responsive Task Completion FAIR · Jerarquía visual GOOD · Application Shell (desktop) GOOD / (móvil) **CRITICAL** · Viewport Economy GOOD.

**UI:** Jerarquía de acciones GOOD · Coherencia de componentes FAIR · Legibilidad FAIR · Claridad de estados FAIR · Coherencia de tema FAIR · Densidad de datos GOOD · Ergonomía de modales UNKNOWN · Ergonomía de formularios FAIR · Jerarquía espacial GOOD · Calidad visual premium FAIR · Modernidad y acabado FAIR.

**Subscores EnergyScan:** Diagnostic Input UX FAIR · Result Comprehension GOOD · Scenario Comparability UNKNOWN · Monetization Trust **POOR** · Report Confidence GOOD.

---

## 11. Superficie premium

Sin decoración de lujo; jerarquía disciplinada en la pantalla de resultado. La percepción premium se erosiona por fiabilidad de contenido (precios, idioma) y por contraste insuficiente en tema oscuro, no por estilo. Veredicto: **FAIR con núcleo GOOD**.

## 12. Application Shell Assessment

Desktop: navegación global compacta, controles de pantalla permanecen con la pantalla, sin duplicación. Escalable. Móvil: el shell no se degrada proporcionalmente — **elimina** la navegación global sin sustituto (EGY-004). Esa es la brecha estructural real.

## 13-14. Viewport Economy y densidad visual

En 1440×900: chrome global 65px de 900px (92,8% disponible para tarea). Sin sidebar persistente. Sin relegación del workspace en desktop. La pantalla de resultado es la más densa pero bien jerarquizada; la landing móvil pierde densidad de *información* por ausencia de navegación, no por exceso.

---

## 15. Diagnostic Wizard Assessment

5 pasos con progreso visible, back/next consistentes, "no lo sé" en casi todos los campos técnicos. Validación tardía y genérica (banner "Invalid input" sin traducir, sin foco de campo — EGY-006). Unidades correctas tras ajustar preferencias; por defecto ft² (EGY-009). Localización: búsqueda por dirección rota (EGY-005); clic en mapa robusto. Consentimiento con disclaimer en idioma inconsistente (EGY-002). Guardado de progreso no verificado.

**¿Puede un no-experto completar el diagnóstico con confianza?** Sí, en términos de finalización. La confianza se compromete en el único punto de decisión informada real: el consentimiento legal.

## 16. Catastro / Map Experience

Dirección: bloqueada en "Cargando provincias…" pese a que el backend responde 200 (EGY-005). Referencia catastral: falla en silencio con 503 real (EGY-010). Clic en mapa: fallback robusto con badge "MANUAL". El dato catastral reduce esfuerzo cuando funciona; cuando falla, confunde por silencio, no por dato incorrecto.

## 17. OCR / Document Input

UI localizada en Budget Review y wizard; no se subieron archivos reales por protección de datos. Confianza del parser y verificabilidad del extraído: `UNKNOWN` para esta pasada. Motor Tesseract.js confirmado por código.

## 18. Result & Score Explainability

Motor de reglas (`src/lib/scoring.ts`) por campo, con `delta:0`/`type:"neutral"`/`missingData` explícito cuando el dato es desconocido, y `confidenceRank()` agregando confianza ("Baja"/"Media"). La UI expone letra, confianza, factores penalizadores/puntos fuertes/datos faltantes y evidencias por campo, distinguiendo visualmente CEE importado de estimación propia. Único déficit: contraste en textos secundarios en tema oscuro (EGY-007).

## 19. Trust and Uncertainty Assessment

Citas verificadas: `legal-content.ts:51` ("no genera Certificados de Eficiencia Energética oficiales..."), `legal-content.ts:72`, `assessment/[id]/page.tsx:286`. Sin lenguaje de garantía ni sobreclaim detectado. El riesgo real es de **entrega**, no de contenido: el disclaimer en inglés sobre sesión en español en el checkbox de consentimiento (EGY-002) es un fallo de ingeniería de hidratación i18n con consecuencia legal.

## 20. Comparación de escenarios

`UNKNOWN` — no alcanzado en el tiempo disponible de esta pasada; no confirmado por código con el mismo nivel de certeza que el resto de superficies. Recomendado como prioridad de seguimiento.

## 21. Budget Review

Explicación del servicio, textarea, "Importar presupuesto PDF", modo demo disponible (`api/budget-review/demo`) no explotado a fondo. Paywall vía Stripe, no iniciado. Precio coincide con `/pricing` (19,90€) pero no con el hero (14,90€) — mismo hallazgo que EGY-001.

## 22. Premium / Monetización

Estructura de precios razonable; valor visible antes del muro de pago. El problema es entrega inconsistente del mismo precio (EGY-001/003) y contenido en inglés en las tarjetas de mayor intención de compra — defecto de confianza transaccional, no estético.

## 23. Report Confidence

La pantalla de resultado gratuita ya transmite rigor suficiente para compartir con un técnico. PDF Premium no generado en esta pasada (requiere pago) — `UNKNOWN`. Histórico ya señalaba que el PDF no hereda tokens del sistema web (ver sección 29).

## 24. Provider / Professional Experience

No cubierto. Rutas y modelo de datos completos, semillas demo para 6 tipos de proveedor; requiere cuenta real no disponible de forma segura. Prioridad de siguiente pasada.

## 25. Auth y recuperación

Login funciona correctamente y de forma segura (no enumera usuarios). Login social presente, no iniciado. Único defecto: alcance — "Entrar" inaccesible en móvil/tablet (EGY-004).

## 26. Information Architecture Findings

- "Precios" como ancla y como página dedicada con datos divergentes (EGY-014, correlaciona con EGY-001/003).
- Integraciones `api/integrations/nexus` y `.../synergi` sin equivalente visible en la superficie de usuario auditada — naturaleza no clasificada.
- Superficie admin amplia (9 subsecciones) no evaluable sin acceso.

## 27. System State Audit

| Estado | Distinguible | Siguiente acción clara | Nota |
|---|---|---|---|
| Loading (dirección) | Sí | No — nunca resuelve | EGY-005 |
| Error (referencia) | No | No | EGY-010, silencioso |
| Error (validación) | Parcial | No | EGY-006 |
| Error (login) | Sí | Sí | Ejemplar |
| 404 | Sí (genérico) | No | EGY-008 |
| Success (resultado) | Sí | Sí | Ejemplar |

## 28. I18N Assessment

7 idiomas declarados "activos" en metadatos; realidad fragmentada en 4 capas (diccionario tipado a `es/en/de`, ficheros `i18n-ca/fr/it/pt.ts` sin verificar, `common.json` con paridad 100% pero 0 importaciones en `src`). Catalán probado: nav/hero/dropdown correctos, disclaimer en español (fallback) en vez de catalán. Idioma no persiste tras recarga completa aunque moneda/unidades sí (EGY-012). Profundidad real: ES/EN/DE fuertes.

## 29. Historical Regression Check

Fuente: `docs/design-system-audit.md` (HISTORICAL_REFERENCE).

| Issue histórico | Estado ahora |
|---|---|
| Mezcla de idioma/unidad | **STILL_PRESENT** (EGY-002,009,010,012) |
| Densidad wizard móvil | PARTIALLY_FIXED (paso 1 ok, resto no reprobado) |
| Estados vacíos/error en Results | NOT_RETESTED |
| PDF no hereda tokens web | NOT_RETESTED |
| Consentimiento Provider Lead no premarcado | NOT_RETESTED |

## 30. Lo que funciona bien

Fallback de mapa manual robusto · "No lo sé" en casi todos los campos técnicos · pantalla de resultado completa y bien jerarquizada · mensaje de error de login claro y seguro · foco de teclado visible y consistente · progreso de wizard siempre visible · layout responsive del formulario del wizard en móvil · modo demo de Budget Review ya contemplado.

---

## 31. Findings

> Ficha completa (todos los campos del Finding Model v2, screenshots y acceptance criteria) en el artefacto HTML/Artifact. Aquí, resumen tabular.

| ID | Severidad | Prioridad | Categoría | Título |
|---|---|---|---|---|
| EGY-001 | CRITICAL | P1 | MONETIZATION | Precio de Budget Review inconsistente (14,90€ vs 19,90€) |
| EGY-002 | CRITICAL | P1 | CONTENT_UX | Disclaimer legal en idioma equivocado (consentimiento wizard) |
| EGY-003 | CRITICAL | P1 | CONTENT_UX | Tarjetas de `/pricing` en inglés con sesión en español |
| EGY-004 | CRITICAL | P1 | NAVIGATION | Navegación y login ausentes en móvil/tablet |
| EGY-005 | HIGH | P2 | FORM_UX | Búsqueda catastral por dirección bloqueada |
| EGY-006 | HIGH | P2 | FORM_UX | Validación genérica sin traducir ni foco de campo |
| EGY-007 | HIGH | P2 | ACCESSIBILITY | Contraste insuficiente en tema oscuro |
| EGY-008 | HIGH | P2 | ERROR_RECOVERY | Página 404 genérica sin marca |
| EGY-009 | HIGH | P2 | CONTENT_UX | Arquitectura i18n fragmentada (raíz de 002/003/012) |
| EGY-010 | MEDIUM | P3 | FEEDBACK | Búsqueda por referencia catastral falla en silencio |
| EGY-011 | MEDIUM | P3 | CONTENT_UX | Moneda/unidades por defecto GBP/ft² |
| EGY-012 | MEDIUM | P3 | CONSISTENCY | Idioma no persiste tras recarga completa |
| EGY-013 | LOW | P4 | VISUAL_HIERARCHY | CTA secundario poco visible en tema claro |
| EGY-014 | LOW | P4 | OPPORTUNITY | "Precios" como ancla y página divergentes |
| EGY-015 | LOW | P4 | ACCESSIBILITY | Touch targets del selector de tema <44px |
| EGY-016 | OPPORTUNITY | P3 | PREMIUM_QUALITY | Ausencia de design system compartido |

## 32. Quick Wins

EGY-001, EGY-003, EGY-007, EGY-008, EGY-010, EGY-011, EGY-012.

## 33. Structural Redesign Opportunities

1. **Patrón de navegación móvil (drawer).** Where: header global. Why: EGY-004. Do not break: layout wizard móvil.
2. **Consolidación de arquitectura i18n.** Why: raíz de EGY-002/003/009/012. Do not break: profundidad ya correcta ES/EN/DE.
3. **Gobernanza de contenido de precios.** Why: raíz de EGY-001/003/014.
4. **Validación de formulario por campo.** Why: EGY-006, agrava EGY-005/010.
5. **Paso de contraste de tokens en tema oscuro.** Why: EGY-007, previene recurrencia (EGY-016).

## 34. Recommended Roadmap

**Fase 1 — Quick wins:** EGY-001, EGY-003, EGY-007, EGY-008, EGY-010, EGY-011, EGY-012.
**Fase 2 — Alto impacto:** EGY-004, EGY-005, EGY-006.
**Fase 3 — UX estructural:** EGY-002/009 (i18n), EGY-014 (arquitectura de precios), EGY-016 (design system), y auditoría de seguimiento de Escenarios/Provider/Professional/Admin/checkout completo/PDF Premium.

## 35. Do Not Break — resumen

Wizard completo sin cuenta · opciones "no lo sé" · fallback de mapa manual · separación visual CEE importado vs estimación · mensaje de login seguro · foco de teclado visible · layout responsive del wizard móvil · profundidad ya correcta ES/EN/DE.

## 36. Evidence Coverage

BROWSER_AVAILABLE=true · PUBLIC_FLOWS_COVERED=true · AUTHENTICATED_FLOWS_COVERED=parcial · REPO_CONTEXT_AVAILABLE=true · CODE_PATHS_INSPECTED=parcial · DESKTOP_COVERED=true · TABLET_COVERED=parcial · MOBILE_PORTRAIT_COVERED=parcial · MOBILE_LANDSCAPE_COVERED=false · LIGHT_THEME_COVERED=parcial · DARK_THEME_COVERED=true · ACCESSIBILITY_COMPOSED=parcial(ad-hoc) · I18N_COMPOSED=unavailable · DESIGN_SYSTEM_COMPOSED=unavailable · VISUAL_REGRESSION_COMPOSED=unavailable · AUTH_COVERED=true · ASSESSMENT/RESULTS_COVERED=true · DASHBOARD_COVERED=false · SCENARIOS_COVERED=unknown · CATASTRAL_MAP_COVERED=true · OCR_COVERED=parcial · BUDGET_REVIEW_COVERED=parcial · CALCULATOR_COVERED=false · PRICING_COVERED=true · PREMIUM_COVERED=parcial · CHECKOUT_COVERED=false · REPORT_COVERED=parcial · PROVIDER/PROFESSIONAL_COVERED=false · APPLICATION_SHELL/VIEWPORT_ECONOMY=true(desktop) · PREMIUM_SURFACE_COVERED=parcial · TRUST_EXPLAINABILITY_COVERED=true · HISTORICAL_REGRESSION_CHECK=parcial.

## 37. Limitations and Gaps

No cubierto por falta de credenciales seguras: Provider, Professional, Admin, dashboard con historial. Ningún pago real ni Stripe test completado. Escenarios de mejora no alcanzados. Calculadora de ahorro no probada en navegador. OCR/Budget Review sin archivos reales por protección de datos. Composed skills formales no ejecutadas como procesos AOS independientes (sustituidas por evidencia manual equivalente, declarada como tal). `AssessmentWizard.tsx` y esquema Prisma no leídos completos. Contratos AOS globales referenciados por `CLAUDE.md` no localizados en este repositorio. Naturaleza de integraciones `nexus`/`synergi` no clasificada.

**Estado final: PASS_WITH_GAPS** — cobertura suficiente para las conclusiones emitidas, no exhaustiva del alcance total solicitado.

---

*Anclora EnergyScan · Auditoría UX/UI de producto · ux-product-experience-review v1.3.0 · AUDIT_WITH_REPO_CONTEXT · energyscan.anclora.com · HEAD 5a4e1a9 · 7 de septiembre de 2026*
