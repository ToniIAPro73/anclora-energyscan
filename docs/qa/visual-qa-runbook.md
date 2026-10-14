# Runbook de QA visual

Procedimiento verificado el 2026-10-13 para `development`, con la identidad persistente `qa-es01` de agent-browser. El runtime local carga las variables de `development` y usa la base de datos compartida descrita en `.anclora/PRODUCTION_RUNTIME.md`.

## Política de verificación por hitos

- Durante la implementación, ejecuta solo tests focalizados de los archivos tocados. Ejecuta typecheck al cerrar una unidad lógica.
- Al terminar la tarea y antes del push, ejecuta una sola vez y en secuencia: lint, typecheck, suite completa de tests y build. Repítelos únicamente si cambia código después.
- Para cambios de riesgo (autenticación, base de datos, borrado de datos o dependencias), ejecuta el paquete completo antes de cada commit que los incluya.
- Para cambios solo de documentación (`docs/`, `specs/`, Markdown), ejecuta únicamente `git diff --check`.
- Nunca ejecutes typecheck, tests y build en paralelo. En `docs/VALIDATION_CHECKLIST.md`, registra lo ejecutado y marca `NOT_RUN` con el motivo para cada gate omitido.

## 1. Elegir el modo

### Local con variables de development — modo recomendado

Este modo evita Deployment Protection de Vercel y permite usar el navegador compartido contra localhost.

```sh
vc env run -- sh -c 'AUTH_URL=http://localhost:3000 npm run dev'
```

Se comprobó que Next.js queda disponible en `http://localhost:3000`. El override de `AUTH_URL` es necesario: sin él, la sesión de Auth.js falló con `TypeError: Invalid URL` y `/api/auth/session` respondió 500. No copies variables ni credenciales al terminal o al chat.

### Preview de development protegido por Vercel

Usa este modo cuando la revisión dependa del deployment desplegado. Un `vc env run` que reutilice el `VERCEL_OIDC_TOKEN` local caducado abrió la pantalla `Login – Vercel`. En esta sesión se comprobó que ese token estaba caducado sin mostrar su valor.

Renueva el token en un fichero temporal del sistema, limitado a la rama `development` del entorno `preview`. Vercel rechaza `--environment development` junto con `--git-branch development` con `Invalid request: target must be "preview" when specifying a gitBranch`; usa `preview`:

```sh
OIDC_ENV_FILE="$(mktemp /tmp/energyscan-oidc.XXXXXX)"
trap 'if [ -e "$OIDC_ENV_FILE" ]; then unlink "$OIDC_ENV_FILE"; fi' EXIT
chmod 600 "$OIDC_ENV_FILE"
vc env pull "$OIDC_ENV_FILE" --environment preview --git-branch development --yes
```

`vc env pull` informó que una variable secreta del entorno Preview solo estaba disponible como `[SENSITIVE]`; el token OIDC sí se pudo validar y usar. No uses ese fichero como configuración completa de la app. Comprueba la caducidad mostrando únicamente el estado:

```sh
node -e "const fs=require('fs');const d=require('dotenv').parse(fs.readFileSync(process.argv[1]));const t=d.VERCEL_OIDC_TOKEN;if(!t)throw Error('OIDC token unavailable');const p=JSON.parse(Buffer.from(t.split('.')[1],'base64url').toString());if(p.exp*1000<=Date.now()){console.log('OIDC_TOKEN=EXPIRED');process.exit(2)}console.log('OIDC_TOKEN=FRESH')" "$OIDC_ENV_FILE"
```

Pasa el token al navegador en la cabecera `x-vercel-trusted-oidc-idp-token`. El comando solo muestra la salida del navegador; no imprime el token:

```sh
node -e "const fs=require('fs');const cp=require('child_process');const d=require('dotenv').parse(fs.readFileSync(process.argv[1]));const token=d.VERCEL_OIDC_TOKEN;const p=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());if(p.exp*1000<=Date.now())process.exit(2);const h=JSON.stringify({'x-vercel-trusted-oidc-idp-token':token});const r=cp.spawnSync('agent-browser',['--session','preview-runbook','open','https://anclora-energyscan-git-development-pmi140979-6354s-projects.vercel.app/auth','--headers',h],{encoding:'utf8'});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');process.exit(r.status??1)" "$OIDC_ENV_FILE"
```

Si el navegador acaba en `vercel.com/login`, no sigas con el login QA: valida la caducidad y vuelve a ejecutar `vc env pull` para renovar el token. Si el acceso funciona, borra el fichero temporal y retira el trap:

```sh
if [ -e "$OIDC_ENV_FILE" ]; then unlink "$OIDC_ENV_FILE"; fi
trap - EXIT
```

Se verificó `unlink` para limpiar estos temporales. El guardia rechazó `rm -f` con `rm -f style commands are not permitted. Use a safer approach`; no lo sustituyas por otras formas de borrado recursivo.

## 2. Login QA y comprobación de sesión

Abre el formulario y examina los controles accesibles. Si aparece el banner de cookies, pulsa “Rechazar opcionales” por nombre accesible antes de enviar el formulario; el banner cubre el botón Entrar.

