# Checklist de validación — ES-1.1 partidas sintéticas localizadas (2026-10-14)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y commit de código:** development @ `13a19448a3ca754bab85d4e924c543651a56c08b`

**Entorno de validación:** local, Jest; no se usaron servicios externos

**Datos:** cinco partidas ficticias versionadas; sin identidad QA ni filas persistentes.

## 1. Qué cambia

- La extracción de filas tabulares conserva cantidad, unidad y precio unitario fuera de la descripción.
- Las categorías canónicas de medidas se muestran traducidas en la importación del wizard y los resultados guardados para ES, CA, EN, DE, FR, IT y PT.
- Se añade un fixture de texto sintético con formatos inline, tabular y línea de puntos, con cinco partidas y seis campos medidos.
- No se modifica el esquema, no se añade OCR ni se incorporan proveedores o dependencias.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
|---|---|---|---|
| Prueba focal de extracción/localización, parser y CEE | `npm test -- --runInBand tests/budget-extraction-localization.test.ts tests/budget-ingestion.test.ts tests/ocr-parsers.test.ts tests/cee-parser-premium.test.ts` | PASS — 4 suites / 25 tests | `13a19448a3ca754bab85d4e924c543651a56c08b` |
| Exactitud fixture por campo | Test `ES-1.1 synthetic budget extraction` | PASS — 27/27 aplicables: descripción 5/5, cantidad 4/4, unidad 4/4, precio unitario 4/4, total 5/5, categoría 5/5 | `13a19448a3ca754bab85d4e924c543651a56c08b` |
| Categorías traducidas y fallback | Test `ES-1.1 budget category localization` | PASS — 84 combinaciones (12 categorías × 7 locales) | `13a19448a3ca754bab85d4e924c543651a56c08b` |
| Lint | `npm run lint` | PASS | `13a19448a3ca754bab85d4e924c543651a56c08b` |
| Typecheck | `npx tsc --noEmit` | PASS | `13a19448a3ca754bab85d4e924c543651a56c08b` |
| Suite completa | `npm test -- --runInBand` | PASS — 82 suites / 569 tests | `13a19448a3ca754bab85d4e924c543651a56c08b` |
| Build | `npm run build` | PASS | `13a19448a3ca754bab85d4e924c543651a56c08b` |
| Diff documental | `git diff --check` | PASS, antes del commit documental | `13a19448a3ca754bab85d4e924c543651a56c08b` |

Los cuatro gates finales se ejecutaron una sola vez, en orden: lint → typecheck → tests completos → build. El SHA de fixture está en `sdd/features/energyscan-budget-extraction-localization/execution-report.md`.

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
|---|---|
| QA visual en navegador con presupuesto importado | Se probaron las etiquetas y el parser con Jest; no se inició un runtime local ni se subió un PDF. Revisión visual manual pendiente. |
| Fixture PDF, PDF escaneado u OCR | Esta entrega mide el parser de texto; no elige ni implementa motor OCR. |
| Corpus real autorizado | No se emplearon documentos reales; 27/27 no es una estimación de precisión en producción. |
| Base de datos, Blob o ruta de importación autenticada | No eran necesarios para las pruebas sintéticas y no se modificó información persistente. |
| Revisión del copy por Toni | Pendiente de comprobar las etiquetas en contexto de producto, incluidos CA/FR/IT/PT. |

## 4. Checklist para validar en la aplicación

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
|---|---|---|---|---|---|
| 1 | `/wizard`, importación de presupuesto | Usar un presupuesto sintético propio con filas por m², ud. y kWp; revisar el resumen y el detalle de medidas en ES, CA, EN, DE, FR, IT y PT. | Cantidad, unidad, precio y total permanecen separados; los nombres de categoría están localizados y no aparecen códigos como `ENVELOPE_FACADE`. | Fixture o presupuesto creado por Toni; no subir un documento real. | Sí |
| 2 | Resultados de una valoración sintética que ya tenga un presupuesto importado | Abrir los resultados en cada locale soportado. | La categoría se presenta en el idioma seleccionado; se conserva la descripción de la partida. | Solo registro ficticio propio/QA; no crear filas de prueba sin teardown autorizado. | Sí |
| 3 | Fila no energética o sin categoría | Revisar una línea de gestión/obra general. | Se muestra “Sin clasificar” o su traducción; no se le asigna una medida energética. | Fixture sintético. | Sí |
| 4 | Vista móvil del detalle | Revisar una etiqueta larga en el ancho habitual de móvil. | El texto envuelve o cabe sin recortar importes ni ampliar horizontalmente la página. | Navegador compartido según el runbook visual. | No |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
|---|---|---|
| 1 | Fila tabular `3 kWp` con precio separado | La descripción no incluye cantidad ni precio; unidad y valores quedan en sus campos. |
| 2 | Categoría técnica desconocida recibida en JSON persistido | Fallback traducido; nunca expone el identificador técnico al usuario. |
| 3 | Unidad no indicada | Cantidad/unidad/precio unitario no inflan la métrica de cobertura; se conserva descripción y total si existen. |
| 4 | Texto ambiguo sin evidencia de medida energética | Categoría `UNKNOWN`; no se fuerza equivalencia ni recomendación. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [ ] Error · [x] Éxito · [x] Móvil · [x] Escritorio · [ ] Modo oscuro

## 5. Riesgos y limitaciones

- Los casos son sintéticos y diseñados; la cobertura exacta mide solo ese corpus. No respalda una afirmación de precisión general.
- El parser sigue siendo heurístico. PDFs escaneados, OCR y variaciones de formato fuera de estos fixtures quedan sin medir.
- Las traducciones de categorías requieren revisión de Toni. No se ejecutó revisión de copy ni QA visual del flujo.
- No se cambiaron los criterios de ES-1.1/ES-1.2, el esquema, la retención ni proveedores.

## 6. Decisión de Toni

- [ ] Revisé las etiquetas y el comportamiento con partidas sintéticas en todos los locales indicados.
- [ ] Acepto ES-1.1.
- [ ] No acepto. Motivo: ______________________
- [ ] Se promociona: escribir `PROMOTE=FULL` en una instrucción vigente.
