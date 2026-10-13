# Checklist de validación — diagnóstico de purga Blob

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Rama:** `development`

**SHA del código validado:** `921214ba26843fc92e14daff08c90ff2c4b622a1`

**Datos/entorno:** base Neon consultada en modo lectura mediante `vc env run`; token Blob exclusivamente sintético. Sin `--apply`, sin borrados y sin cambios de esquema.

## 1. Qué cambió

- El diagnóstico incluye hasta tres marcos del proyecto normalizados a rutas relativas, función y línea. Descarta mensajes, rutas absolutas, `node_modules` y marcos que no correspondan a `src/` o `scripts/`.
- La detección de errores de etapa usa una guarda estructural para conservar la etapa original en el CLI compilado por ts-node.
- Las etiquetas avanzan por `DB_CONNECT`, `DB_QUERY`, `BLOB_LIST`, `CLASSIFY` y `DELETE`. Las consultas de preflight (SELECT trivial y comprobación de esquema) quedan bajo `DB_QUERY`.
- Se reconoce el rechazo de credenciales de Vercel Blob (`BlobAccessError` / “access denied”) como `ERR_BLOB_AUTH` sin imprimir el mensaje.

## 2. Gates finales ejecutados secuencialmente

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `921214ba26843fc92e14daff08c90ff2c4b622a1` |
| Typecheck | `npx tsc --noEmit` | PASS | `921214ba26843fc92e14daff08c90ff2c4b622a1` |
| Suite completa | `npm test -- --runInBand` | PASS; 79 suites / 521 tests | `921214ba26843fc92e14daff08c90ff2c4b622a1` |
| Build | `npm run build` | PASS | `921214ba26843fc92e14daff08c90ff2c4b622a1` |
| Diff | `git diff --check` | PASS antes del commit | `921214ba26843fc92e14daff08c90ff2c4b622a1` |

No existe script npm `typecheck`; se ejecutó `npx tsc --noEmit`. Gates ejecutados una vez y en secuencia. Test focal previo: 1 suite / 19 tests PASS.

## 3. Reproducción sintética

| Caso | Resultado |
|---|---|
| Ejecución completa con token sintético inválido mediante `vc env run`, sin `--apply` | FAIL esperado en `BLOB_LIST`, `ERR_BLOB_AUTH`; exit 1 |
| Línea de proyecto en el diagnóstico | `src/lib/orphaned-assessment-blob-purge-runtime.ts`, handler de listado, línea 116 |
| Prueba de filtrado de pila | PASS; conserva como máximo 3 marcos de proyecto y excluye centinelas, rutas absolutas, rutas privadas y `node_modules` |
| Pruebas de doble para `CLASSIFY`, `DELETE`, preflight y acceso Blob | PASS |
| Token Blob real, simulación real, `--apply`, migración | NOT_RUN; Toni ejecutará su propia simulación con credencial real |

La causa del diagnóstico obsoleto era `instanceof BlobPurgeStageError`, que no reconocía de forma fiable el error compilado por el CLI y hacía que el catch exterior reutilizara `DB_CONNECT`. La guarda estructural mantiene la etapa original. El rechazo sintético del SDK ocurre durante `list`; el código seguro `ERR_BLOB_AUTH` se deriva de su error de acceso denegado.

## 4. Acciones manuales para Toni

1. Repetir la simulación real sin `--apply` con el token Blob del entorno previsto y revisar solo recuentos/bytes.
2. Confirmar que el diagnóstico se limita a etapa, clase/código/estado y marcos relativos permitidos.
3. Decidir y autorizar por separado cualquier ejecución `--apply` tras revisar el dry-run.

No se programa ni promueve la purga.
