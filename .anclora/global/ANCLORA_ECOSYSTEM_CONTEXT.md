# Anclora ecosystem context

This file is the repository-local entry point for shared ecosystem context. It replaces the former machine-specific `.anclora/global` symlink.

## Authority

- Workspace-wide agent policy: [`../../../ANCLORA_WORKSPACE_AGENT_POLICY.md`](../../../ANCLORA_WORKSPACE_AGENT_POLICY.md)
- Ecosystem architecture and product map: [`../../../anclora-vault/00-governance/contracts/core/ANCLORA_ECOSYSTEM_ARCHITECTURE_CONTRACT.md`](../../../anclora-vault/00-governance/contracts/core/ANCLORA_ECOSYSTEM_ARCHITECTURE_CONTRACT.md)
- Repository-specific architecture, runtime, and infrastructure: [`../AGENT_PROJECT_CONTEXT.md`](../AGENT_PROJECT_CONTEXT.md), [`../PRODUCTION_RUNTIME.md`](../PRODUCTION_RUNTIME.md), and [`../AOS_ADOPTION.md`](../AOS_ADOPTION.md)

## Operating rules

- Products in the Anclora ecosystem may use different hosting, backend, database, authentication, storage, and environment arrangements. Do not infer shared infrastructure; use each product's repository contracts.
- The Vault architecture contract is authoritative for the ecosystem map. Its Git workflow guidance is historical where it conflicts with the current workspace policy or a repository's canonical contracts.
- For Anclora EnergyScan, use `.anclora/PRODUCTION_RUNTIME.md` as the source for hosting, runtime, database, authentication, and deployment facts.
