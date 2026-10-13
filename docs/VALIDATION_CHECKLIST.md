# Checklist de validación — errores de acceso en `/auth` (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y commit:** development @ `3b57ec0` (código implementado; QA Preview pendiente del despliegue de esta rama)

**Entorno de validación:** [Preview de development](https://anclora-energyscan-git-development-pmi140979-6354s-projects.vercel.app) · Vercel Preview · build local

**Datos:** ficticios. Cuenta para QA funcional: identidad QA persistente `qa.energyscan@anclora.local`. La prueba real de OAuth descrita abajo queda para Toni; no se incluyen credenciales.

## 1. Qué cambia

- `/auth` lee el parámetro `error` y muestra una alerta accesible sin exponer los códigos internos de Auth.js.
- Siete errores de acceso tienen mensajes específicos y los códigos desconocidos muestran un mensaje genérico.
- Los mensajes se traducen al español, inglés y alemán mediante el diccionario existente; la política de vinculación de cuentas no cambia.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| ESLint | `npm run lint` | PASS, sin avisos | `3b57ec0` |
| TypeScript | `npx tsc --noEmit` | PASS | `3b57ec0` |
| Tests | `npm test -- --runInBand` | PASS, 67 suites / 463 tests; incluye 10 tests de códigos, traducciones y render de alerta | `3b57ec0` |
| Build | `npm run build` | PASS; ruta `/auth` compilada como server-rendered | `3b57ec0` |
| Integridad de diff | `git diff --check` | PASS | `3b57ec0` |
| Política de vinculación | Revisión de `src/auth.ts` y `src/auth.config.ts` | Sin cambios; no se habilitó `allowDangerousEmailAccountLinking` | `3b57ec0` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| QA visual en el Preview para `OAuthAccountNotLinked` y `Foo`, escritorio y móvil | Pendiente: el push que inicia el despliegue requiere que este checklist exista. Se completará tras publicar `development`. |
| Inicio OAuth real con Google y correo ya registrado por GitHub | No se inició una autenticación externa en esta validación; Toni puede verificarlo manualmente con el caso de borde indicado abajo. |

## 4. Checklist para validar en la aplicación

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Preview `/auth?error=OAuthAccountNotLinked` | Abrir la URL en escritorio y móvil. | Alerta visible y legible con el mensaje que recomienda usar el método original; el formulario permanece disponible y no se desborda. | Preview `development`; idioma español | Sí |
| 2 | Preview `/auth?error=Foo` | Abrir la URL en escritorio y móvil. | Alerta visible con mensaje genérico; no muestra `Foo` ni detalles internos; formulario utilizable. | Preview `development`; idioma español | Sí |
| 3 | Preview `/auth?error=OAuthAccountNotLinked&lang=en` | Abrir la URL y revisar el mensaje. | Mensaje en inglés, sin modificar el formulario. | Preview `development`; idioma inglés | Sí |
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

- La validación visual del Preview está pendiente de que el push despliegue este cambio; se añadirá aquí después de comprobar ambos códigos en escritorio y móvil.
- El caso real Google ↔ GitHub requiere un correo controlado por Toni que ya exista con GitHub. Esta validación no intenta vincular cuentas ni cambia políticas OAuth.
- Los errores de configuración y proveedores se expresan de forma genérica y orientada a la persona usuaria; no incluyen detalles internos de Auth.js.

## 6. Decisión de Toni

- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
