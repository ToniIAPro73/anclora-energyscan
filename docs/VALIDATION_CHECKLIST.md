# Checklist de validación — QA visual de Budget Review (2026-10-14)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** `anclora-energyscan`
**Rama y SHA de código bajo prueba:** `development` @ `d509905172b9ffde3f6eb2893821e239d646ea30`
**Entorno:** runtime local de development, `http://localhost:3000`, según `docs/qa/visual-qa-runbook.md`.
**Datos:** no se crearon presupuestos. Se usó la identidad QA persistente; no se usó una cuenta personal.

## 1. Alcance

- Verificación solicitada: Budget Review sin umbrales universales; cada partida con importe debe mostrar `NO_REFERENCE`; no debe aparecer alerta de total alto.
- Solo inspección. No se modificó código ni se generaron PDFs.

## 2. Comprobado por el agente

| Comprobación | Método | Resultado | SHA |
| --- | --- | --- | --- |
| Checkout de código solicitado | `git cat-file -t d509905172b9ffde3f6eb2893821e239d646ea30`; confirmación como ancestro de `development` | PASS; commit presente y es ancestro del checkout actualizado | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Login QA | Runbook: runtime local, `agent-browser --session budget-review-qa auth login qa-es01`; estado de `/api/auth/session` | PASS; sesión autenticada HTTP 200 | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Revisiones antiguas guardadas | `/dashboard`, lectura del contador y lista de presupuestos | PASS; cero presupuestos guardados, no había revisión antigua que abrir | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| QA visual A/B, siete locales y PDF | Bloqueado antes de crear datos | BLOCKED; `scripts/qa/teardown-qa-data.ts` no permite borrar una fila `BudgetReview` individual. No se crearán registros en la base compartida sin limpieza acotada autorizada | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Diff de documentación | `git diff --check` | PASS | `d509905172b9ffde3f6eb2893821e239d646ea30` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Presupuesto A y presupuesto B en pantalla | Cada análisis crea una fila persistente; no hay teardown por ID de presupuesto |
| ES/EN/DE escritorio y móvil | No hay review A/B que renderizar de forma segura |
| CA/FR/IT/PT y texto visible de `NO_REFERENCE` | No hay review que renderizar de forma segura |
| PDF de A y B en ES | No se crearon reviews pagadas; no había reviews antiguas guardadas |
| Borrado de datos de prueba con `npm run qa:teardown` | No se creó ningún dato de prueba |

## 4. Checklist manual pendiente

| # | Pantalla | Pasos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| 1 | Presupuesto A | Crear solo tras disponer de teardown acotado; usar partidas sintéticas >450 €/ud. y <25 €/ud., con total <30.000 € | Ninguna etiqueta alto/bajo/en rango ni color rojo; cada partida con `NO_REFERENCE` localizada | BLOCKED |
| 2 | Presupuesto B | Crear presupuesto sintético con total >30.000 € | No aparece «Presupuesto alto» | BLOCKED |
| 3 | ES/EN/DE | Repetir A/B en 1440×900 y 390×844 | Etiquetas localizadas, sin umbrales visuales ni recortes | BLOCKED |
| 4 | CA/FR/IT/PT | Cambiar idioma y revisar pantalla | Registrar literalmente el fallback visible de `NO_REFERENCE`; pantalla no falla | BLOCKED |
| 5 | PDF ES | Descargar PDF A y B | Tabla con la misma etiqueta de la pantalla, sin «alto/bajo» | BLOCKED |
| 6 | Revisiones anteriores | Abrir las revisiones guardadas de QA, si existen | `NO_REFERENCE` en pantalla y PDF | PASS — no había revisiones guardadas |

### Casos negativos y de borde

| Caso | Resultado esperado | Estado |
| --- | --- | --- |
| Importe unitario alto o bajo | Sin clase alto/bajo ni estado en rango; `NO_REFERENCE` | NOT_RUN — bloqueado por limpieza |
| Total superior a 30.000 € | Sin alerta «Presupuesto alto» | NOT_RUN — bloqueado por limpieza |
| Revisión histórica | Normalización a `NO_REFERENCE` | No aplicable: cero revisiones QA guardadas |

## 5. Riesgos y limitaciones

- El runtime local usa la base de datos Production según `.anclora/PRODUCTION_RUNTIME.md`.
- El teardown permite borrar por `--assessment-id` o borrar la identidad completa; no acepta `BudgetReview.id`. El modo de identidad excedería el alcance autorizado de limpiar solo lo creado.
- No se observaron defectos visuales porque la pantalla A/B y sus PDFs no se pudieron validar. No se promociona.

## 6. Decisión de Toni

- [ ] QA A/B, idiomas, tamaños y PDF completados
- [x] No se promociona. Reanudar QA cuando exista una limpieza acotada autorizada o datos de revisión sintéticos ya disponibles.