```sh
agent-browser --session qa-local-check open http://localhost:3000/auth
agent-browser --session qa-local-check snapshot -i
agent-browser --session qa-local-check find role button click --name 'Rechazar opcionales'
agent-browser --session qa-local-check auth login qa-es01 --url http://localhost:3000/auth
```

El perfil `qa-es01` también puede entrar al Preview después de abrirlo con la cabecera OIDC anterior:

```sh
agent-browser --session preview-runbook find role button click --name 'Rechazar opcionales'
agent-browser --session preview-runbook auth login qa-es01
```

Comprueba la sesión leyendo solo estado y código HTTP. Este evaluador acepta cuerpo vacío, JSON vacío o JSON válido; nunca imprime correo ni datos de sesión:

```sh
agent-browser --session qa-local-check eval "fetch('/api/auth/session').then(async r=>{const raw=await r.text();let data={};try{data=raw?JSON.parse(raw):{}}catch{};return {status:r.status,authenticated:Boolean(data?.user?.email)}})"
```

Resultado esperado tras login: `status: 200`, `authenticated: true`. Si el cuerpo está vacío o no es JSON, el evaluador lo trata como sesión no autenticada y reporta `authenticated: false` sin fallar al parsear.

## 3. Capturas de escritorio y móvil

Guarda capturas solo bajo `/tmp`; no las guardes en el repositorio. Los tamaños probados fueron escritorio `1440×900` y móvil `390×844`.

```sh
QA_SHOTS="$(mktemp -d /tmp/energyscan-visual.XXXXXX)"
agent-browser --session qa-local-check set viewport 1440 900
agent-browser --session qa-local-check screenshot "$QA_SHOTS/desktop.png"
agent-browser --session qa-local-check set viewport 390 844
agent-browser --session qa-local-check screenshot "$QA_SHOTS/mobile.png"
test -s "$QA_SHOTS/desktop.png" && test -s "$QA_SHOTS/mobile.png"
```

Revisa las capturas y elimínalas al terminar:

```sh
unlink "$QA_SHOTS/desktop.png"
unlink "$QA_SHOTS/mobile.png"
rmdir "$QA_SHOTS"
```

## 4. Limpieza

- Cierra las sesiones de navegador que abriste; esto no borra el perfil guardado `qa-es01`:

  ```sh
  agent-browser --session qa-local-check close
  agent-browser --session preview-runbook close
  ```

- Detén `npm run dev` con `Ctrl-C` en su terminal.
- Borra el temporal OIDC y las capturas siguiendo los pasos anteriores. No guardes capturas en Git.
- Si creaste una valoración de prueba, asigna a `QA_ASSESSMENT_ID` su ID de esta ejecución. Revisa el dry-run y aplica el teardown solo si los recuentos coinciden con los datos que acabas de crear:

  ```sh
  npm run qa:teardown -- --assessment-id "$QA_ASSESSMENT_ID"
  npm run qa:teardown -- --assessment-id "$QA_ASSESSMENT_ID" --apply
  ```

  Se verificó la sintaxis con la herramienta contractual `scripts/qa/teardown-qa-data.ts`. No uses SQL ni Prisma directamente. No uses `--delete-identity`: la cuenta QA es persistente.

- Si creaste una revisión de presupuesto (Budget Review) de prueba, asigna a `QA_BUDGET_REVIEW_ID` su ID, visible en la respuesta de la acción de análisis (campo `id`). Revisa el dry-run y aplica solo si el recuento es exactamente el de las revisiones que acabas de crear. Acepta uno o varios `--budget-review-id`, no se combina con otros modos y aborta si la revisión no es de la identidad QA o tiene un archivo guardado:

  ```bash
  npm run qa:teardown -- --budget-review-id "$QA_BUDGET_REVIEW_ID"
  npm run qa:teardown -- --budget-review-id "$QA_BUDGET_REVIEW_ID" --apply
  ```

En la validación de este runbook no se crearon valoraciones ni adjuntos; por eso no se ejecutó teardown de datos.

## 5. Trampas conocidas

- Ejecuta gates en secuencia. Typecheck y tests ejecutados en paralelo con build pueden colisionar al escribir `.next/types`.
- El guardia bloquea imprimir secretos o mostrar el contenido de ficheros `.env*`. No uses `cat`, `printenv` o `echo` para inspeccionarlos; comprueba solo presencia, caducidad o resultado funcional.
- En el asistente, `zipcode` tiene el placeholder `28001`, que parece un valor real. Si el campo se deja vacío, el formulario falla con `Invalid input` sin una explicación clara. Escríbelo explícitamente en los datos sintéticos.
- El Preview necesita las conexiones de Neon y Blob vinculadas al entorno Preview. Si faltan, la base de datos o la subida no funcionarán; no asumas que una conexión local o Production se aplica a Preview.
- Google y Stripe están configurados solo en Production. Su ausencia o fallo de flujo en Preview no valida el flujo de proveedor; no cambies la configuración como parte del QA visual.
