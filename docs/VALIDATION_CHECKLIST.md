# Checklist de validación — ES-0.4 R04 payloads stateless manipulados

> Sobrescribir en cada entrega. Validación documental; no se ha ejecutado piloto ni QA con datos externos.

**SHA baseline aceptado:** `719b228415d70a35d3537f237f762bf91165940d` (`development`).
**SHA de tests:** `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` (`development`).
**Datos:** payloads sintéticos fabricados en memoria; no se usó DB, Blob ni cuenta QA.

## Qué cambió

- Se probaron claims de payload `local_` manipulado en Checkout, lectura de adjuntos y acceso Premium.
- El baseline fue aceptado por Toni; esta tarea aporta evidencia parcial de R04, sin modificar código de aplicación.

## Gates ejecutados

| Gate | Resultado | Método |
|---|---|---|
| Estado/rama/referencias | PASS | `git status --short`; fetch/pull fast-forward; `git rev-parse`; refs remotas |
| Revisión de matriz/fixtures/CI | PASS | Inspección estática y hashes registrados en `es-0.4-baseline.md` |
| `git diff --check` | PASS | Sin errores de whitespace |
| `npm run lint` | PASS | SHA `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` |
| `npx tsc --noEmit` | PASS | SHA `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` |
| `npm test -- --runInBand` | PASS — 80 suites / 547 tests | SHA `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` |
| `npm run build` | PASS | SHA `d428c6d439d1317671c8eb8d8d55d986b0ab41fa` |
| Tests focales | PASS — 3 suites / 25 tests | checkout, attachment access, premium access |
| Piloto/QA con usuarios | NOT_RUN | Opcional y fuera del alcance; no hubo datos persistentes |

## Revisión manual para Toni

1. Revisar los casos nuevos en `tests/checkout.test.ts`, `tests/attachment-access.test.ts` y `tests/premium-access.test.ts`.
2. Confirmar que el payload falsificado no consulta DB al iniciar Checkout, no lee Blob privado y no abre premium con `isDemo`/`paidAt` falsificados.
3. Tener presente que el score/propiedad mostrados en una URL `local_` siguen siendo editables; la suite no verifica todas las vistas ni el PDF premium en runtime.
4. El baseline ES-0.4 fue aceptado; su plantilla de piloto sigue vacía y opcional.

## Casos de borde y riesgos

- R04 tiene pruebas focales de autorización, pero no garantiza integridad del resultado local ni cubre todos los consumidores.
- La cobertura parcial con mocks no prueba servicios reales ni QA visual integral.
- La muestra CEE contiene valores sintéticos de dirección/referencia; no reutilizarla como artefacto visual sin sustituirlos por marcadores no localizables.
- La cifra auth 5/12 usa una matriz acotada de assessment/adjunto/transferencia; no es cobertura global del producto.

**Estado:** baseline aceptado por Toni; tests R04 parciales y gates completos PASS. No promoción en esta tarea.
