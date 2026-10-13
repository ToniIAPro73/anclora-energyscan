# Checklist de validación — ES-0.2 implementación (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y SHA del código validado:** `development` @ `10a04fa7dbb6f94877da250942a79b711c1f72d0`

**Despliegue:** Preview protegido `dpl_DaKaD7g91bkb3B9LqBxcXCQqkrPn` (`READY`), commit indicado por Toni `10a04fa`

**Entorno:** Vercel Preview de development; Neon y Blob vinculados a Preview; identidad QA persistente `qa-es01`.
**Datos:** un PNG sintético de 128×96 (423 B) y una valoración QA; sin documentos reales ni cuentas personales.

## 1. Qué cambió

- No hubo cambios de comportamiento ni de código en esta validación. Se repitió en el Preview protegido la ruta que previamente había dado 400 en localhost.
- La subida se completó en Preview: `POST /api/blob/upload` 200, escritura directa a Blob 200, y `POST /api/assessment` 200.
- La valoración cargó correctamente tras la recarga y mostró `Photos submitted: 1`.
- El borrado completo desde el control de la valoración, autenticado como propietario, respondió 200 y volvió al inicio. Una segunda llamada DELETE devolvió 404; una consulta de la ruta de adjunto con ID centinela bajo el assessment borrado también devolvió 404.
- La lectura PDF/presupuestos con pdf.js/Tesseract.js sigue fuera de ES-0.2.

## 2. Gates ejecutados sobre el SHA indicado

| Gate | Comando | Resultado | SHA |
| --- | --- | --- | --- |
| Lint | `npm run lint` | PASS en la implementación | `5edfbd3` |
| Typecheck | `npx tsc --noEmit` | PASS en la implementación | `5edfbd3` |
| Tests | `npm test -- --runInBand` | PASS; 76 suites / 491 tests | `5edfbd3` |
| Build | `npm run build` | PASS | `5edfbd3` |
| QA Preview protegido | `agent-browser`, sesión `preview-final` | PASS para login, upload, persistencia tras recarga y borrado completo | `10a04fa` |
| Diff | `git diff --check` | Pendiente tras actualizar documentación | Este commit |

## 3. QA funcional realizado

| Caso | Método y resultado | Estado |
| --- | --- | --- |
| Despliegue objetivo | `vc inspect` confirmó el ID indicado, target Preview y `READY`; URL inmutable del despliegue abierta con acceso protegido | PASS |
| Identidad | Login con perfil `qa-es01`; `/api/auth/session` devolvió 200 y `authenticated: true` | PASS |
| Crear valoración con adjunto | PNG sintético; `/api/blob/upload` 200, `PUT` de Blob 200 y `/api/assessment` 200. Informe marcó una foto enviada | PASS |
| Persistencia tras recarga | Recarga directa de `/assessment/{id}`; volvió a mostrar el resultado y `Photos submitted: 1` | PASS |
| Borrado individual de adjunto | El control y la lista de adjuntos solo se renderizan en el área Premium; el flujo gratuito probado no expuso la acción. No se obtuvo un ID de adjunto desde la respuesta de creación | NOT_RUN; limitación de interfaz/API observable |
| Borrado completo de valoración | Botón Delete y confirmación; `DELETE /api/assessment/{id}` respondió 200. Una repetición respondió 404 | PASS |
| Ruta de adjunto bajo la valoración borrada | GET con ID centinela de adjunto devolvió 404 después de borrar la valoración | PASS para la ruta bajo assessment inexistente; no acredita el ID real ni cero filas/objeto Blob |
| Error 400 anterior | No se repitió en Preview. El 400 previo fue contra localhost, entorno sin Blob conectado; no es evidencia de defecto en Preview | PASS de la ruta Preview |
| Vercel Runtime Logs | No se consultaron: el 400 no se reprodujo en el Preview | NOT_REQUIRED para la condición solicitada |
| Teardown QA | Se intentó el dry-run `npm run qa:teardown -- --assessment-id …`; falló cerrado con mensaje genérico después del borrado funcional. No se aplicó teardown ni hubo cambios por esa llamada | NOT_VERIFIED |

La valoración de esta ejecución se eliminó mediante la funcionalidad cuya ruta se validaba. La cuenta QA persistente se conservó. No se afirmó verificación independiente del objeto Blob ni del recuento de filas de adjuntos: el borrado de valoración respondió correctamente y el acceso posterior al adjunto fue 404, pero la interfaz gratuita no expone el control individual. No se modificó `.anclora/`.

## 4. Pasos manuales para Toni

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | `specs/energyscan/000-seguridad-verdad/es-0.2-data-flow-inventory.md` y `gates.md` | Revisa el inventario, el resultado de Preview y sus límites por SHA; confirma que los criterios de aceptación no cambiaron. | El 400 queda identificado como local; Preview upload/persistencia y borrado completo quedan registrados; borrado individual se mantiene explícitamente sin verificar. | Revisión documental | Sí |
| 2 | Vercel Preview de `development` | Configura tu propia `OPENROUTER_API_KEY` solo si decides activar el análisis visual permitido; mantén modelos en allowlist. | Solo petición elegible con `data_collection: deny`, sin PDFs/texto, sin EXIF y con imagen reducida. | Secreto gestionado por Toni | Para probar OpenRouter |
| 3 | Vercel | Configura `CRON_SECRET` para el endpoint de purga. | POST sin secreto o con secreto incorrecto devuelve 401; secreto correcto ejecuta purga. | Secreto gestionado por Toni | Sí para activar endpoint |
| 4 | Programación de tareas | Decide y configura la programación de la purga después de revisar volumen, horario y observabilidad. | Ejecución recurrente aprobada por Toni; no se programa antes de esa decisión. | Decisión de Toni | Sí |
| 5 | QA de adjuntos | Decide si habilitar el control de borrado individual para el nivel de usuario probado o proporcionar una vía de QA autorizada que exponga esa acción sin elevar la identidad QA. | Borrado individual 200, GET posterior 404 y cero filas de adjunto; no confundir con borrado completo del assessment. | `qa-es01`; Preview protegido | Sí para cerrar este caso |

## 5. Casos de borde y riesgos

- La prueba original falló en localhost porque Blob no está conectado allí. En el Preview especificado la misma ruta dio 200 en generación de token, escritura Blob y persistencia del assessment.
- El borrado completo fue exitoso y dejó de servirse el assessment; el runtime no mostró el estado del objeto Blob ni la cuenta de filas en la respuesta. El borrado individual no se validó.
- El dry-run de `qa:teardown` terminó con error genérico después de que la valoración ya no existiera. No se intentó borrar datos con SQL ni con Prisma.
- La purga por vencimiento usa pruebas con reloj controlado; no se modificaron fechas de datos live. La purga no está programada.
- OCR/PDF texto primero y OCR de escaneos siguen en fase posterior, sin cambio de comportamiento.
- No se consultaron logs de runtime porque no hubo 400 en Preview. La aceptación de Toni y `PROMOTE=FULL` siguen pendientes; no se promociona.

## 6. Decisión de Toni

- [ ] Revisé el inventario y el estado de gates por SHA.
- [ ] Apruebo o solicito cambios a ES-0.2 implementación.
- [ ] Decido cómo validar el borrado individual en la interfaz gratuita.
- [ ] Configuré mi propia clave OpenRouter para Preview, si procede.
- [ ] Configuré `CRON_SECRET` en Vercel.
- [ ] Decidí la programación de la purga.
- [ ] No promocionar hasta escribir `PROMOTE=FULL` y aprobar la entrega.
