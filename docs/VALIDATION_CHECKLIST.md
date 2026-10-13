# Checklist de validación — ES-0.1 adjuntos y upload v1 (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y commit:** development @ `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` (código validado; este checklist se añade en el commit siguiente)
**Entorno de validación:** [Preview de development](https://anclora-energyscan-git-development-pmi140979-6354s-projects.vercel.app) · Vercel Preview, runtime desplegado

**Datos:** ficticios. Cuenta: identidad QA persistente `qa.energyscan@anclora.local`; la valoración sintética indicada abajo queda retenida por decisión de Toni. No se incluye ninguna credencial.

## 1. Qué cambia

- El flujo v1 permite adjuntar fotos PNG/JPG/WEBP con límites de cantidad y tamaño, asociarlas a una valoración y conservarlas después de recargar.
- El servidor exige sesión para autorizar la subida y limita la lectura y el borrado al propietario de la valoración.
- El formulario requiere un código postal de al menos cinco caracteres; el placeholder visual no completa el campo.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| ESLint del proyecto | `npm run lint` | PASS, sin avisos | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| TypeScript | `npx tsc --noEmit` | PASS | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Tests del repositorio | `npm test -- --runInBand` | PASS, 66 suites / 453 tests | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Build de producción | `npm run build` | PASS | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Subida válida y asociación | Preview de development, PNG sintético de 68 B; revisión de la valoración y sus metadatos | PASS. Valoración creada; ID retenido: `cmv6tpfhp000006ia0rptcr36`. La consulta confirmó un adjunto PNG asociado. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Persistencia tras recarga | Recargar `/assessment/cmv6tpfhp000006ia0rptcr36` | PASS. El resultado siguió visible y el registro conservó el adjunto. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Rechazo sin sesión | Solicitud anónima de token a `POST /api/blob/upload` | PASS, HTTP 401. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Borrado de adjunto | `DELETE /api/assessment/cmv6tpfhp000006ia0rptcr36/attachments/cmv6tpg3x000106iar411c1iw` con sesión QA | PASS, HTTP 200; GET posterior HTTP 404; verificación de base de datos: cero adjuntos asociados. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Rechazo de tipo y tamaño | Selección de tipo no permitido y archivo mayor de 10 MiB en el wizard | PASS, rechazo en cliente sin enviar la valoración. Capturas previas: `/tmp/energyscan-es01-error-type-desktop.png` y `/tmp/energyscan-es01-error-size-mobile.png`. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| QA visual de estados | `agent-browser` en Preview; capturas guardadas solo en `/tmp` | PASS en los estados vacío, cargando, error y éxito. Éxito y persistencia comprobados en escritorio y móvil; capturas recientes: `/tmp/energyscan-es01-success-persisted-desktop.png`, `/tmp/energyscan-es01-persisted-mobile.png`. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Diagnóstico de validación del wizard | Lectura del esquema Zod en `src/components/AssessmentWizard.tsx`; repetición con código postal `28001` | La primera prueba falló por datos de prueba: `zipcode` estaba vacío y exige mínimo 5 caracteres. Con un valor sintético válido el envío pasó. La UI mostró “Invalid input” sin identificar el campo. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |
| Limpieza del adjunto | DELETE y consulta posterior | PASS: el objeto/registro del adjunto fue eliminado. | `7eddfd2ca1191a4aa969a6af28486f38d0a51e23` |

La valoración sintética `cmv6tpfhp000006ia0rptcr36` se conserva sin adjunto por decisión explícita de Toni. No se intentó eliminarla ni ejecutar teardown. La identidad QA persistente y el perfil local de autenticación quedan bajo gestión de Toni.

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Lectura y borrado entre dos cuentas QA | No se preparó una segunda identidad sintética para esta ejecución. |
| Acceso a la lista de adjuntos en cuenta sin Premium | La página solo representa la lista con acceso Premium; el QA visual observó esta condición y no se cambió el entitlement. |
| Teardown de la valoración retenida | No ejecutado por decisión de Toni. EnergyScan no dispone de `QA_TEARDOWN_TOOL`; queda pendiente incorporar esa herramienta para futuras limpiezas autorizadas. |
| Repetición de lint, typecheck, test y build después de editar este documento | El cambio de esta entrega es solo documentación; las cuatro gates pasaron sobre el mismo SHA de código indicado arriba. |

## 4. Checklist para validar en la aplicación

Realizar en el Preview de development con la cuenta de Toni. Usar solo datos sintéticos. No asumir que el placeholder del código postal sea un valor.

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Preview `/auth` | Iniciar sesión con la cuenta propia de Toni. | La sesión se inicia y `/api/auth/session` devuelve HTTP 200 con usuario autenticado. | Cuenta de Toni | Sí |
| 2 | `/wizard`, pasos 1–5 | Elegir “Conocer situación actual”; completar año 1990, superficie 80, código postal sintético de 5 dígitos (por ejemplo `28001`), avanzar con valores predeterminados válidos, adjuntar PNG sintético menor de 10 MiB, aceptar el aviso y enviar. | El formulario no muestra “Invalid input”; aparece el resultado con un ID de valoración y el PNG se indica como adjunto durante el envío. | Cuenta de Toni; datos ficticios | Sí |
| 3 | Resultado de la valoración | Recargar la ruta del ID creado en el paso 2. | La valoración y su estado de éxito siguen visibles tras recargar. | Sesión de Toni | Sí |
| 4 | Resultado, sección Adjuntos | Abrir/ver el PNG y borrarlo con el control de papelera; recargar la valoración. | La lista muestra el adjunto antes de borrarlo y deja de servirlo después (404); ya no aparece en la lista. La sección solo es visible con acceso Premium. | Cuenta con acceso Premium | Sí |
| 5 | `/api/blob/upload`, sesión cerrada | Cerrar sesión y solicitar una subida por la API protegida, sin credenciales de sesión. | HTTP 401 y no se crea ningún objeto. | Navegador sin sesión | Sí |
| 6 | `/wizard`, archivo adjunto | Probar un archivo de tipo no permitido y luego uno mayor de 10 MiB. | Cada archivo se rechaza antes de enviar la valoración y se presenta un error visible. | Sesión de Toni; fixtures sintéticos | Sí |
| 7 | `/wizard` y valoración | Repetir la selección y el envío en escritorio y viewport móvil; observar vacío, carga, error y éxito. | Los estados se entienden en ambos tamaños y los controles permanecen utilizables; la persistencia se conserva al recargar. | Sesión de Toni | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | Dejar vacío `zipcode` aunque el placeholder muestre `28001` y enviar | El cliente señala el campo como inválido. Hoy el resumen genérico “Invalid input” no explica qué campo falta; rellenar 5 caracteres permite continuar. |
| 2 | Subir un tipo no permitido | Rechazo en cliente; no se envía la valoración. |
| 3 | Subir un archivo mayor de 10 MiB | Rechazo en cliente y por la validación del servidor si se fuerza la solicitud. |
| 4 | Solicitar token Blob sin sesión | HTTP 401. |
| 5 | Leer el adjunto después de borrarlo | HTTP 404; no hay bytes ni metadatos del adjunto. |

### Estados de interfaz afectados

- [x] Vacío · [x] Cargando · [x] Error · [x] Éxito · [x] Móvil · [x] Escritorio · [x] Modo oscuro

## 5. Riesgos y limitaciones

- El placeholder `28001` parece un valor, pero el campo `zipcode` comienza vacío y exige al menos 5 caracteres. Si se envía vacío, el cliente muestra “Invalid input” sin una explicación clara. En la prueba se confirmó que era un dato de prueba incompleto, no un fallo de infraestructura; la falta de detalle de la UI sigue siendo una limitación.
- La lista de adjuntos solo es visible con acceso Premium. La creación y persistencia se verificaron con la cuenta QA; el borrado se validó por su API autorizada y la asociación por sus metadatos. El listado visual requiere Premium.
- Falta `QA_TEARDOWN_TOOL` en EnergyScan; queda pendiente. Por decisión de Toni, la valoración sintética `cmv6tpfhp000006ia0rptcr36` permanece retenida bajo la cuenta QA, sin adjunto. No se ejecutó teardown ni se eliminó el perfil local de autenticación.
- El Preview depende de la conexión Neon y del almacenamiento Vercel Blob configurados para `development`.

## 6. Decisión de Toni

- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
