# Checklist de validación — diagnóstico seguro del purgador Blob

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Rama:** `development`

**SHA del código validado:** `9a53e1a99ae094360db87c5e89164d59d94e1353`

**Datos/entorno:** pruebas con dobles y centinelas sintéticos. La repetición de la simulación real la hará Toni; no se usaron credenciales reales ni se llamó a Blob/Neon.

## 1. Qué cambió

- El diagnóstico del purgador identifica `DB_CONNECT`, `BLOB_LIST`, `DB_CLASSIFY` o `DELETE` (y etapas generales de configuración/purga).
- La salida de fallo contiene únicamente etapa, clase segura, código corto/propio y estado HTTP numérico si existe. No incluye mensajes/cause, rutas, nombres, IDs, tokens ni cadenas de conexión.
- Se mapean rechazos de credenciales, timeout, SSL y esquema ausente a códigos `ERR_*`. Fallos parciales de borrado siguen con el siguiente objeto y emiten diagnósticos sanitizados.
- El CLI sin variables de almacenamiento conserva su guarda exacta, previa a cualquier conexión.

## 2. Gates finales ejecutados secuencialmente

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `9a53e1a99ae094360db87c5e89164d59d94e1353` |
| Typecheck | `npx tsc --noEmit` | PASS | `9a53e1a99ae094360db87c5e89164d59d94e1353` |
| Suite completa | `npm test -- --runInBand` | PASS; 79 suites / 509 tests | `9a53e1a99ae094360db87c5e89164d59d94e1353` |
| Build | `npm run build` | PASS; dos advertencias conocidas de `jose` para Edge Runtime | `9a53e1a99ae094360db87c5e89164d59d94e1353` |
| Diff | `git diff --check` | PASS antes del commit de código | `9a53e1a99ae094360db87c5e89164d59d94e1353` |

El repositorio no define un script npm `typecheck`; se ejecutó `npx tsc --noEmit` en su lugar. No hubo fallos en el paquete final. El build ejecuta además su validación interna de lint y tipos.

## 3. Pruebas y comprobaciones

| Caso | Resultado |
|---|---|
| Dobles por `DB_CONNECT`, `BLOB_LIST`, `DB_CLASSIFY` y `DELETE` | PASS; etapa y clase presentes |
| Centinelas de token y ruta en errores sintéticos | PASS; ausentes de toda salida de diagnóstico |
| Mapeo de credenciales, timeout, SSL y esquema | PASS; códigos propios seguros |
| Fallo parcial de borrado | PASS; el lote continúa y conserva contadores |
| CLI con variables de Blob/DB ausentes | PASS de arranque; código 1 esperado y salida `Required storage configuration is unavailable.`; sin `MODULE_NOT_FOUND` |
| Simulación real del almacén | NOT_RUN por petición de Toni; la repetirá él y compartirá el diagnóstico seguro |
| `--apply` / borrado real | NOT_RUN; no se ejecutó |
| QA visual | NOT_RUN; cambio CLI/backend sin cambios de interfaz |

## 4. Hipótesis a validar en la siguiente simulación

- `mode: 'expanded'` controla la forma de respuesta de Blob `list()`; no selecciona acceso public/private. El token debe pertenecer al almacén correcto y tener autorización de lectura/listado. La etapa `BLOB_LIST` separará esta causa.
- No se inspeccionó el valor de `DATABASE_URL`. El contrato declara Neon compartido; destino efectivo, conectividad y esquema quedan sin verificar. `DB_CONNECT` y `DB_CLASSIFY` distinguirán conectividad de esquema.
- Prisma se construye con `PrismaPg` y `Pool`; el runtime ahora hace `$connect()` explícito fuera de Next. No hay evidencia estática de adaptador ausente; la conexión real no se probó.

## 5. Acción manual para Toni

1. Ejecutar la simulación con las variables de Preview, sin `--apply`.
2. Compartir solo `stage`, clase, código y HTTP status que reporte el CLI. No compartir token, mensaje original, rutas ni IDs.
3. Revisar el resultado de la simulación antes de considerar cualquier limpieza real.

No se promociona.
