# Checklist de validación — ES-0.2 etapa 1 documental (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan
**Rama y commit base:** development @ `3461de65197b94d0138bad5cb5e79d37804cddf6`
**Entorno de validación:** revisión estática del repositorio; sin uso de Preview/runtime
**Datos:** sin datos de usuario consultados. El inventario describe rutas de código y evidencia histórica enlazada.

## 1. Qué cambia

- Añade `specs/energyscan/000-seguridad-verdad/es-0.2-data-flow-inventory.md` con flujo, proveedores, límites conocidos, retención confirmada y comparativa de extracción PDF/OCR/almacenamiento.
- Registra decisiones firmes de Toni: finalidad única de generar la valoración, retención de 30 días con borrado manual anterior y regla de proveedores abiertos o de coste cero con aprobación previa de servicios externos nuevos.
- Enlaza evidencia ES-0.1 ya versionada para PNG en Blob, persistencia tras recarga, 401 sin sesión y borrado de adjunto. No amplía ese PASS al resto de la matriz.
- Presenta como propuesta posterior la lectura de PDF/presupuestos; no selecciona herramienta ni implementa comportamiento.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Identidad | `whoami`; `echo $HOME` | PASS; `toni`, `/Users/toni` | base `3461de6` |
| Estado y sincronización | `git status --short`; `git fetch origin --prune`; `git pull --ff-only origin development` | PASS; limpio antes de editar; pull sin cambios | base `3461de6` |
| Rama y ramas remotas | `git branch --show-current`; `git rev-parse HEAD`; `git rev-parse origin/development`; `git rev-parse origin/main` | PASS; rama `development`; base coincide con `origin/development`; `origin/main` permanece en SHA distinto | base `3461de6` |
| Evidencia ES-0.1 | `git show 9eece1a:docs/VALIDATION_CHECKLIST.md` | PASS acotado a PNG/valoración, persistencia, 401 y DELETE/404/cero filas; evidencia detallada en spec y permalink de commit | código probado `7eddfd2` |
| Inventario | Lectura estática de rutas, SDKs, schema Prisma y scripts referenciados en el documento | Rutas identificadas; región, plan, facturación y retención real de tenants quedan expresamente sin verificar | base `3461de6` |
| Diff documental | `git diff --check` y revisión manual de referencias/criterios | Pendiente al preparar el commit | — |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Tests, lint, typecheck y build | Solo cambia documentación; no se cambió código. |
| QA funcional/visual o consultas live a Neon, Blob y Vercel | No se implementó ni ejercitó comportamiento; no se requiere para esta revisión documental. |
| Prueba sintética de redacción de logs | Es una tarea de aceptación ES-0.2 pendiente; el inventario solo identifica puntos de logging. |
| Gate completo R05 y gates ES-0.2 | Aún falta completar controles y evidencia según criterios existentes; se mantienen `NOT_RUN`. |

## 4. Checklist manual para Toni

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | `specs/energyscan/000-seguridad-verdad/es-0.2-data-flow-inventory.md` | Revisa rutas de recepción, procesamiento, persistencia, logs y borrado. Comprueba que refleja el flujo deseado y los límites indicados. | Inventario exacto o brechas registradas; finalidad única y 30 días aparecen como decisiones firmes. | Revisión documental; no login. | Sí |
| 2 | Inventario, tablas “proveedores” y “alternativas” | Revisa quién recibe datos, regiones, retención, licencia, coste y comparativas para PDF/OCR y almacenamiento. | No se interpreta SaaS/plan/coste desconocido como coste cero; ninguna herramienta ni proveedor aparece seleccionado. | Decisión de Toni; no se activa ningún proveedor. | Sí |
| 3 | Inventario, “Arquitectura candidata” y “Propuesta documental” | Revisa qué transmitiría la opción texto primero/OCR en navegador y el alcance futuro de lectura de PDF/presupuestos. | Texto completo no se transmite ni persiste por defecto; cualquier expansión de fase se aprueba y especifica antes de codificar. | Revisión documental; fixtures sintéticos solamente. | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | El checklist histórico decía que Blob estaba bloqueado, pero evidencia posterior existe | Se enlaza el checklist `9eece1a` y se limita PASS a las afirmaciones observadas; no se marcan grants/replay/callback como PASS. |
| 2 | Región, plan o configuración de proveedor no consultados | Quedan como “no verificado”; no se presentan como hechos del tenant. |
| 3 | Procesamiento OCR futuro | Solo fixtures sintéticos; PDF texto, escaneado, corrupto, grande y con caracteres españoles deben tener salida/redacción comprobable. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [ ] Error · [ ] Éxito · [ ] Móvil · [ ] Escritorio · [x] No aplica (documentación solamente)

## 5. Riesgos y limitaciones

- La conexión Preview con Neon/Blob y la declaración de que Neon es la misma base que Production son datos contractuales/declarados; las regiones y planes no se inspeccionaron.
- El inventario de logs procede del código; no se revisaron logs live de Vercel.
- SaaS y servicios condicionados a variables de entorno pueden no estar activos; no se inspeccionó la configuración efectiva. La tabla los señala como condicionales o por verificar.
- La función de lectura PDF/presupuestos queda como propuesta posterior, sin decisión de herramienta ni cambio de criterios ES-0.3.
- La implementación de vencimiento automático puede necesitar migración; si la necesita, aplica `QA_MINIMUM_FOR_DATABASE_MIGRATION=FULL`.

## 6. Decisión de Toni

- [ ] Revisé el inventario y las comparativas
- [ ] Confirmo o corrijo la semántica de borrar derivados junto al binario al día 30
- [ ] Elijo OCR: ____________________ (sigue pendiente hasta decisión expresa)
- [ ] Elijo almacenamiento: ____________________ (sigue pendiente hasta decisión expresa)
- [ ] Apruebo el alcance de lectura de PDF para una fase posterior: ____________________
- [ ] No se promociona en esta entrega documental
