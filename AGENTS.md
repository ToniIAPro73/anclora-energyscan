<!-- ANCLORA-ECOSYSTEM-CONTEXT-START -->
## Contexto de ecosistema Anclora

Antes de modificar este repositorio, todo agente debe leer:

- `.anclora/global/ANCLORA_ECOSYSTEM_CONTEXT.md`
- `.anclora/global/GLOBAL_AGENT_WORKFLOW.md`
- `.anclora/AGENT_PROJECT_CONTEXT.md`
- `MEMORY.md`

La arquitectura estable del ecosistema se define en:

`Boveda-Anclora/contracts/core/ANCLORA_ECOSYSTEM_ARCHITECTURE_CONTRACT.md`

No asumir infraestructura compartida entre productos. Validar siempre hosting, backend, base de datos, auth, variables y ramas.
<!-- ANCLORA-ECOSYSTEM-CONTEXT-END -->

<!-- MEMANTO-MANAGED-SECTION -->
## Uso de Memanto

Agente por defecto en este repo: `anclora-global`.

Usa Memanto como memoria operativa persistente. Sirve para recordar decisiones tecnicas, errores resueltos, contexto estable, preferencias del usuario y pendientes reales.

No sustituye documentacion canonica, Git, issues ni contratos de la boveda.

### Reglas

- Lee `MEMORY.md` antes de empezar.
- Si hay dudas sobre contexto previo, ejecuta `memanto recall` o `memanto answer` antes de asumir.
- Guarda solo informacion que ahorre tiempo o evite repetir errores.
- Todos los comandos `memanto` son comandos de shell. Ejecutalos en terminal.
- Nunca guardes secretos, tokens, contrasenas, credenciales completas ni datos personales sensibles.

### Inicio de tarea

```bash
memanto agent activate anclora-global
memanto recall "contexto actual de este proyecto" --limit 10
memanto answer "Que decisiones previas debo respetar aqui?"
```

### Durante la tarea

Guardar decision:

```bash
memanto remember "Decision: <que se decidio> porque <razon>. Afecta a <repo/modulo>." \
  --type decision \
  --confidence 0.95 \
  --provenance explicit_statement \
  --source codex-dev
```

Guardar error resuelto:

```bash
memanto remember "Error resuelto: <sintoma>. Causa: <causa>. Solucion: <solucion>. Verificado con <test/comando>." \
  --type error \
  --confidence 0.95 \
  --provenance observed \
  --source codex-dev
```

Guardar preferencia:

```bash
memanto remember "Preferencia: <preferencia concreta del usuario>." \
  --type preference \
  --confidence 1.0 \
  --provenance explicit_statement \
  --source codex-dev
```

Guardar pendiente:

```bash
memanto remember "Pendiente: <tarea>. Bloqueo: <bloqueo>. Siguiente paso: <accion>." \
  --type commitment \
  --confidence 0.9 \
  --provenance explicit_statement \
  --source codex-dev
```

### Cierre

```bash
memanto remember "Cierre: se completo <tarea>. Rama: <rama>. Commit: <sha>. Pendiente: <si/no>." \
  --type event \
  --confidence 0.95 \
  --provenance observed \
  --source codex-dev

memanto memory sync --project-dir .
```
<!-- /MEMANTO-MANAGED-SECTION -->

<!-- ANCLORA-SDD-STANDARDS-START -->
## Metodología SDD — Estándar Unificado Anclora

Todo desarrollo en este repo sigue la metodología SDD unificada del ecosistema Anclora.

**Referencia canónica**: `agency-agents/docs/guides/SDD_INTEGRATION_GUIDE.md`
**Workflow OpenSpec**: `agency-agents/docs/guides/OPENSPEC_WORKFLOW.md`

### Flujo de trabajo Git

- Rama base de desarrollo: **`development`**
- Los agentes crean ramas desde `development`: `feat/<agente>-<descripcion>`, `fix/...`, `chore/...`
- Las ramas se mergean de vuelta a `development` via PR
- Promoción manual: `development → staging → production → main`
- Nunca commitear directamente en `main`, `staging` ni `production`

### Principios de desarrollo (Specboot)

1. **Small Tasks, One at a Time** — baby steps, nunca saltarse pasos
2. **Test-Driven Development** — escribir tests fallidos antes de implementar
3. **Type Safety** — código completamente tipado (TypeScript)
4. **Clear Naming** — variables y funciones descriptivas
5. **English Only** — código, comentarios y docs técnicos en inglés
6. **90% Test Coverage** — cobertura exhaustiva en todas las capas
7. **Incremental Changes** — modificaciones focalizadas y revisables

### Ciclo de cambios (SDD en este repo)

Toda feature o fix sigue este flujo antes de escribir código:

- Crear spec: `sdd/features/<nombre>/<nombre>-spec-v1.md`
- Crear plan: `sdd/features/<nombre>/<nombre>-plan-v1.md` (cambios complejos)
- Crear tasks: `sdd/features/<nombre>/<nombre>-tasks-v1.md`
- Implementar tarea a tarea (tests primero)
- Validar contra criterios de aceptación de la spec
- PR contra `development`, con referencia a la spec

### Reglas obligatorias

- **No spec, no code**: toda feature empieza con spec en `sdd/features/`
- **Tests primero**: el agente ejecuta los tests, nunca el usuario
- **Hermes gate**: cambio que afecta copy público → Hermes Copy Curator antes del merge
- **Spec inmutable**: una spec cerrada no se edita; los cambios generan una spec nueva
<!-- ANCLORA-SDD-STANDARDS-END -->
