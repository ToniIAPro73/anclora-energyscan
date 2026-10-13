# Checklist de validación — ES-0.1 autorización de adjuntos y upload (2026-10-13)

**Repositorio:** anclora-energyscan

**Rama y commit:** `development`; evidencia sobre el código incluido en el commit de entrega.

**Entorno:** runtime local de Next.js sobre el Neon operativo configurado en el repo; URLs de Auth.js sustituidas solo en el proceso local por `http://localhost:3000`. No se modificó `.env.local`, el token de Blob ni la configuración de base de datos.

**Cuenta:** `qa.energyscan@anclora.local`, identidad sintética dedicada del contrato; credenciales locales en `.env.qa.local` (modo `0600`, ignorado por Git). No se incluyen contraseñas en este checklist.

## 1. Qué cambia

- El servidor valida actor, evaluación, adjunto y acción antes de acceder al almacenamiento protegido.
- El upload anónimo se deniega; un payload, ID, URL o estado de demo no concede permisos.
- La asociación válida se guarda bajo la evaluación propietaria. Si falla la persistencia de la evaluación o sus metadatos, la API informa error e intenta compensar los objetos almacenados.
- Profesionales sin propiedad/grant explícito quedan denegados por defecto.
- El ejemplo `.env.example` documenta (comentadas) las variables QA sin secretos. `scripts/qa/bootstrap-local-credentials.ts` crea o rota únicamente la identidad QA contractual, guarda el secreto localmente y rechaza sobrescribir credenciales existentes.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | Evidencia |
| --- | --- | --- | --- |
| Asociación válida, fallos de persistencia y profesional sin grant | `npm test -- --runInBand tests/attachment-access.test.ts tests/blob-upload-authorization.test.ts tests/assessment-upload-association.test.ts` | PASS, 3 suites / 22 tests con mocks y fixtures sintéticos | Código del commit de entrega |
| Regresión de tests del repositorio | `npm test -- --runInBand` | PASS, 66 suites / 453 tests | Código del commit de entrega |
| TypeScript | `npx tsc --noEmit` | PASS | Código del commit de entrega |
| ESLint focal | `npx eslint src/app/api/assessment/route.ts tests/assessment-upload-association.test.ts tests/attachment-access.test.ts` | PASS | Código del commit de entrega |
| ESLint del proyecto | `npm run lint` | PASS, sin avisos | Código del commit de entrega |
| Build | `npm run build` | PASS; dos avisos de `jose` sobre APIs de compresión no disponibles en Edge Runtime | Código del commit de entrega |
| Integridad del diff | `git diff --check` | PASS | Código del commit de entrega |
| Bootstrap de identidad QA | `npx ts-node --compiler-options '{"module":"commonjs"}' scripts/qa/bootstrap-local-credentials.ts` | PASS. Creó la cuenta QA contractual en Neon y `.env.qa.local` con permisos `0600`; no imprimió el secreto. La identidad se conserva. | Ejecución local; archivo ignorado por Git |
| Protección ante reejecución del bootstrap | Mismo comando con `.env.qa.local` ya presente | PASS: abortó antes de acceder a DB y no sobrescribió el archivo | Salida categórica sin valores de credenciales |
| Runtime visual | `anclora-visual-qa doctor` | PASS: navegador, snapshot, captura y cierre | Runtime compartido Anclora |
| Sesión autenticada | `agent-browser auth login` usando perfil temporal | PASS. `/api/auth/session` devolvió usuario autenticado QA. Perfil temporal eliminado después. | Sesión autenticada en `localhost:3000` |
| Visual del wizard y estado de error | `agent-browser` con fixture PNG sintético de 8×8; captura `/tmp/energyscan-es01-upload-failure.png` | El archivo se muestra como adjunto y se valida en el wizard. Blob rechazó el token local (`400`, `Vercel Blob: Invalid `token` parameter`); el envío devolvió `503` y la UI mostró “No se pudo guardar la valoración con sus adjuntos”. No se mostró éxito. El rollback no reportó fallo incompleto. | Captura local temporal; no versionada |

## 3. Comprobaciones no ejecutadas (NOT_RUN)

