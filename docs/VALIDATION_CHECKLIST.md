# Checklist de validación — runbook de QA visual (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y commit:** development @ `40ac3d4` (base de esta entrega; SHA de documentación en Git)

**Entorno de validación:** localhost con variables `development` de Vercel y Preview protegido de `development`

**Datos:** ficticios. Cuenta persistente: `qa.energyscan@anclora.local`; no se creó ni eliminó identidad.

## 1. Qué cambia

- Añade un runbook reproducible para QA visual en local y en el Preview protegido, con sesión QA, capturas y limpieza.
- Añade una referencia al runbook en `AGENTS.md`.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Identidad solicitada | `whoami`; `echo $HOME` | PASS; `toni`, `/Users/toni` | `40ac3d4` |
| Estado y sincronización | `git status --short`; `git fetch origin --prune`; `git pull --ff-only origin development` | PASS; árbol limpio y actualizado | `40ac3d4` |
| Arranque local con override | `vc env run -- sh -c 'AUTH_URL=http://localhost:3000 npm run dev'` | PASS; servidor listo en `http://localhost:3000` | `40ac3d4` |
| Login local QA | `agent-browser --session qa-local-check auth login qa-es01 --url http://localhost:3000/auth` tras rechazar cookies | PASS; perfil autenticado | `40ac3d4` |
| Sesión local | `agent-browser --session qa-local-check eval "fetch('/api/auth/session').then(async r=>{const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{}}catch{};return {status:r.status,authenticated:Boolean(data?.user?.email)}})"` | PASS; HTTP 200, `authenticated: true`; solo se imprimió estado | `40ac3d4` |
| Capturas local | `agent-browser set viewport 1440 900` y `390 844`; screenshots en directorio `mktemp` bajo `/tmp` | PASS; escritorio y móvil guardados en sistema temporal y borrados al terminar | `40ac3d4` |
| Acceso protegido Preview | `vc env pull` temporal con `--environment preview --git-branch development`; OIDC fresco pasado en `--headers` | PASS; abrió `/auth` del Preview; fichero temporal eliminado | `40ac3d4` |
| Login y sesión Preview | Perfil `qa-es01`; `fetch('/api/auth/session')` con manejo de cuerpo vacío | PASS; HTTP 200, sesión autenticada; sin imprimir datos | `40ac3d4` |
| Cierre y limpieza | `agent-browser --session ... close`; `Ctrl-C`; `unlink` de capturas y temporal OIDC | PASS; navegadores y servidor cerrados; temporales borrados | `40ac3d4` |
| Datos de aplicación | Ninguna valoración ni adjunto creado durante esta validación visual | PASS; no hacía falta ejecutar teardown en esta sesión | `40ac3d4` |
| Lint | `npm run lint` | PASS; `next lint` sin warnings ni errores | `40ac3d4` |
| Typecheck | `npx tsc --noEmit` | PASS; sin errores | `40ac3d4` |

Errores observados y corrección:

- Arrancar con `vc env run -- npm run dev` sin `AUTH_URL=http://localhost:3000` provocó `TypeError: Invalid URL` y `/api/auth/session` devolvió 500. El arranque documentado con el override local funciona.
- `vc env run` reutilizó un token OIDC caducado; el navegador mostró `Login – Vercel`. `vc env pull` con `--environment development --git-branch development` fue rechazado con `Invalid request: target must be "preview" when specifying a gitBranch`. La variante comprobada es `--environment preview --git-branch development` a un fichero temporal; el token resultante estaba fresco y el acceso funcionó.
- El guardia rechazó `rm -f` con `rm -f style commands are not permitted. Use a safer approach`. Se limpió el temporal con `unlink` sobre el fichero concreto.

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Tests y build | Cambio solo de documentación; el encargo pide lint y typecheck, no repetir test ni build. Ejecutar gates en paralelo con build puede colisionar en `.next/types`. |
| Teardown de datos | QA visual no creó valoraciones ni adjuntos; el runbook documenta `npm run qa:teardown` para los IDs creados en futuras pruebas. No se usó SQL ni Prisma directo. |

## 4. Checklist para validar en la aplicación

Marca cada punto. Un fallo en un punto marcado **[BLOQUEANTE]** impide promocionar.

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | `docs/qa/visual-qa-runbook.md` | Lee el runbook completo y confirma que los comandos y resultados reflejan el flujo QA actual. | Comandos claros para local y Preview, con token OIDC oculto, sesión, capturas y limpieza. | Sin abrir ni imprimir archivos `.env*`. | Sí |
| 2 | Local, `/auth` | Arranca con `vc env run -- sh -c 'AUTH_URL=http://localhost:3000 npm run dev'`; abre con agent-browser, rechaza opcionales y autentica con `qa-es01`. | Login correcto; `/api/auth/session` responde 200 y sesión autenticada. | Variables `development`; cuenta persistente QA. | Sí |
| 3 | Preview de `development` | Sigue la renovación OIDC temporal del runbook, accede a `/auth`, rechaza cookies y entra con `qa-es01`. | No aparece Vercel Login; sesión autenticada y el fichero temporal se elimina. | Token fresco; no compartir su valor. | Sí |
| 4 | Escritorio y móvil | Sigue los pasos de captura del runbook y revisa las imágenes guardadas temporalmente. | Capturas legibles a 1440×900 y 390×844, fuera del repositorio; temporales eliminados después. | Sesión QA. | No |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | Token OIDC caducado en `vc env run` | Vercel Login indica que el acceso no se completó; renovar con `vc env pull` a un temporal para Preview/development. |
| 2 | `vc env pull --environment development --git-branch development` | Vercel lo rechaza; usar `--environment preview --git-branch development`. |
| 3 | `zipcode` vacío | El placeholder `28001` parece un valor, pero el envío falla con `Invalid input`; escribir un código postal sintético explícito. |

### Estados de interfaz afectados

- [ ] Vacío · [x] Cargando · [x] Error · [x] Éxito · [x] Móvil · [x] Escritorio · [ ] Modo oscuro

## 5. Riesgos y limitaciones

- El runtime local es `PRODUCTION_BACKED`; trata los datos como ficticios y elimina solo los registros creados para QA con la herramienta contractual.
- El Preview solo dispone de Neon y Blob después de conectar esas integraciones al entorno Preview.
- Google y Stripe están configurados solo en Production; no uses el Preview para concluir que esos proveedores funcionan o fallan.
- El placeholder del campo `zipcode` puede ocultar que el campo obligatorio sigue vacío.
- No mostrar ni leer en consola los contenidos de `.env*` ni imprimir secretos. El runbook usa únicamente estados de presencia/caducidad y el resultado funcional.

## 6. Decisión de Toni

- [ ] Leí el runbook y confirmo que sus comandos reflejan el flujo real
- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
