#!/usr/bin/env bash
# Captura los pantallazos del manual ES desde producción con la identidad QA.
# Uso: bash scripts/manual/capture-manual-es.sh [--only a.png,b.png] [--list] [--no-seed]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: se necesita Node.js (node) en el PATH." >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
if [ "$BRANCH" != "development" ]; then
  echo "Aviso: estás en la rama «$BRANCH» (se esperaba «development»)." >&2
fi

set +e
node scripts/manual/capture-manual-es.mjs "$@"
RC=$?
set -e

echo
echo "Avísame en el chat para revisar las capturas y regenerar el PDF"
exit $RC