| Comprobación | Motivo concreto |
| --- | --- |
| Éxito completo autenticado: objeto Blob, asociación persistida y apertura/descarga del adjunto | El token Blob configurado localmente fue rechazado. No se cambió ni sustituyó la configuración del servicio. La rama de éxito se cubre con mocks en pruebas, pero la validación real queda pendiente. |
| Borrado real desde interfaz y comprobación posterior de ausencia | No se creó adjunto persistente: Blob rechazó el token y la ruta compensó la operación. |
| Denegación visual sin sesión contra Blob | Cubierta por tests de ruta con mocks; no se repitió en navegador autenticado/anonimizado tras reparar el runtime visual. |
| Acceso desde otra cuenta a un adjunto ajeno real | No hay fixture real de otro usuario/adjunto preparado para este flujo; los casos de autorización se prueban con mocks. |
| Profesional con grant explícito o revocado | ES-0.1 no crea un modelo de grants; el caso pertinente es denegación por defecto y está cubierto por tests. |
| Verificación contra Blob válido, replay y firma real del callback | El token de Blob local no es válido; firma y callback se probaron con mocks del SDK. |
| Vista móvil | La comprobación visual se hizo en escritorio. |
| Migraciones | No se requieren; no se ejecutaron. |

## 4. Checklist para Toni

Los pasos **[BLOQUEANTE]** deben pasar antes de promocionar ES-0.1. Las credenciales se leen localmente desde `.env.qa.local`; el secreto no está en Git ni en este documento.

| # | Dónde | Pasos | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| 1 | Entorno de desarrollo y `/auth` | Confirma que el entorno de desarrollo autorizado tiene un token Blob válido. Inicia sesión con la cuenta QA de `.env.qa.local`. | Login correcto; no se usa cuenta personal. | **[BLOQUEANTE]** pendiente |
| 2 | `/wizard` | Añade un PNG sintético pequeño, completa los campos con datos ficticios y envía. Comprueba el estado de carga y el resultado. | La evaluación se crea y el adjunto queda asociado a ella; el éxito solo aparece después de persistir. | **[BLOQUEANTE]** pendiente |
| 3 | Evaluación y adjuntos | Abre/descarga el adjunto y luego bórralo desde la interfaz; recarga la evaluación. | El propietario puede leerlo; tras borrar, no aparece ni se sirve. Los errores no se presentan como éxito. | **[BLOQUEANTE]** pendiente |
| 4 | Sesión anónima | Cierra sesión e intenta obtener credenciales de upload por el flujo normal. | Upload denegado antes de crear un objeto. | **[BLOQUEANTE]** pendiente |
| 5 | Adjunto de otra cuenta QA | Con dos identidades sintéticas dedicadas, cambia el ID de evaluación/adjunto de una por el de la otra y prueba lectura y borrado. | Respuesta no enumerable (404); metadatos y archivo permanecen intactos. | **[BLOQUEANTE]** pendiente |
| 6 | Escritorio y móvil | Repite pasos 2–4 en ambos tamaños; revisa vacío, carga, error y éxito. | Estados comprensibles y controles utilizables; nunca se filtra un adjunto ajeno. | **[BLOQUEANTE]** pendiente |

## 5. Limitación actual y decisión

- La prueba visual autenticada sí se ejecutó, pero solo alcanzó el estado de error porque el token Blob local no es válido. No se modificó configuración. La revisión funcional del éxito queda bloqueante hasta probar con el token Blob de desarrollo correcto.
- Las pruebas automatizadas focales y las puertas de código pasan. No se declara ES-0.1 aceptada por Toni.
- Los registros/objetos creados por esta comprobación fueron sintéticos. El intento fallido no dejó una asociación conocida; el log de aplicación no informó rollback incompleto.

## 6. Decisión de Toni

- [ ] Acepto la validación funcional y visual de ES-0.1
- [ ] Solicito correcciones. Detalle: ______________________________
- [ ] No promocionar. Motivo: ______________________________
- [ ] Tras aceptar los gates, escribo `PROMOTE=FULL` para iniciar el flujo gobernado
