# Checklist de validación — ES-0.2 implementación (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y SHA del código validado:** `development` @ `5edfbd36dfcc6b1d083a57de77739de07f85e3c9`

**Entorno:** runtime local cargado con variables de `development`; Neon/Blob contractual; identidad QA persistente `qa-es01`
**Datos:** valoración QA sin adjunto creada y borrada mediante la nueva interfaz. Intento de adjunto sintético falló antes de persistir assessment. No se usaron documentos reales ni cuentas personales.

## 1. Qué cambió

- Vencimiento central a los 30 días desde `Assessment.createdAt`; adjuntos y datos derivados comparten el vencimiento. Lecturas owner-only, Checkout y estado de pago aplican cutoff. No requiere migración.
- Purga de Blob y filas relacionadas, reutilizada por `npm run qa:teardown`, y endpoint `POST /api/cron/purge-expired-assessments` protegido con Bearer `CRON_SECRET`. No se programó.
- Borrado completo de valoración por su propietario desde la interfaz, incluidos adjuntos, análisis y derivados.
- Logs de aplicación limitados a eventos constantes; pruebas sintéticas cubren centinelas personales, nombres, texto y conexión.
- OpenRouter restringido a allowlist cerrada de modelos `:free`, solicitudes con `provider.data_collection = deny`, solo fotos de inmueble elegibles y procesadas sin EXIF/redimensionadas. Fallback local si no hay endpoint compatible.
- Ruta de Anthropic requiere `ENABLE_ANTHROPIC_IMAGE_ANALYSIS=true` y clave; está apagada por defecto. La clave no está en Production según Toni.
- La lectura de PDF/presupuestos con pdf.js y Tesseract.js sigue fuera de este cambio.

## 2. Gates ejecutados sobre el SHA indicado

| Gate | Comando | Resultado | SHA |
| --- | --- | --- | --- |
| Lint | `npm run lint` | PASS; sin avisos ESLint | `5edfbd3` |
| Typecheck | `npx tsc --noEmit` | PASS | `5edfbd3` |
| Tests | `npm test -- --runInBand` | PASS; 76 suites / 491 tests | `5edfbd3` |
| Build | `npm run build` | PASS; compilación, tipos Next y páginas estáticas completados | `5edfbd3` |
| Diff | `git diff --check` | PASS | `5edfbd3` |

## 3. QA funcional realizado

| Caso | Método y resultado | Estado |
| --- | --- | --- |
| Identidad | `agent-browser` con la identidad persistente `qa-es01`; sesión autenticada | PASS |
| Crear valoración | Wizard, datos sintéticos, sin adjunto; valoración guardada y página de resultados abierta | PASS |
| Borrar valoración completa | Botón Delete, confirmación del usuario QA; `DELETE /api/assessment/{id}` respondió 200 y la UI volvió al inicio; el detalle quedó sin los datos | PASS |
| Upload de adjunto | PNG sintético; `POST /api/blob/upload` respondió 400; la valoración no se guardó, el wizard mostró error y no mostró éxito falso | BLOCKED por runtime/configuración Blob local |
| Expiración | Tests con reloj controlado en `createdAt + 30 días`; el cutoff deniega servicio antes de leer el adjunto y el proceso de purga selecciona `createdAt <= cutoff` | PASS automático; no se modificó fecha de datos live |
| Vercel Runtime Logs | No se consultaron logs live. Se auditó `console.*` en código y se ejecutaron pruebas de centinelas | NOT_RUN live |
| Móvil/escritorio visual | No se hicieron capturas ni revisión visual; sí se ejercitaron controles con el navegador QA | NOT_RUN visual |

La valoración QA creada en el caso de borrado fue eliminada por el mismo flujo cuya funcionalidad se estaba verificando. El intento de upload falló antes de persistir la valoración. No quedó assessment de prueba pendiente de limpiar.

## 4. Pasos manuales para Toni

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | `specs/energyscan/000-seguridad-verdad/es-0.2-data-flow-inventory.md` y `gates.md` | Revisa el inventario, las decisiones aplicadas, límites de QA y resultados por SHA. Confirma que criterios no cambiaron. | Semántica de 30 días desde `createdAt`, finalidad única y proveedores descritos correctamente; el bloqueo de Blob queda visible. | Revisión documental | Sí |
| 2 | Vercel Preview de `development` | Configura tu propia `OPENROUTER_API_KEY` si decides activar el análisis visual permitido; mantén los modelos dentro de allowlist. | Solo petición de imagen elegible con `data_collection: deny`; sin PDFs/texto, sin EXIF y con tamaño reducido. | Secreto gestionado por Toni; no compartir valor | Para probar OpenRouter |
| 3 | Vercel | Configura `CRON_SECRET` para el endpoint de purga. | El POST sin secreto o con secreto incorrecto recibe 401; el secreto correcto ejecuta la purga. | Secreto gestionado por Toni | Sí para activar endpoint |
| 4 | Programación de tareas | Decide y configura la programación de la purga después de revisar volumen, horario y observabilidad. No hay cron configurado por este cambio. | Ejecución recurrente aprobada por Toni; sin ejecución programada antes de esta decisión. | Decisión de Toni | Sí |
| 5 | Runtime QA con Blob funcional | Repite creación con PNG de inmueble sintético, recarga/persistencia, borrado de adjunto y borrado de valoración completa; usa solo `qa-es01`. Limpia cualquier artefacto restante mediante `npm run qa:teardown -- --assessment-id "$QA_ASSESSMENT_ID"` (dry-run y luego `--apply` si recuentos coinciden). | Blob vinculado y persistente; borrado owner correcto; sin acceso vencido; teardown reporta cero filas. | Identidad QA; runtime contractual | Sí |

## 5. Casos de borde y riesgos

- La subida con adjunto quedó bloqueada por HTTP 400 de `/api/blob/upload` en runtime local; este resultado no prueba un defecto del nuevo borrado o del cutoff. Repetir tras revisar la configuración local de Blob.
- Drafts Blob abandonados antes de crear una valoración no tienen `Assessment.createdAt` y no entran en esta purga; su tratamiento requiere diseño separado.
- Una falla al borrar Blob se cuenta como fallo de purga y mantiene filas para reintento. El endpoint no se programa y no se configuró `CRON_SECRET`.
- No se consultaron logs live de Vercel. El resultado de logs cubre el logger de aplicación, eventos estáticos y tests sintéticos.
- OCR/PDF texto primero y OCR de documentos escaneados siguen en fase posterior, sin cambio de comportamiento en esta entrega.
- La aprobación de Toni y `PROMOTE=FULL` no constan; no se promociona.

## 6. Decisión de Toni

- [ ] Revisé el inventario y el estado de gates por SHA.
- [ ] Apruebo o solicito cambios a ES-0.2 implementación.
- [ ] Configuré mi propia clave OpenRouter para Preview, si procede.
- [ ] Configuré `CRON_SECRET` en Vercel.
- [ ] Decidí la programación de la purga.
- [ ] Completar QA de adjunto cuando Blob local/Preview esté operativo.
- [ ] No promocionar hasta escribir `PROMOTE=FULL` y aprobar la entrega.
