# Checklist de validación — diagnóstico DB del purgador Blob

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Rama:** `development`

**SHA del código validado:** `9bb3e689a32aac98010d56050b6a5863a687eb22`

**Datos/entorno:** CLI `--check-db` con configuración Vercel actual. Se eliminó `BLOB_READ_WRITE_TOKEN` del proceso hijo. El modo solo conecta a Neon y ejecuta `SELECT 1`; no lista Blob, lee tablas de negocio, ni borra datos. La salida del wrapper solo permite pasar mensajes diagnósticos seguros.

## 1. Qué cambió

- Se añadió `--check-db`, que requiere únicamente `DATABASE_URL`, conecta con el cliente Prisma normal y ejecuta `SELECT 1`. No llama a Blob.
- `BlobPurgeStageError` conserva la causa original. El diagnóstico permite mostrar solo clases conocidas y códigos aprobados de esa causa, sin mensajes, URLs ni credenciales.
- Tras conectar, la etapa general pasa a `PURGE`; las llamadas posteriores asignan `BLOB_LIST`, `DB_CLASSIFY` y `DELETE`. Así los errores de preflight posteriores a la conexión no se atribuyen a `DB_CONNECT`.
- La comprobación real pasó. La falla DB_CONNECT comunicada anteriormente no se reprodujo en la ejecución actual; su causa histórica exacta queda pendiente de la próxima simulación completa.

## 2. Gates finales ejecutados secuencialmente

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `9bb3e689a32aac98010d56050b6a5863a687eb22` |
| Typecheck | `npx tsc --noEmit` | PASS | `9bb3e689a32aac98010d56050b6a5863a687eb22` |
| Suite completa | `npm test -- --runInBand` | PASS; 79 suites / 514 tests | `9bb3e689a32aac98010d56050b6a5863a687eb22` |
| Build | `npm run build` | PASS | `9bb3e689a32aac98010d56050b6a5863a687eb22` |
| Diff | `git diff --check` | PASS antes del commit | `9bb3e689a32aac98010d56050b6a5863a687eb22` |

El repo no define el script npm `typecheck`; se ejecutó `npx tsc --noEmit`. La suite se ejecutó secuencialmente después de typecheck y antes del build.

## 3. Pruebas y comprobaciones

| Caso | Resultado |
|---|---|
| Dobles que conservan clase/código Prisma anidado | PASS; `PrismaClientInitializationError` y `P1001` permitidos, centinelas de token/ruta ausentes |
| Modo check con dobles | PASS; conecta y consulta una vez, sin invocar list/delete |
| Error posterior a conexión | PASS; preflight con límite fuera de rango se informa como `PURGE`, no `DB_CONNECT` |
| `vc env run -- env -u BLOB_READ_WRITE_TOKEN npm run blob:purge-assessment-orphans -- --check-db` | PASS; `Database check passed (DB_CONNECT).`, exit 0; solo `SELECT 1` |
| `--check-db` sin DB ni Blob | PASS cerrado; `Required database configuration is unavailable.`, exit 1 |
| `--check-db` / purga completa contra Blob, `--apply` | NOT_RUN; Toni repetirá la simulación completa con su token. No se usó credencial Blob |
| QA visual | NOT_RUN; no hubo cambios de interfaz |

## 4. Causa y límites

- **Defecto confirmado en el diagnóstico anterior:** después de `connect()` el runtime dejaba la etiqueta `DB_CONNECT` activa hasta comenzar `list()`. Cualquier error de validación/preflight en ese intervalo se mostraba como fallo de conexión. Ahora ese tramo se etiqueta `PURGE`; hay prueba reproducible con batch limit inválido.
- **Fallo DB_CONNECT histórico:** no reproducible ahora. La misma invocación Vercel pudo conectar y ejecutar `SELECT 1` sin Blob. Por ello no se atribuye la falla anterior al pooler, SSL, parámetros de Neon, adaptador o conexión fuera de Next.
- Esta consulta prueba conectividad SQL, pero no consulta filas/tablas EnergyScan; la compatibilidad del modelo/columnas se verificará en el siguiente dry-run, y se expondrá como `DB_CLASSIFY` si falla.

## 5. Acción manual para Toni

1. Repetir `npm run blob:purge-assessment-orphans` en el entorno previsto, primero sin `--apply`.
2. Si falla, compartir únicamente etapa, clase permitida, código seguro y estado HTTP; no el mensaje original ni credenciales.
3. Revisar los recuentos antes de decidir si se usa `--apply`.

No se promociona ni se programa ninguna purga.
