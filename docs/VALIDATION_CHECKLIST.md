# Checklist de validación — ES-0.4 Baseline

> Sobrescribir en cada entrega. Validación documental; no se ha ejecutado piloto ni QA con datos externos.

**SHA de partida revisado:** `719b228415d70a35d3537f237f762bf91165940d` (`development`).
**SHA del artefacto base:** `7348a838f2d2a95785603ab8febe39d37b52f4d4` (`development`).
**Datos:** solo casos sintéticos ya existentes inline en tests; no se añadieron fixtures.

## Qué cambió

- Se creó la matriz R01–R12 con rutas, casos de test, comandos y estados honestos.
- Se registró inventario/hashes de presupuesto mixto, CEE, campo ausente y conflicto con Catastro.
- Se documentaron workflows CI, métricas y denominadores, riesgos y rollback por fase.
- Se creó una plantilla vacía de protocolo de piloto opcional. El piloto no es prerrequisito.
- Se actualizaron tareas, gates, README y CONTEXT.

## Gates ejecutados

| Gate | Resultado | Método |
|---|---|---|
| Estado/rama/referencias | PASS | `git status --short`; fetch/pull fast-forward; `git rev-parse`; refs remotas |
| Revisión de matriz/fixtures/CI | PASS | Inspección estática y hashes registrados en `es-0.4-baseline.md` |
| `git diff --check` | PASS | Sin errores de whitespace |
| `npm run lint` | NOT_RUN | Solo documentación; política de verificación por hitos |
| `npx tsc --noEmit` | NOT_RUN | Solo documentación; no se añadió código ni tests |
| `npm test` | NOT_RUN | Solo documentación; los tests citados se inventariaron, no ejecutaron |
| `npm run build` | NOT_RUN | Solo documentación; no hubo cambios de aplicación |
| Piloto/QA con usuarios | NOT_RUN | Opcional y fuera del alcance de ES-0.4 documental |

## Revisión manual para Toni

1. Revisar estados CONFIRMADO/HIPÓTESIS/PENDIENTE y casos nombrados en `specs/energyscan/000-seguridad-verdad/es-0.4-baseline.md`.
2. Confirmar que los cuatro fixtures inline son sintéticos y que sus hashes corresponden a los archivos indicados.
3. Revisar el denominador auth 5/12 y las siete celdas negativas aún sin prueba directa; decidir si se prioriza el test de payload stateless de R04.
4. Revisar mapa de CI, riesgos y SHAs anteriores de ramas en la sección rollback.
5. Confirmar que la plantilla de piloto queda vacía. No iniciar reclutamiento ni recoger datos por esta checklist.

## Casos de borde y riesgos

- R04 no tiene prueba directa de payload stateless manipulado.
- La cobertura parcial con mocks no prueba servicios reales ni QA visual integral.
- La muestra CEE contiene valores sintéticos de dirección/referencia; no reutilizarla como artefacto visual sin sustituirlos por marcadores no localizables.
- La cifra auth 5/12 usa una matriz acotada de assessment/adjunto/transferencia; no es cobertura global del producto.

**Estado:** baseline técnico listo para revisión de Toni; aceptación de producto pendiente. No promoción.
