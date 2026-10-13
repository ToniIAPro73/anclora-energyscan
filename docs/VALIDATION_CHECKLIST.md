# Checklist de validación — preflight DB del purgador Blob

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Rama:** `development`

**SHA del código validado:** `276fe20d25bdadc9dda02396e2e4d6db676057e7`

**Datos/entorno:** comprobaciones DB de solo lectura con la configuración Vercel vigente. La ejecución completa usó exclusivamente un token Blob sintético forzado en el proceso hijo; no se usó token real, no se alcanzó Blob y no hubo borrados.

## 1. Qué cambió

- `--check-db` y la ejecución completa comparten ahora el mismo runtime y preflight: validación de lote, `$connect()`, `SELECT 1` y comprobación sin filas de `AssessmentAttachment.path`.
- El check no requiere token Blob. El preflight verifica la tabla y columna necesarias antes de intentar listar Blob.
- Los diagnósticos aceptan solo clases/códigos permitidos, incluidos `errorCode` de Prisma, y clasifican mensajes genéricos por patrones seguros. Nunca imprimen el mensaje original.
- La etapa DB se divide en `DB_CONNECT`, `DB_QUERY` y `DB_SCHEMA_CHECK` para localizar el subpaso que falla.

## 2. Gates finales ejecutados secuencialmente

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `276fe20d25bdadc9dda02396e2e4d6db676057e7` |
| Typecheck | `npx tsc --noEmit` | PASS | `276fe20d25bdadc9dda02396e2e4d6db676057e7` |
| Suite completa | `npm test -- --runInBand` | PASS; 79 suites / 519 tests | `276fe20d25bdadc9dda02396e2e4d6db676057e7` |
| Build | `npm run build` | PASS | `276fe20d25bdadc9dda02396e2e4d6db676057e7` |
| Diff | `git diff --check` | PASS antes del commit | `276fe20d25bdadc9dda02396e2e4d6db676057e7` |

No existe script npm `typecheck`; se ejecutó `npx tsc --noEmit`. Los gates se ejecutaron una sola vez y en secuencia. Los tests focales previos pasaron (20 tests).

## 3. Reproducción y comprobaciones DB

| Caso | Resultado |
|---|---|
| `vc env run` con `--check-db` y token Blob sintético | PASS; conexión, `SELECT 1` y probe de tabla/columna completados |
| Ejecución completa en la misma sesión, token Blob sintético, sin `--apply` | FAIL reproducible en `DB_CONNECT`; salida segura `error_class=Error code=ERR_DB_PREFLIGHT`; no llegó a Blob |
| Orden check y ejecución completa en una sesión `vc env run` | `--check-db` PASS seguido de ejecución completa FAIL en `DB_CONNECT / ERR_DB_PREFLIGHT` |
| Probe de esquema `AssessmentAttachment.path` | PASS con la configuración vigente; no hay evidencia de desajuste de tabla/columna |
| Queries/diagnósticos con dobles y centinelas | PASS; check y full usan connect/query/schema en el mismo orden; contenido sensible no aparece |
| Blob real, `--apply`, migración | NOT_RUN; no se usó Blob real ni se modificó la base |

## 4. Causa y límites

La diferencia de flujo entre `--check-db` y full se corrigió: ambos llaman al mismo código de preflight con el mismo límite configurado y las mismas consultas. Aun así, la ejecución completa vuelve a fallar en DB_CONNECT con un `Error` genérico sin código/cause permitido, mientras el check-db pasa. El mapeo seguro lo clasifica como `ERR_DB_PREFLIGHT`, pero la causa raíz de esa diferencia **sigue sin identificarse**.

El probe confirma que la conexión SQL vigente funciona y que existen la tabla `AssessmentAttachment` y la columna `path`. No se cambió ni migró la base. Tampoco hay evidencia para atribuir el fallo a Prisma 7, Next, SSL, URL, autenticación o timeout. La próxima ejecución de Toni con su token real debe compartir solo etapa, clase y código seguro; si sigue en DB_CONNECT, este SHA permitirá separar `DB_CONNECT`, `DB_QUERY` y `DB_SCHEMA_CHECK`.

## 5. Acción manual para Toni

1. Repetir la simulación completa sin `--apply` con el token real desde el entorno previsto.
2. Si falla, compartir solo etapa, clase permitida, código seguro y estado HTTP; no el mensaje, rutas, IDs ni credenciales.
3. No ejecutar `--apply` hasta que la causa de `ERR_DB_PREFLIGHT` esté entendida y se revisen los recuentos.

No se promociona ni se programa ninguna purga.
