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

Antes de cualquier verificación o prueba visual, lee docs/qa/visual-qa-runbook.md

<!-- ANCLORA-AOS:START -->
# Gemini adapter

This repository follows AOS. Use `AGENTS.md` as bootstrap and resolve canonical Governance and the repository runtime contract from it. Provider-specific behavior must not override AOS.
<!-- ANCLORA-AOS:END -->
