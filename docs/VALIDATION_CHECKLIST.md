# Checklist de validación — Aviso de estimación local no verificada (2026-10-14)

**Repositorio:** anclora-energyscan

**Rama y commits:** development · código `463e179da7b32a35ae652626966e1b5b9de0f209` · documentación pendiente de commit

**Entorno de validación:** runtime local de development con `vc env run`; revisión visual con `agent-browser`
**Datos:** solicitud anónima sintética; no se usó identidad QA ni se creó una fila persistente.

## 1. Qué cambia

- Resultados con payload `local_` muestran «Estimación local no verificada» y explican que los datos del enlace pueden modificarse y el resultado no está validado por el servidor.
- El PDF básico del payload local muestra el mismo aviso localizado en ES, EN y DE.
- Valoraciones guardadas no reciben el aviso local.
- Se mantiene el flujo sin firma ni validación server-side, según decisión de Toni. El aviso no aporta integridad criptográfica.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Test focal de aviso, página/PDF y locales | `npm test -- --runInBand tests/local-assessment-notice.test.tsx` | PASS — 11 casos | `463e179da7b32a35ae652626966e1b5b9de0f209` |
| Regresiones de límites `local_` | `npm test -- --runInBand tests/local-assessment-notice.test.tsx tests/checkout.test.ts tests/attachment-access.test.ts tests/premium-access.test.ts` | PASS — 4 suites / 36 tests | `463e179da7b32a35ae652626966e1b5b9de0f209` |
| Aviso en resultados, escritorio y móvil | Runbook; `agent-browser`; payload anónimo sintético; 1280 px y 390 px | PASS — nota visible en EN/ES; `scrollWidth=390` a 390 px | `463e179da7b32a35ae652626966e1b5b9de0f209` |
| Lint | `npm run lint` | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` |
| Typecheck | `npx tsc --noEmit` | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` |
| Suite completa | `npm test -- --runInBand` | PASS — 81 suites / 558 tests | `463e179da7b32a35ae652626966e1b5b9de0f209` |
| Build | `npm run build` | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` |
| Limpieza de whitespace | `git diff --check` | PASS | `463e179da7b32a35ae652626966e1b5b9de0f209` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| QA con identidad persistente | No era necesaria: el caso de uso es stateless/anónimo y no se escribieron datos de valoración. |
| Extracción del texto de un PDF generado en runtime | La prueba inspecciona el árbol React de `BasicReport`; no renderiza bytes PDF ni prueba el endpoint con autenticación. |
| Integridad del score/propiedad de cada variante `local_` | No se implementó firma ni validación server-side; la decisión aceptada es mantener el flujo local y advertirlo. |

## 4. Checklist para validar en la aplicación

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | `/assessment/[id]` | Abrir una valoración local sintética; comprobar la nota debajo del texto de resultado en ES, EN y DE. | El aviso indica que es una estimación local no verificada y que el contenido del enlace puede modificarse. | Payload sintético `local_`; sin cuenta personal. | Sí |
| 2 | `/assessment/[id]` | Abrir una valoración local en CA, FR, IT y PT. | La nota aparece con los fallbacks actuales: CA usa ES; FR/IT/PT usan EN. | Payload sintético `local_`. | Sí |
| 3 | `/api/assessment/[id]/pdf/basic` | Descargar el PDF básico local en ES, EN y DE. | El PDF muestra la nota localizada junto a la calificación estimada. | Payload sintético; no iniciar pagos. | Sí |
| 4 | `/assessment/[id]` | Abrir una valoración guardada propia. | No aparece la etiqueta de estimación local. | Identidad QA persistente solo si se necesita una valoración guardada preexistente. | No |
| 5 | `/assessment/[id]` | Alterar un campo del enlace local de forma controlada y recargar. | El aviso sigue visible; el score continúa sin validación criptográfica y no debe tratarse como registro oficial ni como entitlement. | Solo URL/payload sintético; no compartir datos reales. | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | Payload local con `isDemo` manipulado | Sigue etiquetado como local porque la condición usa la existencia del payload stateless, no el claim `isDemo`. |
| 2 | Valoración guardada | No recibe el aviso local. |
| 3 | Vista móvil | El aviso se envuelve dentro de la tarjeta sin ampliar el documento horizontalmente. |

### Estados de interfaz afectados

- [x] Éxito · [x] Móvil · [x] Escritorio · [x] Modo oscuro · [ ] Vacío · [ ] Cargando · [ ] Error

## 5. Riesgos y limitaciones

- Los datos y el score siguen embebidos en una URL editable; el aviso informa de ello, pero el usuario puede alterar el contenido. No equivale a validación ni certificación.
- No se añadieron proveedores ni costes; el cambio es de presentación y pruebas.
- La spec mantiene R04 como HIPÓTESIS hasta que se revise la cobertura de todos los consumidores, según su criterio existente.

## 6. Decisión de Toni

- [ ] Revisé el aviso en resultados ES/EN/DE y fallbacks CA/FR/IT/PT.
- [ ] Revisé el aviso en el PDF básico.
- [x] Toni decidió mantener `local_` editable sin validación server-side, identificado como no verificado.
- [x] No se promociona. Cualquier promoción requiere orden vigente `PROMOTE=FULL`.
