# Checklist de validación — sincronización de estado ES-0.1 y plan ES-0.2 (2026-10-13)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** anclora-energyscan
**Rama y commit:** development @ `0065396bb893a838542adbda2e4903c1280c42a0` (SHA base revisado para esta edición documental)
**Entorno de validación:** [Preview de development](https://anclora-energyscan-git-development-pmi140979-6354s-projects.vercel.app) · runtime local
**Datos:** ficticios (declaración de Toni). Cuenta: `qa.energyscan@anclora.local` (persistente; no usada en esta edición).

## 1. Qué cambia

- Registra ES-0.1 como validada por Toni y promocionada a `main`; `origin/main` y `origin/development` coinciden en el SHA base revisado.
- Marca ES-0.2 como siguiente fase y ES-0.3/ES-0.4 como pendientes, conservando intactos sus criterios de aceptación.
- Conserva en los informes las limitaciones de evidencia técnica y los pendientes conocidos de Preview, QA teardown y zipcode.
- Propone el plan de ES-0.2 en `specs/energyscan/000-seguridad-verdad/gates.md`; no implementa esa fase.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Identidad | `whoami && echo $HOME` | PASS; `toni`, `/Users/toni` | `0065396` |
| Estado y sincronización | `git status --short`; `git fetch origin --prune`; `git pull --ff-only origin development` | PASS; árbol limpio antes de editar, `development` actualizado | `0065396` |
| Relación de ramas y promoción | `git rev-parse HEAD`; `git rev-parse origin/development`; `git rev-parse origin/main`; `git log --first-parent --format='%h %ad %s' --date=short origin/main -12` | PASS; main y development coinciden; first-parent incluye ES-0.1 y mejoras posteriores | `0065396` |
| Revisión de límites de contexto | `git diff --check`; revisión del diff documental | PASS; criterios no alterados; aceptación y cobertura técnica diferenciadas | `0065396` |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Tests, lint, typecheck y build de la aplicación | Cambio exclusivamente documental; no se modificó código de aplicación. |
| QA funcional y visual en Preview/local | No cambió interfaz ni comportamiento. La tarea pide revisar manualmente el estado de la spec. La configuración Preview se registra según lo indicado por Toni, no se volvió a comprobar en Vercel. |
| Verificación live de Neon, Blob, Stripe o Google | No necesaria para sincronizar documentos; evita operaciones runtime ajenas a esta tarea. |

## 4. Checklist para validar en la aplicación

Marca cada punto. Un fallo en un punto marcado **[BLOQUEANTE]** impide promocionar.

| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | `specs/energyscan/README.md`, `000-seguridad-verdad/tasks.md`, `plan.md` y `gates.md` | Revisa estado de fases, historial de ES-0.1 y límites técnicos anotados. | ES-0.1 figura validada/promocionada; ES-0.2 es la siguiente; límites sin evidencia no aparecen como PASS. | Validación de Toni; no requiere login. | Sí |
| 2 | `specs/energyscan/000-seguridad-verdad/gates.md` — plan ES-0.2 | Confirma objetivo, dependencia, tareas, riesgos, QA mínimo y decisiones pendientes de Toni. | El plan refleja las tareas y criterios existentes de ES-0.2 sin añadir alcance o criterios. | Spec vigente; sin datos reales. | Sí |

### Casos negativos y de borde

| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | El informe histórico dice que éxito Blob estaba bloqueado, pero ES-0.1 después fue aceptada | Se conserva el resultado histórico; la aceptación posterior se registra por separado, sin inventar evidencia del éxito Blob. |
| 2 | Google o Stripe test se prueban desde Preview | No se infiere fallo funcional de producción; Google y Stripe test siguen pendientes de configuración en Preview según el estado declarado. |
| 3 | Campo `zipcode` vacío con placeholder `28001` | Se reconoce que el placeholder no completa el campo y que el error actual no identifica su nombre. |

### Estados de interfaz afectados

- [ ] Vacío · [ ] Cargando · [ ] Error · [ ] Éxito · [ ] Móvil · [ ] Escritorio · [ ] Modo oscuro (no aplica: entrega documental)

## 5. Riesgos y limitaciones

- El estado de conexión de Preview con `AUTH_SECRET`, Neon compartido con Production y Blob procede de la declaración de Toni; no se inspeccionó la configuración de Vercel en esta tarea.
- Stripe test no está configurado en Preview; Google login solo está disponible en Production.
- `.anclora/global` apunta a una ruta VPS que no existe en este checkout. No se modificó `.anclora/`.
- El mensaje de `qa:teardown` no distingue “no encontrada” de un fallo real.
- El placeholder de `zipcode` puede aparentar un valor y el formulario muestra `Invalid input` sin identificar el campo.
- La evidencia versionada aún no acredita Blob real exitoso, grants/revocación profesional, replay ni callback criptográfico real; esto no revoca la aceptación de fase informada por Toni.

## 6. Decisión de Toni

- [ ] Revisé que el estado de la spec es correcto
- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
