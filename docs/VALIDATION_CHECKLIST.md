# Checklist de validación — corrección de arranque del purgador CLI

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama:** `development`

**SHA de código validado:** `3067c3e30584c72cf7c675003d2c059f825b48c9`

**Entorno:** sin credenciales reales; variables de Blob y DB ausentes o sintéticas.

## 1. Qué cambió

- Sustituí imports `@/` por relativos en la cadena compartida `prisma.ts` / `assessment-data-deletion.ts`, que cargan el CLI de purga y el teardown QA.
- Quité `tsconfig-paths/register` y la dependencia directa añadida para ello. El `tsconfig` de Next no se modificó.
- El CLI informa `Required storage configuration is unavailable.` al faltar token Blob o URL DB y termina con código 1 antes de llamar a proveedores.
- Añadí una prueba de regresión que ejecuta el CLI sin variables de almacenamiento y verifica que llega a esa guarda, además de un smoke de carga del teardown.

## 2. Gates completos, ejecutados en secuencia

| Gate | Comando | Resultado | SHA |
|---|---|---|---|
| Lint | `npm run lint` | PASS | `3067c3e30584c72cf7c675003d2c059f825b48c9` |
| Typecheck | `npx tsc --noEmit` | PASS | `3067c3e30584c72cf7c675003d2c059f825b48c9` |
| Suite completa | `npm test -- --runInBand` | PASS; 78 suites / 501 tests | `3067c3e30584c72cf7c675003d2c059f825b48c9` |
| Build | `npm run build` | PASS; dos advertencias existentes de compresión `jose` para Edge Runtime | `3067c3e30584c72cf7c675003d2c059f825b48c9` |
| Diff | `git diff --check` | PASS antes del commit | `3067c3e30584c72cf7c675003d2c059f825b48c9` |

Durante los gates, un primer typecheck encontró una anotación de test demasiado estrecha; se corrigió antes de ejecutar el paquete final. La suite final pasó.

## 3. Pruebas focalizadas y smoke checks

| Caso | Resultado |
|---|---|
| Pruebas focalizadas de purgador, borrado y arranque | PASS; 3 suites / 12 tests |
| Regresión de CLI sin variables de Blob/DB | PASS; una segunda prueba de la suite confirma teardown carga sin `MODULE_NOT_FOUND` |
| `env -u BLOB_READ_WRITE_TOKEN -u DATABASE_URL npm run blob:purge-assessment-orphans` | Código 1 esperado; salida `Required storage configuration is unavailable.`; no `MODULE_NOT_FOUND` |
| Módulos compartidos de bootstrap (`prisma` y `password`) | PASS al cargarlos sin variables; no se ejecutó el bootstrap ni se modificó identidad QA |
| Conexión a Blob/Neon y borrado real | No ejecutados; no se usaron credenciales reales |
| QA visual | NOT_RUN; el cambio solo corrige el arranque de un CLI y no modifica interfaz |

## 4. Scripts revisados

| Script | Relación con alias anterior | Resultado |
|---|---|---|
| `blob:purge-assessment-orphans` | `prisma` → `safe-logger` | Arranca y llega a la guarda de configuración |
| `qa:teardown` | `assessment-data-deletion` → `prisma` / `blob-storage` | Importa los módulos; sin argumentos falla cerrado antes de consulta o borrado |
| `qa:bootstrap-local-credentials` | `prisma` / `password` | La cadena compartida carga; no se ejecutó el bootstrap que crea o rota la identidad |
| Migración, seed y reset | Sin imports en esa cadena aliased | Sin el mismo problema identificado |

## 5. Acciones manuales para Toni

1. Ejecutar la simulación real con el token Blob de Preview, como estaba previsto. Revisar los recuentos y tamaños antes de tomar cualquier decisión.
2. No usar `--apply` hasta revisar la simulación; no se ha realizado ningún borrado real.

No se promociona este cambio.
