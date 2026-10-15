#!/usr/bin/env bash
# ============================================================================
#  build_exe.sh — збирає mandat.exe (Qt 6 + MinGW) і пакує переносну папку/ZIP.
#
#  Запуск у терміналі VS Code (Git Bash), з кореня проєкту:
#       bash build_exe.sh
#
#  Результат:
#       build/bin/mandat.exe            — виконуваний файл
#       dist/mandat/                    — папка з exe + усі DLL Qt + шрифти
#       mandat-windows.zip              — той самий вміст одним архівом
#
#  Змінні (необов'язкові):
#       QT_ROOT=C:/Qt/6.7.2/mingw_64    — якщо Qt встановлено нестандартно
#       CLEAN=1 bash build_exe.sh       — спершу видалити build/
#       bash build_exe.sh 2>&1 | tee build.log   — зберегти журнал у build.log
# ============================================================================
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

say()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
fail() { printf '\n\033[1;31mПОМИЛКА: %s\033[0m\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------- 1. Qt / інструменти
say "Шукаю Qt 6 (MinGW 64-bit) та інструменти"

QT_ROOT="${QT_ROOT:-}"
QT_BASE=""
if [ -z "$QT_ROOT" ]; then
  for base in /c/Qt /d/Qt /e/Qt "$HOME/Qt"; do
    [ -d "$base" ] || continue
    cand="$(ls -d "$base"/6.*/mingw_64 2>/dev/null | sort -V | tail -1 || true)"
    if [ -n "$cand" ]; then QT_ROOT="$cand"; QT_BASE="$base"; break; fi
  done
fi
[ -n "$QT_ROOT" ] || fail "Не знайдено Qt 6 для MinGW.
  Встановіть Qt (https://www.qt.io/download-qt-installer): у списку компонентів оберіть
    • Qt → Qt 6.x → «MinGW 64-bit»
    • Qt → Developer and Designer Tools → «MinGW 13.x 64-bit», «CMake», «Ninja»
  Або вкажіть шлях вручну:  QT_ROOT=C:/Qt/6.7.2/mingw_64 bash build_exe.sh"
[ -d "$QT_ROOT" ] || fail "QT_ROOT=$QT_ROOT не існує"
[ -n "$QT_BASE" ] || QT_BASE="$(cd "$QT_ROOT/../.." && pwd)"
echo "Qt:   $QT_ROOT"

# Додаємо інструменти з Qt Installer у PATH (найновіші версії), якщо вони там є
add_path() { [ -d "$1" ] && PATH="$1:$PATH"; return 0; }
MINGW_BIN="$(ls -d "$QT_BASE"/Tools/mingw*_64/bin 2>/dev/null | sort -V | tail -1 || true)"
CMAKE_BIN="$(ls -d "$QT_BASE"/Tools/CMake_64/bin 2>/dev/null | tail -1 || true)"
NINJA_BIN="$(ls -d "$QT_BASE"/Tools/Ninja 2>/dev/null | tail -1 || true)"
[ -n "$MINGW_BIN" ] && add_path "$MINGW_BIN"
[ -n "$CMAKE_BIN" ] && add_path "$CMAKE_BIN"
[ -n "$NINJA_BIN" ] && add_path "$NINJA_BIN"
add_path "$QT_ROOT/bin"
export PATH

command -v g++   >/dev/null || fail "g++ (MinGW) не знайдено. Встановіть компонент «MinGW 13.x 64-bit» у Qt Installer."
command -v cmake >/dev/null || fail "CMake не знайдено. Встановіть компонент «CMake» у Qt Installer або з https://cmake.org/download/"
[ -x "$QT_ROOT/bin/windeployqt.exe" ] || [ -x "$QT_ROOT/bin/windeployqt" ] || fail "Не знайдено windeployqt у $QT_ROOT/bin"

if command -v ninja >/dev/null; then GEN="Ninja"
elif command -v mingw32-make >/dev/null; then GEN="MinGW Makefiles"
else fail "Не знайдено ні Ninja, ні mingw32-make. Встановіть компонент «Ninja» у Qt Installer."; fi

# Повний шлях до g++.exe для CMake (command -v у Git Bash повертає шлях БЕЗ «.exe»)
GXX="$(command -v g++)"; GXX="${GXX%.exe}.exe"
if command -v cygpath >/dev/null; then GXX="$(cygpath -m "$GXX")"; fi

echo "g++:  $GXX"
echo "cmake: $(command -v cmake)"
echo "Генератор: $GEN"

# cmake очікує шляхи з «C:/…», а не «/c/…»
if command -v cygpath >/dev/null; then QT_PREFIX="$(cygpath -m "$QT_ROOT")"; else QT_PREFIX="$QT_ROOT"; fi

# ---------------------------------------------------------------- 2. конфігурація
[ "${CLEAN:-0}" = "1" ] && { say "Видаляю build/"; rm -rf build; }

say "Конфігурація (Release) → build/"
cmake -S . -B build -G "$GEN" \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_PREFIX_PATH="$QT_PREFIX" \
      -DCMAKE_CXX_COMPILER="$GXX" \
      -DMANDAT_BUILD_TESTS=ON

# ---------------------------------------------------------------- 3. збирання
say "Збирання"
cmake --build build --parallel

EXE="build/bin/mandat.exe"
[ -f "$EXE" ] || fail "Збірка завершилась, але $EXE не створено. Дивіться журнал вище."

# ---------------------------------------------------------------- 4. тести ядра (швидко)
say "Тести ядра проти еталона оригінального JS"
if [ -f build/bin/core_tests.exe ]; then
  ./build/bin/core_tests.exe tests/golden.tsv || echo "УВАГА: тести ядра не пройшли (exe все одно збирається)"
fi

# ---------------------------------------------------------------- 5. DLL Qt
say "Розкладаю DLL Qt (windeployqt)"
cmake --build build --target deploy

# ---------------------------------------------------------------- 5b. runtime MinGW
# windeployqt не завжди кладе libgcc/libstdc++/winpthread — без них exe не стартує
say "Копіюю DLL компілятора MinGW"
GXX_DIR="$(dirname "$GXX")"
for dll in libgcc_s_seh-1.dll libstdc++-6.dll libwinpthread-1.dll; do
  if [ -f "$GXX_DIR/$dll" ]; then cp -f "$GXX_DIR/$dll" build/bin/ && echo "  + $dll"
  else echo "УВАГА: не знайдено $GXX_DIR/$dll"; fi
done

# ---------------------------------------------------------------- 6. пакування
say "Пакую переносну папку dist/mandat і mandat-windows.zip"
rm -rf dist && mkdir -p dist/mandat
cp -r build/bin/. dist/mandat/
rm -f dist/mandat/core_tests.exe                       # тести користувачу не потрібні
cat > dist/mandat/ЧИТАЙ.txt <<'EOF'
Mandate (C++/Qt)
================
Запуск: двічі клацніть mandat.exe. Установка не потрібна.
Переносити можна всю папку цілком (exe + DLL + підпапки platforms, styles, fonts...).
Збереження й налаштування лежать у %APPDATA%\Mandat\Mandat.ini
(щоб перенести прогрес на інший ПК, скопіюйте цей файл).
Шрифти оригіналу: покладіть .ttf у папку fonts поруч з mandat.exe (див. fonts\README.txt).
EOF

rm -f mandat-windows.zip
if command -v powershell >/dev/null; then
  powershell -NoProfile -Command "Compress-Archive -Path 'dist/mandat' -DestinationPath 'mandat-windows.zip' -Force"
elif command -v zip >/dev/null; then
  (cd dist && zip -qr ../mandat-windows.zip mandat)
else
  echo "Не знайдено powershell/zip — архів не створено, але папка dist/mandat готова."
fi

say "ГОТОВО"
echo "  exe:    $(pwd)/build/bin/mandat.exe"
echo "  папка:  $(pwd)/dist/mandat"
[ -f mandat-windows.zip ] && echo "  архів:  $(pwd)/mandat-windows.zip"
echo
echo "Вміст dist/mandat (перші файли):"; ls dist/mandat | head -15
echo
echo "Запустити:  ./dist/mandat/mandat.exe   (або двічі клацнути mandat.exe у папці dist\\mandat)"
