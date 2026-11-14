#!/usr/bin/env bash
# Local replacement for the old GitHub Actions test run. Usage: bash bin/check.sh
set -euo pipefail
cd "$(dirname "$0")/.."
"${PYTHON:-python3}" -m pytest tests -q
