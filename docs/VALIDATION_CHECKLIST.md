# Checklist de validación — ES-0.2 purga de borradores huérfanos

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama:** `development`

**SHA de código validado:** `11505916d59137c98285d71449b20e815d99be23`

**Almacén real:** no consultado. La simulación solicitada quedó bloqueada porque el entorno Preview no entregó `BLOB_READ_WRITE_TOKEN` al CLI.
**Datos:** pruebas solo con dobles y fixtures sintéticos. Sin lectura ni borrado de objetos reales.

## 1. Qué cambió

- El barrido admite solo las raíces `assessment-drafts/` y `assessments/`, y valida sus formas de clave conocidas. `avatars/` y otras raíces quedan excluidas para proteger el almacén compartido con otro proyecto.
- La paginación usa cursor y `uploadedAt`. Los objetos se clasifican por referencia a cualquier fila de adjunto y por edad: a) referenciado, b) huérfano con más de 30 días, c) huérfano de 30 días o menos.
- La simulación es el modo predeterminado. Borrar requiere `--apply`; el lote es configurable y los fallos parciales se cuentan sin interrumpir los intentos posteriores.
- El endpoint `POST /api/cron/purge-expired-assessments` invoca el purgador manteniendo Bearer `CRON_SECRET`. No se creó programación.
- El CLI no carga automáticamente configuración local; requiere que el entorno autorizado inyecte la conexión y el token correctos.
- Código: `src/lib/orphaned-assessment-blob-purge.ts`, `src/lib/orphaned-assessment-blob-purge-runtime.ts`, `scripts/purge-orphaned-assessment-blobs.ts` y pruebas asociadas.

## 2. Gates ejecutados

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `11505916d59137c98285d71449b20e815d99be23` |
| Typecheck | `npx tsc --noEmit` | PASS | `11505916d59137c98285d71449b20e815d99be23` |
| Tests | `npm test -- --runInBand` | PASS; 77 suites / 499 tests | `11505916d59137c98285d71449b20e815d99be23` |
| Build | `npm run build` | PASS; dos advertencias existentes de APIs de compresión `jose` en Edge Runtime | `11505916d59137c98285d71449b20e815d99be23` |
| Simulación Blob Preview | `vc env run -e preview --git-branch development` + CLI sin `--apply` | BLOCKED: token Blob Preview no disponible al CLI; no se consultó el almacén | `11505916d59137c98285d71449b20e815d99be23` |
| `git diff --check` | Inspección de diff | PASS | Commit documental |

La primera ejecución local del CLI resolvió los alias TypeScript, pero `vc env run` señaló que no podía entregar un secreto del entorno Preview y el proceso recibió `BLOB_READ_WRITE_TOKEN` vacío. El intento no llamó a Blob. Se quitó la carga automática del entorno local para impedir que el comando de Preview alcance accidentalmente un almacén distinto.

## 3. QA realizado

| Caso | Resultado |
|---|---|
| Paginación de ambos prefijos cerrados | PASS en dobles |
| Clasificación de adjunto referenciado | PASS; no se borra |
| Huérfano de 31 días / 29 días | PASS; el de 31 es candidato y el de 29 se conserva |
| Prefijo ajeno o clave de forma desconocida | PASS; se rechaza antes de borrar |
| Fallo parcial | PASS; sigue con el siguiente y cuenta el fallo |
| Modo simulación | PASS en dobles; `delete` no se llama |
| Salida | PASS; contiene solo recuentos y bytes, sin rutas ni IDs |
| Simulación del almacén Preview | BLOCKED por token no disponible; sin recuentos reales |
| Borrado real (`--apply`) | No ejecutado |

## 4. Pasos manuales para Toni

1. Revisar en la spec el alcance estricto de prefijos, las formas de clave, los resultados de gates y la decisión pendiente de programación.
2. Habilitar una forma autorizada para ejecutar el CLI con el token de **Preview** (mismo almacén acordado), sin recurrir a credenciales locales de otro entorno.
3. Ejecutar primero `npm run blob:purge-assessment-orphans` en simulación. Revisar recuentos y bytes por franja `0-30`, `31-90`, `>90` y tipo `a`, `b`, `c`.
4. Si los recuentos son esperados, decidir expresamente si se ejecuta `npm run blob:purge-assessment-orphans -- --apply`; el lote se limita por `BLOB_ORPHAN_PURGE_BATCH_LIMIT` (default 100, máximo 1000). No usar `--apply` antes de revisar la simulación.
5. Decidir si la purga se programa con Vercel Cron o GitHub Actions; los cambios técnicos requeridos y límites están documentados en el inventario. La programación sigue desactivada.

## 5. Casos de borde y riesgos

- El Blob está compartido con otro proyecto. Solo los dos prefijos de assessment y las formas de clave verificadas son elegibles; cualquier ampliación exige revisar el contrato y sus writers.
- `uploadedAt` mide antigüedad del objeto y no se deriva de `Assessment.createdAt`; filas referenciadas nunca se borran en este barrido.
- Un objeto huérfano que aún no supere 30 días se conserva. Los objetos elegibles que excedan el límite de lote se posponen para una ejecución futura.
- Un fallo de borrado no detiene el lote; los contadores agregados deben revisarse. La simulación real es necesaria antes de cualquier aplicación.
- No se comprobó el recuento real de objetos, fallos de Blob reales ni duración/volumen del lote. El token Preview sigue siendo una dependencia de QA.
- El endpoint mantiene POST y `CRON_SECRET`; Vercel Cron usa GET y requeriría un handler GET protegido. GitHub Actions puede llamar al POST usando un secret del repositorio. Toni debe elegir; no hay horario configurado.

## 6. Decisión de Toni

- [ ] Revisé los cambios de la spec y comparativas de programación.
- [ ] Habilité el acceso seguro del CLI al token Blob de Preview.
- [ ] Revisé los recuentos/bytes de una simulación real.
- [ ] Decidí si autorizo una ejecución `--apply` después de revisar esos recuentos.
- [ ] Decidí la opción y horario de programación; sigue sin programarse hasta esa decisión.
- [ ] No promocionar hasta escribir `PROMOTE=FULL` y aprobar la entrega.

## Registro de actualización documental de política (2026-10-13)

**Cambios:** nueva política de verificación por hitos en `docs/qa/visual-qa-runbook.md`; línea de puntero actualizada en `AGENTS.md`, `CLAUDE.md` y `GEMINI.md`.

| Comprobación | Resultado | Motivo |
|---|---|---|
| `git diff --check` | PASS | Única comprobación ejecutada para este cambio documental |
| Lint | NOT_RUN | No hubo cambios de código |
| Typecheck | NOT_RUN | No hubo cambios de código; gates completos ya ejecutados secuencialmente sobre el SHA de código `11505916d59137c98285d71449b20e815d99be23` |
| Tests focalizados | NOT_RUN | No hubo cambios de código |
| Suite completa de tests | NOT_RUN | No hubo cambios de código; no se repiten gates por cambios solo documentales |
| Build | NOT_RUN | No hubo cambios de código; no se repiten gates por cambios solo documentales |

No se realizó QA visual ni se cambió comportamiento. La simulación real de Blob continúa `BLOCKED` por falta de token Preview accesible al CLI, como se registra arriba.
