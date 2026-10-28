# Global agent workflow

This file is the repository-local entry point for the shared Anclora workflow. It replaces the former machine-specific `.anclora/global` symlink. The canonical rules remain maintained in the linked workspace and Anclora Mods contracts; this file does not duplicate them.

## Canonical sources

- [Workspace agent policy](../../../ANCLORA_WORKSPACE_AGENT_POLICY.md)
- [Anclora Mods Flow Amendment v2](../../../anclora-mods/ANCLORA_FLUJO_UNICO_V2.md)
- [Anclora common agent contract](../../../anclora-mods/contracts/ANCLORA_COMMON_AGENT_CONTRACT_V1.md)
- [Repository runtime and Git profile](../PRODUCTION_RUNTIME.md)

## Required workflow

1. Work directly on the repository's canonical `development` branch. Do not create a branch or worktree for routine work unless Toni explicitly requests it.
2. Keep changes local and uncommitted while Toni reviews them in the development environment. Commit and push one atomic change to `origin/development` only after Toni explicitly validates that change.
3. Use the repository's declared checks and runtime contract. Do not access or expose secrets, use personal accounts for QA, or modify unrelated production data.
4. Promotion is never automatic. It requires Toni's exact `PROMOTE=FULL` authorization and the repository-supported workflow. Use the current `development` SHA; never force-push or bypass workflow gates.

If a linked source is unavailable, report the specific contract gap and continue only with rules verified from the remaining canonical sources.
