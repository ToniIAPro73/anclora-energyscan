# Checklist de validación — ejecución de teardown QA (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan

**Rama y commit:** development @ `7b83101` (base de esta entrega; SHA de documentación en Git)

**Entorno de validación:** runtime local con variables de `development` de Vercel; `AUTH_URL` local para el flujo QA

**Datos:** ficticios. Cuenta persistente: `qa.energyscan@anclora.local`; no se eliminó.

## 1. Qué se ejecutó

- Se eliminó la valoración QA `cmv6tpfhp000006ia0rptcr36` usando exclusivamente `scripts/qa/teardown-qa-data.ts`.
- La herramienta confirmó `APPLIED — VERIFIED ZERO` para valoraciones, adjuntos y análisis de adjuntos.
- La identidad QA se conservó y pudo iniciar sesión en el entorno local con configuración de `development`.
- `--delete-identity` no se ejecutó.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Estado inicial y actualización | `git status --short`; `git fetch origin --prune`; `git pull --ff-only origin development` | PASS; árbol limpio, rama `development`, base `7b83101` | `7b83101` |
| Herramienta contractual | Lectura de `.anclora/PRODUCTION_RUNTIME.md` | PASS; declara `QA_TEARDOWN_TOOL=scripts/qa/teardown-qa-data.ts` | `7b83101` |
| Dry-run inicial | `npm run qa:teardown -- --assessment-id cmv6tpfhp000006ia0rptcr36` | PASS; `assessments: 1`, `attachments: 0`, `attachmentAnalyses: 0`; sin cambios | `7b83101` |
| Borrado autorizado | `npm run qa:teardown -- --assessment-id cmv6tpfhp000006ia0rptcr36 --apply` | PASS; `APPLIED — VERIFIED ZERO`; `assessments: 0`, `attachments: 0`, `attachmentAnalyses: 0` | `7b83101` |
| Dry-run posterior con el mismo ID | `npm run qa:teardown -- --assessment-id cmv6tpfhp000006ia0rptcr36` | Resultado esperado tras borrar: la valoración ya no existe. La herramienta abortó y solo mostró `QA teardown failed; no secrets or database details are displayed.` | `7b83101` |
| Login de identidad QA | `agent-browser` en `http://localhost:3000/auth`, runtime con variables `development` y `AUTH_URL` local; comprobación de `/api/auth/session` | PASS; HTTP `200`, sesión autenticada. No se imprimieron credenciales ni datos de sesión | `7b83101` |
| Eliminación de identidad QA | No se ejecutó `--delete-identity` | PASS; la identidad sigue disponible y pudo iniciar sesión | `7b83101` |

La salida del `--apply` es la verificación de recuentos cero. El dry-run posterior no es un método válido para confirmar un ID borrado: el guardia exige que la valoración exista y aborta cuando no la encuentra. El mensaje genérico no distingue ese caso de un fallo real; queda pendiente mejorar el diagnóstico de la herramienta. No se hicieron consultas SQL ni operaciones directas con Prisma.

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Login de QA directamente en Preview | El acceso automatizado al deployment redirigió a la pantalla de login de Vercel; el flujo habitual de QA se validó en local con las variables de `development`. |
| Repetición del dry-run del ID tras el borrado con salida de recuentos | La herramienta rechaza IDs inexistentes y devuelve un mensaje genérico. El `--apply` ya informó `APPLIED — VERIFIED ZERO` con los tres recuentos a cero. |

## 4. Checklist para validar en la aplicación

Marca cada punto. Un fallo en un punto marcado **[BLOQUEANTE]** impide promocionar.

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Preview de `development`, `/auth` | Inicia sesión con la cuenta QA persistente usando su método de acceso habitual. | Inicio correcto; la sesión queda autenticada. | Cuenta QA del contrato; no usar la cuenta personal de Toni. | Sí |
| 2 | Aplicación, lista de valoraciones | Busca `cmv6tpfhp000006ia0rptcr36`. | La valoración eliminada no aparece. | Sesión QA. | Sí |
| 3 | Herramienta QA, modo simulación | Si se repite el dry-run para el ID eliminado, confirma que la valoración sigue ausente; espera que la herramienta devuelva su error genérico actual. | No se recrean ni eliminan datos; el mensaje se interpreta junto con `APPLIED — VERIFIED ZERO`. | No añadir `--apply`; no usar `--delete-identity`. | No |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | Ejecutar dry-run con el ID ya eliminado | La herramienta aborta porque no encuentra la valoración. El mensaje actual no identifica explícitamente “no encontrada”; mejora pendiente. |
| 2 | Iniciar sesión con la cuenta QA persistente | La sesión funciona; la identidad permanece. |
| 3 | Seleccionar `--delete-identity` | No se ejecutó ni forma parte de esta validación. No eliminar la identidad QA. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [ ] Error · [x] Éxito · [ ] Móvil · [x] Escritorio · [ ] Modo oscuro

## 5. Riesgos y limitaciones

- El mensaje genérico `QA teardown failed; no secrets or database details are displayed.` no diferencia un ID inexistente de otros fallos del teardown. Mejorar el diagnóstico es trabajo pendiente; no se cambió el código de la herramienta.
- El acceso de navegador automatizado al Preview fue redirigido por la protección de Vercel. El login se verificó mediante el flujo local de QA con variables de `development`; Toni puede repetirlo directamente en Preview.
- La identidad QA sigue persistente. `--delete-identity` no se ejecutó.

## 6. Decisión de Toni

- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
