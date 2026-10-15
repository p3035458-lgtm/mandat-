#!/usr/bin/env bash
# Збирає й запускає тести ядра без Qt (потрібен лише g++ ≥ 9 або clang ≥ 10).
set -euo pipefail
cd "$(dirname "$0")/.."
g++ -std=c++17 -O1 -Wall -Wextra -Isrc \
    src/core/Util.cpp src/core/Data.cpp src/core/DataTables.gen.cpp src/core/Game.cpp \
    tests/core_tests.cpp -o /tmp/mandat_core_tests
/tmp/mandat_core_tests tests/golden.tsv
