# Checklist de validación — purga controlada de drafts legados

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Rama:** `development`

**SHA del código validado:** `b613ffc623d474aba920baa9baf16ee115eb808d`

**Datos/entorno:** pruebas con dobles y fixtures sintéticos. No se usó token real, no se ejecutó `--apply` y no se modificó la base.

## 1. Qué cambió

- Se reconoce para borrado solo la forma exacta `assessment-drafts/{uuid-v4}/{file}`: tres segmentos, UUID v4 válido, archivo no vacío y sin `..` ni barras.
- Legados referenciados se muestran como clase `a-legacy`; legados huérfanos mayores de 30 días son clase `b`; los recientes siguen como `c`. Otras formas permanecen en `d` y no se borran.
- Antes de cada borrado se repite la búsqueda de referencias con ambas variantes de ruta (`path` y `blob:path`). Si aparece una referencia, se omite el borrado y se refleja como `a-legacy`/`skipped_referenced`.
- El informe conserva histograma anonimizado y añade recuentos de referencias/huérfanos por franja para la forma legada. El lote sigue limitado a 100 por defecto y acepta `--batch-limit 5` para la primera ejecución de Toni.

## 2. Gates finales ejecutados secuencialmente

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `b613ffc623d474aba920baa9baf16ee115eb808d` |
| Typecheck | `npx tsc --noEmit` | PASS | `b613ffc623d474aba920baa9baf16ee115eb808d` |
| Suite completa | `npm test -- --runInBand` | PASS; 79 suites / 526 tests | `b613ffc623d474aba920baa9baf16ee115eb808d` |
| Build | `npm run build` | PASS | `b613ffc623d474aba920baa9baf16ee115eb808d` |
| Diff | `git diff --check` | PASS antes del commit | `b613ffc623d474aba920baa9baf16ee115eb808d` |

No existe script npm `typecheck`; se ejecutó `npx tsc --noEmit`. El paquete completo se ejecutó una vez y en secuencia. Tests focales previos: 2 suites / 16 tests PASS.

## 3. Casos comprobados

| Caso | Resultado |
|---|---|
| Legado referenciado | PASS; clase `a-legacy`, no se borra |
| Legado huérfano de 31 días | PASS; clase `b`, borrado por el doble en lote 5 |
| Legado huérfano de 29 días | PASS; clase `c`, se conserva |
| Referencia añadida entre listado y borrado | PASS; recheck incluye rutas con y sin `blob:`, omite el borrado y actualiza contadores |
| Formas de 2/5 segmentos, UUID inválido, nombre vacío o con `..` | PASS; clase `d`, nunca se borra |
| Prefijo ajeno | PASS; ignorado |
| Salida | PASS; sin rutas ni nombres de archivo |
| Simulación real y `--apply` | NOT_RUN; Toni ejecutará primero la simulación real |

## 4. Acción manual para Toni

Ejecutar el dry-run con token real y `--batch-limit 5`; revisar el desglose `a-legacy`/huérfanos, tamaños y franjas antes de decidir una ejecución posterior con `--apply`. Este cambio amplía la elegibilidad solo a la forma legada exacta; no ejecuta borrados reales.

No se programa ni promueve la purga.
