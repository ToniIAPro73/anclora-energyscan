# Informe de ejecución — ES-1.1 extracción y localización de partidas

**Estado:** implementación preparada en `development`; aceptación de producto pendiente de Toni. No promocionada.
**SHA de partida:** `73b83dce7c528375a2a51a3aa615480c8b0b7e70`.
**SHA de código verificado:** `13a19448a3ca754bab85d4e924c543651a56c08b`.
**Spec/plan:** `feature-energyscan-budget-extraction-localization-spec-v1.md`, `plan-v1.md` y `tasks-v1.md`.

## Cambios

- El parser tabular reconoce cantidades con unidad (por ejemplo, `3 kWp`) y precios unitarios tabulares sin incorporarlos a la descripción.
- Categorías de medidas y `UNKNOWN` se presentan en ES, CA, EN, DE, FR, IT y PT, tanto al importar como en resultados guardados. Una categoría desconocida usa un fallback localizado.
- Se añadió un corpus de tres fixtures exclusivamente sintéticos: cinco partidas, con unidades distintas y formatos inline, tabular y línea de puntos.
- No se añadió OCR, proveedor, dependencia, migración ni almacenamiento de texto bruto.

## Métrica del corpus sintético

La comparación es exact match del valor normalizado esperado por fixture. Ausencias de cantidad/unidad/precio unitario en una línea sin medición se excluyen del denominador.

| Campo | Coincidencias / valores aplicables | Resultado |
|---|---:|---:|
| Descripción | 5/5 | 100% |
| Cantidad | 4/4 | 100% |
| Unidad | 4/4 | 100% |
| Precio unitario | 4/4 | 100% |
| Total de partida | 5/5 | 100% |
| Categoría canónica | 5/5 | 100% |
| **Total** | **27/27** | **100% en estos fixtures** |

Este porcentaje describe solo los casos sintéticos versionados; no estima exactitud en documentos reales ni representa una muestra estadística de presupuestos.

## Fixtures y huellas

| Fixture | SHA-256 |
|---|---|
| `tests/fixtures/energyscan/es-1.1/budget-fixtures.json` | `2e1a749eadb9f6e314347615176182f2c8f32a7057cd27306af14a8b5ae6ca12` |

Los fixtures contienen cinco partidas de prueba. No incluyen personas, empresas, direcciones, referencias catastrales ni presupuestos reales.

## Verificación

| Comprobación | Comando | Resultado en SHA de código |
|---|---|---|
| Tests focales ES-1.1, parser y CEE existente | `npm test -- --runInBand tests/budget-extraction-localization.test.ts tests/budget-ingestion.test.ts tests/ocr-parsers.test.ts tests/cee-parser-premium.test.ts` | PASS; 4 suites / 25 tests |
| Lint | `npm run lint` | PASS |
| Typecheck | `npx tsc --noEmit` | PASS |
| Suite completa | `npm test -- --runInBand` | PASS; 82 suites / 569 tests |
| Build | `npm run build` | PASS |
| `git diff --check` | `git diff --check` | PASS antes del commit de código |
| QA visual con documento importado | — | NOT_RUN; revisión manual de Toni pendiente; la evidencia automatizada cubre helper/locales y parser, no layout en navegador |
| Corpus autorizado real / OCR escaneado | — | NOT_RUN; no se incorporaron documentos reales ni se eligió/añadió motor OCR |

La secuencia final fue lint → typecheck → tests completos → build, una sola vez y sin paralelizar.

## Límites y revisión pendiente

- El parser es heurístico y rule-based. `27/27` no permite inferir precisión fuera de los formatos diseñados.
- La extracción de PDF en general, PDFs escaneados y Tesseract/PaddleOCR no se implementaron ni probaron en esta fase.
- Toni debe revisar el wording/traducción de las etiquetas, especialmente en CA/FR/IT/PT y la etiqueta `UNKNOWN`.
- Las tareas ES-1.2/ES-1.2.R de equivalencia, precios y comparabilidad quedan fuera de este cambio.
