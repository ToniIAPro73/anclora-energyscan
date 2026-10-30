# Checklist de validación — fuente canónica del flujo en Governance (2026-10-30)

> Se sobrescribe en cada entrega; el historial queda en Git.

**Repositorio:** anclora-energyscan
**Rama:** development
**Datos:** no se usaron ni modificaron datos de aplicación.

## 1. Qué cambia
- Los contratos locales (`.anclora/PRODUCTION_RUNTIME.md`, `AGENT_PROJECT_CONTEXT.md`, `global/GLOBAL_AGENT_WORKFLOW.md`) dejan de citar `anclora-mods` como fuente canónica del flujo y apuntan a `anclora-governance` (`AGENT_OPERATING_STANDARD` §10). Mods se conserva solo como tooling de hooks y plantilla de checklist.
- Solo documentación contractual.

## 2. Ya comprobado por el agente
| Comprobación | Resultado |
| --- | --- |
| `runtime_semantics.py`, enlaces a Governance, `git diff --check` | PASS |

## 3. NOT_RUN
Tests, lint, build y E2E de la aplicación: el diff es solo documentación contractual.

## 4. Para Toni
Sin pasos manuales. Bloqueante: no.
