# Anclora Energyscan — Agent Project Context

AGENT_PROJECT_CONTEXT_VERSION=3.0
STATUS=ACTIVE
AUTHORITY=anclora-governance

## 1. Project Identity

APPLICATION_NAME=Anclora Energyscan
REPOSITORY=anclora-energyscan
PROJECT_ROLE=Core Application (Next.js)
PRODUCT_FAMILY=Anclora Group

## 2. Bootstrap (minimal router)

```text
AUTHORITY=anclora-governance
AGENT_PROJECT_CONTEXT_ROLE=MINIMAL_ROUTER
```

Authority, QA, token economy, Git, promotion and the verification matrix are defined by Governance
([`AOS_ADOPTION_STANDARD`](../../anclora-governance/standards/AOS_ADOPTION_STANDARD.md),
[`AGENT_EXECUTION_POLICY`](../../anclora-governance/standards/AGENT_EXECUTION_POLICY.md),
[`AGENT_OPERATING_STANDARD`](../../anclora-governance/standards/AGENT_OPERATING_STANDARD.md)) and are not
duplicated here. Entry point: [`../AGENTS.md`](../AGENTS.md). Repository facts: [`PRODUCTION_RUNTIME.md`](PRODUCTION_RUNTIME.md).
Adoption and exceptions: [`AOS_ADOPTION.md`](AOS_ADOPTION.md). Load each only when the task needs it.

## 4. Core Project Contracts

- **PRODUCTION_RUNTIME**: [`.anclora/PRODUCTION_RUNTIME.md`](PRODUCTION_RUNTIME.md)
  - Governs real runtime architecture, hosting, Neon/Postgres database connection, PRISMA_MIGRATE migration strategy, auth, and production-backed local model.
- **AOS_ADOPTION**: [`.anclora/AOS_ADOPTION.md`](AOS_ADOPTION.md)
  - Governs AOS alignment, governance level, standards, and referenced authoritative knowledge.

## 4. Task Routing

| Task Domain | Primary Authority to Read First | Secondary / Operational Sources |
| :--- | :--- | :--- |
| **Runtime / Hosting / Env** | [`.anclora/PRODUCTION_RUNTIME.md`](PRODUCTION_RUNTIME.md) | `.env.local` (mode 0600) |
| **Database / Migrations** | [`.anclora/PRODUCTION_RUNTIME.md`](PRODUCTION_RUNTIME.md) | `./prisma/migrations` |
| **AOS Governance** | [`.anclora/AOS_ADOPTION.md`](AOS_ADOPTION.md) | [`../../anclora-governance/`](../../anclora-governance/) |
| **Design / UI Tokens** | [`../../anclora-design-system/`](../../anclora-design-system/) | [`../../anclora-vault/00-governance/contracts/`](../../anclora-vault/00-governance/contracts/) |
| **Git Workflow** | [`.anclora/PRODUCTION_RUNTIME.md`](PRODUCTION_RUNTIME.md) | `../AGENTS.md` |

## 5. Source Authority

- Operational Rules: `../AGENTS.md`
- Governance: [`../../anclora-governance/`](../../anclora-governance/)

## Flujo único Anclora v1

Fuente canónica: sección «Anclora Single Flow v1» de `PRODUCTION_RUNTIME.md` y `../anclora-mods/ANCLORA_FLUJO_UNICO_V1.md`.

1. Trabaja directamente en `development`, sin ramas temporales (salvo orden expresa de Toni). Push solo a `origin/development`, nunca con force.
2. Verifica antes de entregar: gates (`QA_MODE`) y comprobación funcional y visual con la cuenta de QA (credenciales de `.env.qa.local`, cargadas sin imprimirlas). Los datos de la aplicación son ficticios.
3. Sobrescribe `docs/VALIDATION_CHECKLIST.md` (plantilla: `../anclora-mods/anclora-workflow/templates/validation-checklist.md`) en el mismo commit.
4. Detente tras el push. No declares la fase aceptada: la acepta Toni.
5. Espera la validación expresa de Toni en development antes de hacer commit y push a `origin/development`. Tras la revisión de Preview, `PROMOTE=FULL` escrito por Toni autoriza un único workflow asíncrono que actualiza `staging → production → main` en orden; no esperes su finalización ni verifiques los branches entre saltos. Toni revisa los entornos resultantes.
6. Controles automáticos: `../anclora-mods/README.md`. Si un control bloquea algo legítimo, no lo evites: explícalo.

Esta sección prevalece sobre cualquier cláusula de `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` o `docs/` que ordene ramas por agente o prohíba trabajar en `development`.

<!-- ANCLORA-AOS:START -->
ANCLORA_AOS_AUTHORITY=anclora-governance
Canonical rules: [AOS Adoption Standard](../../anclora-governance/standards/AOS_ADOPTION_STANDARD.md). Repository-specific facts remain in this repository's `.anclora/` contracts.
<!-- ANCLORA-AOS:END -->
