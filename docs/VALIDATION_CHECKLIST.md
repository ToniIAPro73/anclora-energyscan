# Checklist de validación — ES-1.2 comparabilidad de presupuestos

> Este fichero se sobrescribe en cada entrega. La evidencia permanente queda en Git.

**Repositorio:** `anclora-energyscan`
**Rama:** `development`
**SHA de implementación validado:** `7111ef151af875a3e85c9fb2820c38440e7edb84`
**Runtime:** local con variables development; identidad persistente QA `qa-es01`
**Datos:** dos textos sintéticos; no se crearon revisiones, valoraciones, adjuntos ni pagos.

## 1. Qué cambió

- Comparación estructural y transitoria de dos presupuestos de texto en `/budget-review`.
- Endpoint `POST /api/budget-review/compare`, sin persistencia, telemetría ni logs de contenido.
- Emparejamiento por descripción normalizada exacta. Duplicados se alinean por orden; excedentes ambiguos quedan sin emparejar.
- Categoría, unidad y cantidad muestran `MATCH`, `MISMATCH` o `UNKNOWN` localizados. Alcance e IVA siempre indican desconocido.
- Importes reconocidos se muestran por separado en EUR. No se calcula diferencia, ranking ni valoración de precio; todas las partidas conservan `NO_REFERENCE`.
- Copy de comparación en ES, CA, EN, DE, FR, IT y PT. Ajuste de espaciado móvil en Budget Review para evitar que el navbar tape el título.
- Sin cambios de esquema, proveedores, dependencias, ni uso de Blob/Neon para la comparación. El análisis individual, pagos y PDF siguen en su flujo actual.

## 2. Gates ejecutados

Todos corresponden al contenido de implementación `7111ef151af875a3e85c9fb2820c38440e7edb84`; se ejecutaron secuencialmente antes de documentar y hacer push.

| Gate | Comando | Resultado | SHA |
| --- | --- | --- | --- |
| Lint | `npm run lint` | PASS — sin warnings ni errores | `7111ef151af875a3e85c9fb2820c38440e7edb84` |
| Typecheck | `npx tsc --noEmit` | PASS | `7111ef151af875a3e85c9fb2820c38440e7edb84` |
| Suite completa | `npm test -- --runInBand` | PASS — 84 suites, 580 tests | `7111ef151af875a3e85c9fb2820c38440e7edb84` |
| Build | `npm run build` | PASS — compilación y generación de páginas correctas | `7111ef151af875a3e85c9fb2820c38440e7edb84` |
| Diff documental | `git diff --check` | PASS | commit documental posterior |

No hay gates NOT_RUN de código para esta entrega.

## 3. QA realizado

| Comprobación | Método | Resultado |
| --- | --- | --- |
| Identidad QA | Runbook `docs/qa/visual-qa-runbook.md`; login de `qa-es01`; sesión HTTP 200 autenticada | PASS |
| Flujo dos textos | Introducción sintética por la interfaz; coincidencia estructural, importe separado y etiqueta `NO_REFERENCE` | PASS |
| Contrato del endpoint | `POST /api/budget-review/compare` con textos sintéticos | PASS — estado 200, `Cache-Control: no-store`, `scope=UNKNOWN`, `vat=UNKNOWN`, `priceStatus=NO_REFERENCE` |
| Privacidad | Test con centinela en cabecera sintética; inspección de ruta sin logs/analytics/persistencia | PASS — centinela ausente de `console.log`, `console.warn` y `console.error`; no se escribieron datos |
| Siete idiomas | Navegación y comprobación de título del comparador en ES, CA, EN, DE, FR, IT y PT; tests de copy y estados para los siete locales | PASS |
| Móvil, 390×844 | `agent-browser`; captura revisada y retirada; título queda debajo del navbar; `scrollWidth=390` | PASS |
| Escritorio, 1440×900 | `agent-browser`; captura revisada y retirada; `scrollWidth=1440`; espaciado superior conservado | PASS |
| Datos/pagos/PDF | Revisión del flujo stateless; no se creó una revisión ni se inició pago | PASS — teardown no necesario; comparación de PDFs no forma parte de esta fase |

### Fixtures sintéticos y cobertura

| Fixture | SHA-256 | Casos representados |
| --- | --- | --- |
| `tests/fixtures/budget-comparison-a.txt` | `ea5487ca28045206a6941d4c850a103745dc61cc2ee0b9bd18222ae21fd18689` | Dos partidas con unidades y cantidades ficticias |
| `tests/fixtures/budget-comparison-b.txt` | `327d01ff8bafa8769c742f363aa7d9e8388017387c633e03320f067c380199e0` | Las mismas partidas con cantidad e importe distintos |

- Pruebas focalizadas: 11 tests de comparador/API/localización, PASS.
- Cobertura de dimensiones en pruebas: 3 dimensiones comparables (categoría, unidad, cantidad); 2 dimensiones abstencionistas (alcance e IVA siempre `UNKNOWN`).
- La suite completa ejecutada contiene 84 suites y 580 tests.

## 4. Pasos manuales para Toni

1. Revisar `/budget-review` y confirmar que la separación entre análisis individual y comparación de dos ofertas resulta clara.
2. Pegar dos presupuestos ficticios en los campos A y B. Confirmar partidas emparejadas/no emparejadas, importes independientes en EUR y etiquetas localizadas.
3. Confirmar que alcance e IVA indican desconocido y que no aparecen diferencias monetarias, ranking, recomendación o juicio de precio.
4. Revisar la copia en ES, CA, EN, DE, FR, IT y PT, y el layout en escritorio y móvil.
5. Confirmar el límite de ES-1.2 con ES-1.2.R: aquí no se consumen referencias de precio. La aceptación de Toni queda pendiente; no se ha promovido.

## 5. Casos de borde y riesgos

- Descripción distinta o ausente: no se empareja por similitud; aparece bajo “solo en A/B”.
- Descripciones duplicadas con el mismo número: se emparejan en orden de entrada. Si sobra alguna en un lado, se marca ambigua.
- Unidad no reconocida o ausente: estado desconocido; no hay conversión entre magnitudes.
- Cantidad ausente o distinta: desconocido o no coincide; no se modifica la cantidad.
- Categoría inferida solo desde texto por el clasificador existente; no equivale a validación profesional.
- Alcance y tratamiento de IVA no se extraen en v1; permanecen desconocidos y pueden impedir una comparación real.
- Se acepta texto pegado (20 a 80.000 caracteres por oferta); PDF/OCR comparativo queda fuera de ES-1.2.
- Las ofertas pueden contener datos personales: el endpoint no las persiste ni registra, pero el usuario debe evitar pegar información identificativa innecesaria.
- `NO_REFERENCE` no es una valoración de precio. La fase ES-1.2.R requiere autorización y evidencia separadas.

## 6. Decisión de Toni

- [x] Flujo de dos presupuestos confirmado.
- [ ] Revisé y acepto la implementación ES-1.2.
- [ ] Solicito cambios antes de aceptar. Motivo: ______________________________
- [ ] Cuando esté aceptada, autorizo promoción con `PROMOTE=FULL` en una instrucción explícita.
