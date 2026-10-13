# Checklist de validación — teardown de datos QA (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan
**Rama y commit:** development @ `HEAD d22b46f` + cambios de esta entrega (SHA final indicado en la entrega)
**Entorno de validación:** runtime local conectado al Neon declarado por el contrato; no se cambió la configuración.
**Datos:** ficticios (declaración de Toni). Identidad persistente definida por contrato; nunca se imprimió su correo completo ni se usó una cuenta personal.

## 1. Qué cambia

- Añade `npm run qa:teardown -- ...` para consultar o eliminar datos de la identidad QA con selección explícita por ID.
- La simulación es el modo por defecto. Las mutaciones requieren `--apply`; eliminar la identidad requiere además `--confirm <id>` exacto.
- El borrado de adjuntos intenta eliminar primero el objeto almacenado; cualquier fallo aborta antes de borrar filas. Las mutaciones de base de datos se agrupan en una transacción serializable y verifican recuentos a cero.
- La ruta es `scripts/qa/teardown-qa-data.ts`, según la solicitada. `.anclora/` no se modificó: `QA_TEARDOWN_TOOL` **no está declarado** en el contrato actual.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| ESLint | `npm run lint` | PASS, sin avisos | árbol de trabajo basado en `d22b46f` |
| TypeScript | `npx tsc --noEmit` | PASS | árbol de trabajo basado en `d22b46f` |
| Tests focales | `npm test -- --runInBand tests/qa-teardown.test.ts` | PASS, 6 tests | árbol de trabajo basado en `d22b46f` |
| Suite completa | `npm test -- --runInBand` | PASS, 68 suites / 469 tests | árbol de trabajo basado en `d22b46f` |
| Build | `npm run build` | PASS | árbol de trabajo basado en `d22b46f` |
| Dry-run contra Neon | `npm run qa:teardown -- --assessment-id cmv6tpfhp000006ia0rptcr36` | PASS, sin cambios: `assessments: 1`, `attachments: 0`, `attachmentAnalyses: 0`. No se usó `--apply`. | árbol de trabajo basado en `d22b46f` |
| Integridad del diff | `git diff --check` | PASS | árbol de trabajo basado en `d22b46f` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Borrado real (`--apply`) en Neon o Blob | No autorizado para el registro retenido; Toni decidirá si lo elimina. Los tests usan dobles sintéticos. |
| QA visual de interfaz | NOT_RUN: la tarea solo añade una herramienta CLI, no cambia interfaz. |
| `--delete-identity` real | NOT_RUN: es destructivo y no forma parte de la validación solicitada. |

## 4. Checklist para validar en la aplicación

Marca cada punto. Un fallo en un punto marcado **[BLOQUEANTE]** impide promocionar.

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Terminal, repo `anclora-energyscan` en `development` | Ejecuta `npm run qa:teardown -- --assessment-id cmv6tpfhp000006ia0rptcr36` sin `--apply`. | Simulación informa `assessments: 1`, `attachments: 0`, `attachmentAnalyses: 0`; no cambia filas ni objetos. Resultado del agente: PASS. | Runtime Neon del contrato; no compartir la salida con datos de configuración. | Sí |
| 2 | Terminal, mismo comando | Si Toni decide eliminar esa valoración, revisa primero que el ID sea el deseado y ejecuta `npm run qa:teardown -- --assessment-id cmv6tpfhp000006ia0rptcr36 --apply`. | Solo entonces se borran sus adjuntos y filas; salida `APPLIED — VERIFIED ZERO`. No ejecutar este paso sin decisión expresa de Toni. | Identidad QA del contrato. La persona operadora confirma el ID antes de aplicar. | Sí |
| 3 | Neon / aplicación tras el paso 2 | Repite el dry-run con el mismo ID y revisa la aplicación. | El comando rechaza el ID inexistente/no propiedad sin revelar si pertenece a otra cuenta; en la aplicación ya no aparece la valoración. | Solo si Toni decidió el borrado real en el paso 2. | Sí |
| 4 | Terminal, fixtures de test | Revisa que `npm test -- --runInBand tests/qa-teardown.test.ts` incluya controles de propiedad, fallo Blob, confirmación de identidad y ausencia de secretos en salida. | Los seis tests focales pasan. | Doblados sintéticos, sin credenciales reales. | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | ID inexistente o perteneciente a otra identidad | Abortado con respuesta genérica y sin acceder al almacenamiento ni borrar filas. |
| 2 | Falla la eliminación del objeto Blob | Abortado; no se ejecuta borrado de filas. Si un borrado externo previo tuvo éxito y falla un objeto posterior, el objeto ya eliminado no puede restaurarse automáticamente. |
| 3 | Falta `--apply` | Solo simulación; ninguna llamada de borrado. |
| 4 | `--delete-identity` con `--confirm` ausente o distinto del ID QA | Abortado antes de tocar Blob o base de datos. |
| 5 | Ruta de adjunto fuera del prefijo/ruta permitida | Abortado de forma cerrada, sin intentar borrar ese objeto. |
| 6 | Error DB durante mutación o verificación | Transacción revertida; CLI no presenta éxito y no imprime detalles de conexión. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [ ] Error · [ ] Éxito · [ ] Móvil · [ ] Escritorio · [ ] Modo oscuro (no aplica: CLI sin interfaz)

## 5. Riesgos y limitaciones

- La eliminación de Blob no participa en la transacción de Neon. Se ejecuta antes de borrar filas; si Blob falla, las filas quedan intactas. Si varios objetos se eliminan y uno posterior falla, los objetos anteriores pueden quedar eliminados aunque la transacción DB no se inicie o revierta.
- El modo `--delete-identity` es destructivo; exige `--confirm <id QA>` y `--apply`. No se ejecutó contra datos reales.
- El contrato no declara `QA_TEARDOWN_TOOL`; se usó la ruta indicada en la tarea y no se editó `.anclora/`.
- El build mostró el build terminó correctamente. La consulta Neon mostró una advertencia del driver sobre alias SSL; no se cambiaron valores de configuración.

## 6. Decisión de Toni

- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
