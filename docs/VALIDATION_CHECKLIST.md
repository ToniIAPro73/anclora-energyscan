# Checklist de validación — errores de acceso en `/auth` (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y commit:** development @ `c5c755bc76739965ec99783180841180e96e29c5`

**Entorno de validación:** [Preview de development](https://anclora-energyscan-git-development-pmi140979-6354s-projects.vercel.app) · Vercel Preview desplegado

**Datos:** la pantalla es pública y no requirió sesión. El caso OAuth real descrito abajo queda para Toni, con un correo de prueba que controla; no se incluyen credenciales.

## 1. Qué cambia

- `/auth` lee el parámetro `error` y muestra una alerta accesible sin exponer los códigos internos de Auth.js.
- Siete errores de acceso tienen mensajes específicos y los códigos desconocidos muestran un mensaje genérico.
- Los mensajes se traducen al español, inglés y alemán mediante el diccionario existente; la política de vinculación de cuentas no cambia.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| ESLint | `npm run lint` | PASS, sin avisos | `c5c755bc76739965ec99783180841180e96e29c5` |
| TypeScript | `npx tsc --noEmit` | PASS | `c5c755bc76739965ec99783180841180e96e29c5` |
| Tests | `npm test -- --runInBand` | PASS, 67 suites / 463 tests; incluye 10 tests de códigos, traducciones y render de alerta | `c5c755bc76739965ec99783180841180e96e29c5` |
| Build | `npm run build` | PASS; ruta `/auth` compilada como server-rendered | `c5c755bc76739965ec99783180841180e96e29c5` |
| Integridad de diff | `git diff --check` | PASS | `c5c755bc76739965ec99783180841180e96e29c5` |
| Política de vinculación | Revisión de `src/auth.ts` y `src/auth.config.ts` | Sin cambios; no se habilitó `allowDangerousEmailAccountLinking` | `c5c755bc76739965ec99783180841180e96e29c5` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Inicio OAuth real con Google y correo ya registrado por GitHub | No se inició una autenticación externa en esta validación; Toni puede verificarlo manualmente con el caso de borde indicado abajo. |

## 4. Checklist para validar en la aplicación

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Preview `/auth?error=OAuthAccountNotLinked` | QA completado en escritorio y móvil. | PASS: alerta accesible visible con el texto requerido; formulario, botones sociales y campos siguen disponibles. Capturas en `/tmp/energyscan-auth-error-linked-final-desktop.png` y `/tmp/energyscan-auth-error-linked-final-mobile.png`. | Preview `development`; idioma español | Sí |
| 2 | Preview `/auth?error=Foo` | QA completado en escritorio y móvil. | PASS: alerta genérica sin mostrar `Foo`; formulario utilizable. Capturas en `/tmp/energyscan-auth-error-generic-final-desktop.png` y `/tmp/energyscan-auth-error-generic-final-mobile.png`. | Preview `development`; idioma español | Sí |
| 3 | Preview `/auth?error=OAuthAccountNotLinked` | Se abrió después de guardar la preferencia de idioma `en` en el navegador. | PASS: mensaje inglés traducido y formulario conservado. | Preview `development`; idioma inglés | Sí |
| 4 | Preview `/auth` | QA completado en escritorio; inspeccionar el texto de elementos `[role=alert]`. | PASS: no hay mensaje de error de acceso y el formulario se comporta como antes. | Preview `development` | Sí |
| 5 | Preview `/auth`, prueba de OAuth | Desde el botón Google, intentar entrar con un correo de prueba controlado por Toni que ya tenga una cuenta registrada mediante GitHub. | Auth.js vuelve a `/auth` con `OAuthAccountNotLinked`; se ve la explicación en español y se puede entrar luego con GitHub. No se fusionan ni vinculan cuentas automáticamente. | Toni; correo de prueba controlado por Toni y ya existente por GitHub | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | `error=AccessDenied` | Mensaje específico de acceso rechazado o permiso no concedido. |
| 2 | `error=Configuration` | Mensaje de indisponibilidad temporal, sin revelar configuración interna. |
| 3 | `error=Verification` | Mensaje que indica enlace caducado/usado y recomienda solicitar otro. |
| 4 | `error=CredentialsSignin` | Mensaje de correo o contraseña incorrectos. |
| 5 | `error=OAuthCallback` | Mensaje de que no se pudo completar la respuesta del proveedor. |
| 6 | `error=OAuthSignin` | Mensaje de que no se pudo iniciar el acceso con el proveedor. |
| 7 | `error=Foo`, `error=toString`, `error=`, código desconocido o parámetro ausente | PASS en Preview: los códigos desconocidos y vacío muestran el mensaje genérico; sin parámetro no hay texto de alerta. El contenido de la URL no aparece en el mensaje. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [x] Error · [x] Éxito · [x] Móvil · [x] Escritorio · [x] Modo oscuro

## 5. Riesgos y limitaciones

- QA visual repetido sobre el Preview del SHA final: `OAuthAccountNotLinked` y `Foo` se comprobaron en escritorio (1440×900) y móvil (390×844); `toString` y `error=` dieron mensaje genérico; la alerta y formulario siguen legibles. El caso sin error no muestra texto dentro de `[role=alert]`. Capturas en `/tmp/energyscan-auth-error-linked-final-desktop.png`, `/tmp/energyscan-auth-error-linked-final-mobile.png`, `/tmp/energyscan-auth-error-generic-final-desktop.png` y `/tmp/energyscan-auth-error-generic-final-mobile.png`.
- El caso real Google ↔ GitHub requiere un correo controlado por Toni que ya exista con GitHub. Esta validación no intenta vincular cuentas ni cambia políticas OAuth.
- Los errores de configuración y proveedores se expresan de forma genérica y orientada a la persona usuaria; no incluyen detalles internos de Auth.js.

## 6. Decisión de Toni

- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
