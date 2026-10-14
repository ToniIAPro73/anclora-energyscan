# Checklist de validación — QA visual de Budget Review (2026-10-15)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** `anclora-energyscan`
**Rama y código bajo prueba:** `development` @ `d509905172b9ffde3f6eb2893821e239d646ea30` (ancestro de `e8470835fb8579584e2ddd58d119b75ca40e3d4e`)
**Entorno:** runtime local de development, `http://localhost:3000`, con variables de development según `docs/qa/visual-qa-runbook.md`.
**Datos:** presupuestos enteramente sintéticos; identidad persistente `qa-es01`. No se usó una cuenta personal.

## 1. Qué cambia

- QA solicitada para Budget Review sin umbrales de precio, con `NO_REFERENCE` en cada partida y sin alerta de total alto.
- No se cambió código de aplicación. La matriz visual de locales usó respuestas de análisis sintéticas interceptadas en navegador después de crear A y B mediante el flujo real.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Código bajo prueba | `git merge-base --is-ancestor d509905172b9ffde3f6eb2893821e239d646ea30 HEAD` | PASS; commit bajo prueba está en `development` | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Login y análisis A/B real | Runbook; `vc env run -- sh -c 'AUTH_URL=http://localhost:3000 npm run dev'`; `qa-es01`; análisis desde `/budget-review` | PASS. A: 2 partidas, total 1.220 EUR, unidad >450 y unidad <25. B: total 35.000 EUR. El análisis real en EN mostró `No comparable reference`; B no mostró alerta de total alto. | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Pantalla A/B ES/EN/DE, escritorio y móvil | `agent-browser` a 1440×900 y 390×844. Respuesta de análisis interceptada con fixtures sintéticos para recorrer locales/tamaños sin añadir filas persistentes. | PASS en los criterios de precio: ES `Sin referencia comparable`; EN `No comparable reference`; DE `Keine vergleichbare Referenz`. No aparece alto/bajo/en rango ni estado rojo; B no muestra «Presupuesto alto». Capturas inspeccionadas y luego eliminadas. | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Pantalla CA/FR/IT/PT | Selector de idioma y verificación de resultado en pantalla con fixture B | PASS, sin error de pantalla. CA muestra `Sin referencia comparable`; FR, IT y PT muestran `No comparable reference`. | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Cabecera móvil | Inspección visual en `/budget-review`, 390×844, ES/EN/DE | FAIL: la cabecera/nav queda recortada por el borde derecho. No se cambió código; la QA adicional se detuvo al observarlo. | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| PDF de A y B en ES | No ejecutado | NOT_RUN: se detuvo la QA adicional tras detectar el defecto móvil. Además, el endpoint solo exporta reviews con `paidAt`; no se inició un pago. | `d509905172b9ffde3f6eb2893821e239d646ea30` |
| Teardown acotado | `vc env run -- npm run qa:teardown -- --budget-review-id <A> --budget-review-id <B>`; repetir con `--apply` | PASS. Dry-run contó exactamente `budgetReviews: 2`; aplicación terminó `APPLIED — VERIFIED ZERO`, `budgetReviews: 0`. No se usó SQL ni `--delete-identity`. | `e8470835fb8579584e2ddd58d119b75ca40e3d4e` |
| Revisión de historial QA | Panel de QA después de crear A/B | PASS; el panel mostró únicamente las dos revisiones creadas en esta ejecución. Ambas se eliminaron en el teardown. | `e8470835fb8579584e2ddd58d119b75ca40e3d4e` |
| Diff documental | `git diff --check` | PASS | `e8470835fb8579584e2ddd58d119b75ca40e3d4e` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Descargar y revisar PDF A/B en ES | La QA se detuvo tras encontrar recorte móvil; la descarga requiere desbloqueo de pago. No se efectuó una compra. |
| Revisiones históricas previas | El panel mostró solo A/B durante esta ejecución; no había una revisión adicional que abrir. |
| Lint, typecheck, suite completa y build | NOT_RUN: cambio solo documental; runbook exige `git diff --check` para `docs/` y `specs/`. |

## 4. Checklist para validar en la aplicación

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | `/budget-review`, ES/EN/DE, escritorio 1440×900 | Crear A sintético con unidad >450 y <25 y total <30.000; crear B con total >30.000; inspeccionar partidas y alertas | `NO_REFERENCE` localizado en todas las partidas; sin alto/bajo/en rango ni rojo; B sin alerta «Presupuesto alto» | Cuenta QA persistente; datos ficticios | Sí |
| 2 | `/budget-review`, ES/EN/DE, móvil 390×844 | Repetir el caso A/B y revisar también la cabecera | Criterios de precios anteriores y cabecera completa dentro del viewport | Cuenta QA persistente; datos ficticios | Sí — la cabecera actualmente se recorta |
| 3 | `/budget-review`, CA/FR/IT/PT | Abrir B y registrar el literal de `NO_REFERENCE` | Pantalla carga; literal actual: CA `Sin referencia comparable`, FR/IT/PT `No comparable reference` | Cuenta QA persistente; datos ficticios | No |
| 4 | PDF de revisión A y B, idioma ES | Descargar solo si existe una revisión de QA con acceso pagado autorizado | Misma etiqueta que la tabla; sin alto/bajo | No iniciar pago como parte de esta QA | Sí — pendiente |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | Precio unitario >450 €/ud. | `NO_REFERENCE`; sin estado rojo ni precio alto |
| 2 | Precio unitario <25 €/ud. | `NO_REFERENCE`; sin estado rojo ni precio bajo |
| 3 | Total B >30.000 € | Sin alerta «Presupuesto alto» |
| 4 | Vista móvil 390×844 | Partidas y etiqueta legibles; la cabecera actual se recorta y requiere corrección |

### Estados de interfaz afectados
- [x] Vacío · [x] Cargando · [ ] Error · [x] Éxito · [x] Móvil · [x] Escritorio · [x] Modo oscuro

## 5. Riesgos y limitaciones

- El runtime local usa Neon Production por contrato. Solo se guardaron dos revisiones sintéticas y el teardown por ID confirmó cero filas después.
- La matriz completa por locale/viewport usó respuestas de análisis interceptadas; solo las dos creaciones iniciales pasaron por el endpoint real, para no ampliar la escritura en la base compartida.
- El exportador de PDF exige una revisión pagada. Los PDFs de A/B no se descargaron.
- Defecto observado: `/budget-review`, ES/EN/DE, 390×844: la cabecera/nav se corta horizontalmente en el borde derecho.

## 6. Decisión de Toni

- [ ] Revisar el defecto de cabecera móvil y decidir el alcance de su corrección.
- [ ] Revisar los PDFs cuando exista acceso de QA sin compra.
- [x] No se promociona.
