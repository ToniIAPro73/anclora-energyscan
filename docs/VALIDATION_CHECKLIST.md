# Checklist de validación — cabecera móvil y PDF Budget Review (2026-10-14)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** `anclora-energyscan`
**Rama:** `development`
**Código validado:** `078075016e83688ab2f734985b1f6945b6ce1716`
**Runtime:** local de development según `docs/qa/visual-qa-runbook.md`; identidad persistente `qa-es01` y sesión anónima aparte.
**Datos:** no se crearon presupuestos ni se iniciaron pagos.

## 1. Qué cambia

- La fila móvil del navbar puede ajustar sus controles en varias líneas y mantiene el botón de cuenta dentro del viewport; el nombre de cuenta se oculta en la fila móvil.
- El título de Budget Review usa 30 px bajo `sm` y recupera 36 px desde `sm`, evitando que el título alemán ensanche el documento a 320 px.
- No se cambió la lógica de exportación PDF. Se encontró una etiqueta truncada en alemán y queda pendiente su corrección.

## 2. Verificaciones realizadas

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Repositorio | `git status --short`; `git fetch origin --prune`; `git pull --ff-only origin development` | PASS antes de editar; rama `development` limpia y sincronizada | `d90b967329f073700e8673ba322eb539482fd5ed` |
| Cabecera con sesión QA | `agent-browser`: `/`, `/dashboard`, `/budget-review`; 320/360/390/430×844; ES/CA/EN/DE/FR/IT/PT; medir `scrollWidth` y elementos de cabecera | PASS, 84 combinaciones; el ancho del documento coincide con el viewport y no hay elementos de cabecera fuera del borde | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Cabecera sin sesión | `agent-browser`: las tres rutas solicitadas, ES/EN/DE, 390×844; consulta de sesión sin datos personales | PASS, 9 comprobaciones. `/dashboard` redirige a `/auth`; las rutas resultantes no desbordan | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Contenido que ensancha el documento | DOM y `document.documentElement.scrollWidth` en rutas y anchuras anteriores | PASS tras el ajuste del título alemán de Budget Review. En la landing hay un halo decorativo absoluto que llega hasta x=460 en 390 px, recortado por `.app-shell`; no altera `scrollWidth` | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Escritorio | Captura e inspección visual de Budget Review a 1440×900; lectura de tamaño calculado del título | PASS, `scrollWidth` 1440, sin overflow de cabecera, título 36 px. Las clases añadidas al segundo renglón móvil siguen bajo `md:hidden` | `078075016e83688ab2f734985b1f6945b6ce1716` |
| PDF de ejemplo ES y EN | Método b: GET `/api/budget-review/demo/pdf?lang=es` y `?lang=en`; extracción temporal con `pdftotext`. La ruta renderiza `BudgetReviewReport` | PASS: cinco filas muestran `Sin referencia comparable` / `No comparable reference`, sin etiquetas antiguas de precio | `078075016e83688ab2f734985b1f6945b6ce1716` |
| PDF de ejemplo DE | GET `/api/budget-review/demo/pdf?lang=de`; extracción temporal con `pdftotext` | FAIL: la etiqueta de las cinco filas aparece truncada como `Keine vergleichbare Ref-`; revisar la columna de estado (20%) en `src/lib/pdf/BudgetReviewReport.tsx` | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Lint | `npm run lint` | PASS, sin avisos ni errores | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Typecheck | `npx tsc --noEmit` | PASS | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Suite completa | `npm test -- --runInBand` | PASS, 80 suites / 534 tests | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Build | `npm run build` | PASS | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Limpieza de presupuestos de prueba | `npm run qa:teardown -- --budget-review-id ...` | NOT_RUN: no se crearon registros ni adjuntos | `078075016e83688ab2f734985b1f6945b6ce1716` |
| Capturas | Runbook; capturas locales revisadas con `view_image`, después retiradas de `/tmp` | PASS; sin datos personales y no añadidas al repositorio | `078075016e83688ab2f734985b1f6945b6ce1716` |

## 3. Validación manual para Toni

| # | Dónde | Pasos | Resultado esperado |
| --- | --- | --- | --- |
| 1 | `/`, `/dashboard`, `/budget-review`, móvil | Con la cuenta QA y sin sesión, revisar a 320×844, 390×844 y 430×844 en ES, EN y DE. En el selector, recorrer también CA, FR, IT y PT. Confirmar que cabecera, selector, tema y cuenta no quedan cortados y que no aparece scroll horizontal | `document.documentElement.scrollWidth` igual a `window.innerWidth`; ningún control de cabecera fuera del borde. Sin sesión, `/dashboard` puede redirigir a `/auth` |
| 2 | Las tres rutas, escritorio 1440×900 | Revisar navbar y contenido tras el cambio responsive | Sin cambios visuales de escritorio ni scroll horizontal |
| 3 | `/api/budget-review/demo/pdf?lang=es`, `?lang=en` y `?lang=de` | Abrir/descargar el PDF de ejemplo. No iniciar checkout ni pago. Revisar las cinco celdas de estado | ES/EN: etiqueta localizada completa. DE: actualmente FAIL; debe mostrar `Keine vergleichbare Referenz` completa, sin etiquetas de precio alto/bajo/en rango |

## 4. Casos de borde y riesgos

- En 320 px, el encabezado largo en alemán era el contenido de página que añadía ancho al documento; el tamaño menor bajo `sm` lo corrige.
- En la landing, un halo decorativo puede rebasar el borde visual del viewport; el contenedor lo recorta y la anchura del documento permanece correcta.
- El PDF demo verifica el mismo componente `BudgetReviewReport`, pero no datos persistidos de revisiones antiguas. El endpoint que exporta revisiones reales exige `paidAt`; no se inició ningún pago.
- Defecto pendiente: la etiqueta alemana no cabe en la columna PDF de estado. La comprobación PDF global permanece FAIL hasta corregirlo y volver a verificar.
- No se crearon presupuestos; no hay limpieza pendiente.

## 5. Decisión de Toni

- [ ] Revisar la cabecera móvil en 320/390/430 px y los siete idiomas.
- [ ] Decidir el siguiente cambio para la etiqueta alemana truncada en PDF.
- [x] No se inició ningún pago ni se promocionó.
