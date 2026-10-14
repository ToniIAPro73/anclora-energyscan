# Checklist de validación — SDD ES-1.2 comparabilidad (2026-10-14)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan
**Rama y SHA base revisado:** development @ `205e84c83180b6b822a19e78063deae78d330a32`
**Entorno de validación:** revisión documental local; sin runtime
**Datos:** solo descripciones y fixtures sintéticos ya versionados; no se crearon registros ni se usó identidad QA.

## 1. Qué cambia

- Añade una SDD propuesta para comparabilidad de partidas, alcance, unidades e IVA.
- Registra explícitamente lo que el código actual sí hace y las decisiones de producto que deben resolverse antes de implementar.
- Actualiza el índice y el contexto para reflejar ES-1.1 validada/promocionada y ES-1.2 pendiente de revisión.
- No cambia código ni comportamiento de la aplicación.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Verificación de formato documental | `git diff --check` | PASS — diff de esta entrega basado en el SHA indicado arriba | `205e84c83180b6b822a19e78063deae78d330a32` |
| Revisión de rutas/tipos del parser y Budget Review | Lectura de `src/lib/ocr/budget-parser.ts`, `src/lib/ingestion/types.ts`, `src/lib/budget-review/service.ts`, `src/lib/budget-review/advanced-analysis.ts` y tests relacionados | PASS — el baseline y sus límites se reflejan en la spec | `205e84c83180b6b822a19e78063deae78d330a32` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Lint, typecheck, tests y build | NOT_RUN — entrega solo documental; la política requiere `git diff --check` |
| Tests focales de ES-1.2 | NOT_RUN — no existe implementación ni se modificó código |
| QA visual/runtime o acceso a Neon/Blob | NOT_RUN — no hay cambio de interfaz ni se crearon datos |

## 4. Checklist para validar en la aplicación

No aplica a esta entrega, que solo define la SDD. Toni debe revisar y decidir los siguientes puntos antes de autorizar código:

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | SDD ES-1.2 §2 y §8 | Confirmar si el flujo inicial compara dos ofertas o solo informa de faltas/diferencias dentro de una oferta. | Alcance explícito que corresponda al flujo aceptado. | Revisión documental de Toni | Sí |
| 2 | SDD ES-1.2 §8 | Aprobar dimensiones obligatorias, catálogo inicial de inclusiones/exclusiones y comportamiento ante `UNKNOWN`. | Reglas conservadoras y comprensibles, sin equivalencias inferidas. | Revisión documental de Toni | Sí |
| 3 | SDD ES-1.2 §8 | Confirmar aliases de unidad, conversiones, regla de IVA y si resultados se derivan o persisten. | Decisiones registradas antes de implementación; propuesta por defecto: aliases cerrados, sin conversión, IVA desconocido sin normalizar, sin migración. | Revisión documental de Toni | Sí |
| 4 | SDD ES-1.2 §8 | Confirmar el límite con ES-1.2.R. | No se muestra juicio de precio con referencias no aprobadas; el estado sigue `NO_REFERENCE` hasta habilitar una fuente gobernada. | Revisión documental de Toni | Sí |

### Casos negativos y de borde

| # | Caso para la fase de implementación | Resultado esperado |
| --- | --- | --- |
| 1 | Unidad o cantidad desconocida | No comparable; explicación explícita, sin conversión inferida. |
| 2 | IVA incluido/desglosado/ausente en cada lado | El dato ausente se mantiene desconocido; no se calcula un total normalizado por defecto. |
| 3 | Descripciones parecidas con alcance diferente o no especificado | No se afirma equivalencia por similitud textual. |
| 4 | Ítems dimensionalmente compatibles pero sin fuente de precios aprobada | Compatibilidad de dimensiones separada; precio permanece `NO_REFERENCE`. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [ ] Error · [ ] Éxito · [ ] Móvil · [ ] Escritorio · [ ] Modo oscuro (sin interfaz modificada en esta entrega)

## 5. Riesgos y limitaciones

- El producto actual recibe una oferta por revisión; el flujo de comparar dos ofertas no está verificado ni se asume como existente.
- `BudgetLineItem` no tiene campos estructurados de IVA, inclusiones, exclusiones o alcance normalizado.
- Los fixtures de ES-1.1 miden extracción en textos sintéticos; no prueban comparabilidad ni precisión sobre documentos reales.
- La SDD permanece propuesta hasta que Toni resuelva las decisiones bloqueantes. ES-1.2.R y sus referencias de precios se mantienen separadas.

## 6. Decisión de Toni

- [ ] Revisé la SDD propuesta de ES-1.2.
- [ ] Acepto el alcance y las decisiones por defecto.
- [ ] Solicito cambios antes de autorizar implementación. Motivo: ______________________
- [ ] Autorizo implementación de ES-1.2 en una instrucción posterior.
- [ ] No se solicita promoción: no hay cambios de aplicación.
