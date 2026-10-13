# Checklist de validación — errores de acceso en `/auth` (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y commit:** development @ `fd076a8` (Preview QA visual ejecutado sobre este commit; gates repetidas tras el fix de fallback en el siguiente cambio local)

**Entorno de validación:** [Preview de development](https://anclora-energyscan-git-development-pmi140979-6354s-projects.vercel.app) · Vercel Preview · build local

**Datos:** ficticios. Cuenta para QA funcional: identidad QA persistente `qa.energyscan@anclora.local`. La prueba real de OAuth descrita abajo queda para Toni; no se incluyen credenciales.

## 1. Qué cambia

- `/auth` lee el parámetro `error` y muestra una alerta accesible sin exponer los códigos internos de Auth.js.
- Siete errores de acceso tienen mensajes específicos y los códigos desconocidos muestran un mensaje genérico.
- Los mensajes se traducen al español, inglés y alemán mediante el diccionario existente; la política de vinculación de cuentas no cambia.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| ESLint | `npm run lint` | PASS, sin avisos | `fd076a8` (y fix de fallback en el árbol de trabajo) |
| TypeScript | `npx tsc --noEmit` | PASS | `fd076a8` (y fix de fallback en el árbol de trabajo) |
| Tests | `npm test -- --runInBand` | PASS, 67 suites / 463 tests; incluye 10 tests de códigos, traducciones y render de alerta | `fd076a8` (y fix de fallback en el árbol de trabajo) |
| Build | `npm run build` | PASS; ruta `/auth` compilada como server-rendered | `fd076a8` (y fix de fallback en el árbol de trabajo) |
| Integridad de diff | `git diff --check` | PASS | `fd076a8` (y fix de fallback en el árbol de trabajo) |
| Política de vinculación | Revisión de `src/auth.ts` y `src/auth.config.ts` | Sin cambios; no se habilitó `allowDangerousEmailAccountLinking` | `fd076a8` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| QA visual en el Preview para el nuevo fallback de códigos especiales (`toString`, `constructor`) | La protección se añadió después de capturar el Preview anterior; la prueba unitaria cubre estos valores. Se repetirá el smoke al desplegar el siguiente commit. |
| Inicio OAuth real con Google y correo ya registrado por GitHub | No se inició una autenticación externa en esta validación; Toni puede verificarlo manualmente con el caso de borde indicado abajo. |
| Pantalla sin parámetro `error` en Preview | El plan de QA solicitado cubría `OAuthAccountNotLinked` y `Foo`; el caso sin parámetro permanece en la comprobación manual. |

## 4. Checklist para validar en la aplicación

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Preview `/auth?error=OAuthAccountNotLinked` | QA completado en escritorio y móvil. | PASS: alerta accesible visible con el texto requerido; formulario, botones sociales y campos siguen disponibles. Capturas en `/tmp/energyscan-auth-error-linked-desktop-full.png` y `/tmp/energyscan-auth-error-linked-mobile.png`. | Preview `development`; idioma español | Sí |
| 2 | Preview `/auth?error=Foo` | QA completado en escritorio y móvil. | PASS: alerta genérica sin mostrar `Foo`; formulario utilizable. Capturas en `/tmp/energyscan-auth-error-generic-desktop-full.png` y `/tmp/energyscan-auth-error-generic-mobile.png`. | Preview `development`; idioma español | Sí |
| 3 | Preview `/auth?error=OAuthAccountNotLinked&lang=en` | Se seleccionó preferencia `en` en el navegador y se revisó el alerta. | PASS: mensaje inglés traducido y formulario conservado. | Preview `development`; idioma inglés | Sí |
| 4 | Preview `/auth` | Abrir la pantalla sin parámetro `error`. | No se muestra alerta de error; el formulario se comporta como antes. | Preview `development` | Sí |
| 5 | Preview `/auth`, prueba de OAuth | Usar Google con un correo que ya tenga cuenta registrada mediante GitHub. | Auth.js vuelve a `/auth` con `OAuthAccountNotLinked`; se ve la explicación en español y se puede entrar luego con GitHub. No se fusionan ni vinculan cuentas automáticamente. | Toni; correo de prueba ya existente por GitHub, controlado por Toni | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | `error=AccessDenied` | Mensaje específico de acceso rechazado o permiso no concedido. |
| 2 | `error=Configuration` | Mensaje de indisponibilidad temporal, sin revelar configuración interna. |
| 3 | `error=Verification` | Mensaje que indica enlace caducado/usado y recomienda solicitar otro. |
| 4 | `error=CredentialsSignin` | Mensaje de correo o contraseña incorrectos. |
| 5 | `error=OAuthCallback` | Mensaje de que no se pudo completar la respuesta del proveedor. |
| 6 | `error=OAuthSignin` | Mensaje de que no se pudo iniciar el acceso con el proveedor. |
| 7 | `error=Foo`, cadena vacía o código futuro | Código desconocido usa el mensaje genérico; sin parámetro no aparece alerta. El contenido de la URL nunca se imprime como mensaje. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [x] Error · [x] Éxito · [x] Móvil · [x] Escritorio · [x] Modo oscuro

## 5. Riesgos y limitaciones

- QA visual en Preview completado para ambos códigos en escritorio y móvil. Se repetirá el smoke de códigos especiales tras desplegar el fix más reciente.
- El caso real Google ↔ GitHub requiere un correo controlado por Toni que ya exista con GitHub. Esta validación no intenta vincular cuentas ni cambia políticas OAuth.
- Los errores de configuración y proveedores se expresan de forma genérica y orientada a la persona usuaria; no incluyen detalles internos de Auth.js.

## 6. Decisión de Toni

- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
