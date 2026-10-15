# Mandate → C++ / Qt 6 (`mandat.exe`)

Нативний Windows-порт React-гри **Mandate** (політичний симулятор). Без Node.js, без Electron, без браузера.

> **Статус: Фаза 1 із 6.** Перенесено ядро (дані + виборча модель, перевірені проти оригінального JS),
> ресурси, Qt-каркас і головне меню з налаштуваннями. Ігрові екрани — у наступних фазах (див. «Статус»).

## Структура

```
mandat/
├── CMakeLists.txt            # mandat_core (без Qt) + core_tests + mandat.exe (Qt 6 Widgets)
├── src/
│   ├── main.cpp              # точка входу
│   ├── core/                 # чистий C++17, без Qt — логіка гри
│   │   ├── Data.hpp/.cpp     # структури даних, пошук (REGI, findBio)
│   │   ├── DataTables.gen.cpp# ГЕНЕРУЄТЬСЯ з game.js: регіони, суперники, біографії, досягнення
│   │   ├── Model.hpp         # стан гри (S): кандидати, регіони, економіка, кампанія
│   │   ├── Game.hpp/.cpp     # newGame, initCampaign, виборча модель (shares/polled/national/...)
│   │   ├── Rng.hpp           # rnd/ri/gauss + Seeded (mulberry32 з оригіналу)
│   │   └── Util.hpp/.cpp     # f1/pct/num/sgn/money/plural/dstr/hashStr — як у JS (ru-RU)
│   └── ui/                   # Qt 6 Widgets
│       ├── Theme.*           # палітра, шрифти, глобальний QSS (порт :root зі styles.css)
│       ├── Widgets.*         # HomeButton (.hbtn), GradientLabel (.home-logo), SwitchButton (.toggle)
│       ├── Modal.*           # модальний шар (.mback/.modal) і Toast
│       ├── Dialogs.*         # Настройки, Достижения, Как играть, Удалить сохранение
│       ├── HomeScreen.*      # головна: фото + Ken Burns, затемнення, кнопки, анімація входу
│       ├── MainWindow.*      # стек екранів, модальний шар, тости
│       ├── Storage.*         # QSettings (замість localStorage), %APPDATA%\Mandat\Mandat.ini
│       └── Anim.hpp          # a-rise та cubic-bezier(.2,.7,.2,1)
├── resources/
│   ├── mandat.qrc            # 212 зображень (2,3 МБ), згенеровано з assets.js
│   ├── img/ img/chars/ img/hq/
│   └── fonts/                # СЮДИ покласти *.ttf (див. нижче)
├── tools/
│   ├── extract_assets.py     # assets.js (base64) → файли + mandat.qrc
│   └── gen_data.mjs          # game.js → src/core/DataTables.gen.cpp
└── tests/
    ├── make_golden.mjs       # оригінальний JS → tests/golden.tsv (еталон)
    ├── golden.tsv            # 1002 еталонні значення
    ├── core_tests.cpp        # звірка C++ з еталоном
    └── run_core_tests.sh     # швидкий запуск без CMake/Qt
```

## Найшвидший спосіб: одна команда у Git Bash (VS Code)

1. Встановіть Qt (https://www.qt.io/download-qt-installer) і оберіть компоненти:
   **Qt 6.x → MinGW 64-bit**, а в *Developer and Designer Tools* — **MinGW 64-bit**, **CMake**, **Ninja**.
2. Відкрийте папку проєкту у VS Code → термінал **Git Bash** → виконайте:

```bash
bash build_exe.sh
```

Скрипт сам знаходить Qt/MinGW/CMake/Ninja, збирає Release, проганяє тести ядра, розкладає DLL (`windeployqt`)
і створює:

- `build/bin/mandat.exe`
- `dist/mandat/` — переносна папка (exe + DLL + шрифти)
- `mandat-windows.zip` — вона ж одним архівом

Запуск: `./dist/mandat/mandat.exe`. Нестандартний шлях Qt: `QT_ROOT=C:/Qt/6.7.2/mingw_64 bash build_exe.sh`;
чиста збірка: `CLEAN=1 bash build_exe.sh`.

## Залежності (Windows 10/11, x64)

1. **Qt 6.4+** (Qt Online Installer, https://www.qt.io/download-qt-installer): компонент *Qt 6.x → MSVC 2019/2022 64-bit*
   **або** *MinGW 64-bit* (+ *Developer and Designer Tools → MinGW*, *CMake*, *Ninja*).
2. **CMake ≥ 3.21** (входить до Qt Installer або https://cmake.org/download/).
3. **Компілятор**: Visual Studio 2019/2022 (Build Tools, робоче навантаження «Desktop development with C++») **або** MinGW з Qt.
4. **Шрифти оригіналу** (необов'язково, але потрібні для точного вигляду): завантажте з Google Fonts і покладіть `.ttf`
   у `resources/fonts/`: *Fira Sans*, *Fira Sans Extra Condensed*, *JetBrains Mono*, *PT Serif* (ліцензія OFL).
   Без них застосунок працює із Segoe UI / Arial Narrow / Georgia.

## Збірка

**MSVC** (відкрийте *x64 Native Tools Command Prompt for VS*):

```bat
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=C:/Qt/6.7.2/msvc2019_64
cmake --build build
build\bin\mandat.exe
```

**MinGW** (додайте у PATH `C:\Qt\Tools\mingw1120_64\bin` і `C:\Qt\Tools\Ninja`):

```bat
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_PREFIX_PATH=C:/Qt/6.7.2/mingw_64
cmake --build build
build\bin\mandat.exe
```

(версію `6.7.2` і шлях замініть на свої.) Результат: **`build\bin\mandat.exe`**.

### Тести ядра (без Qt; працюють і на Linux/macOS)

```bash
./tests/run_core_tests.sh          # лише g++/clang
# або через CMake:  cmake --build build --target core_tests && ctest --test-dir build --output-on-failure
```

Перегенерація еталона/даних (потрібні Node ≥ 18 і оригінальний `mandate-react`):

```bash
node tools/gen_data.mjs  <mandate-react>/src/game.js > src/core/DataTables.gen.cpp
node tests/make_golden.mjs <mandate-react> > tests/golden.tsv
python3 tools/extract_assets.py <mandate-react>/src/assets.js
```

## Переносна папка / архів для іншого ПК

```bat
cmake --build build --target deploy
```

`windeployqt` покладе поруч із `mandat.exe` усі DLL Qt, `platforms\`, `styles\` тощо. Для MSVC-збірки додайте
`--compiler-runtime` (скопіює інсталятор VC++ Redistributable) — або встановіть його на цільовому ПК.
Потім заархівуйте **усю папку `build\bin`** (разом із `fonts\`) у `.zip` і розпакуйте де завгодно — інсталяція не потрібна.
Збереження й налаштування лежать окремо: `%APPDATA%\Mandat\Mandat.ini` (щоб перенести прогрес, скопіюйте цей файл).

## Мапа відповідностей React → C++/Qt

| React / Web | C++ / Qt |
|---|---|
| `game.js`: дані (`REG`, `RIVALS`, `BIOS`…) | `core/Data*`, `DataTables.gen.cpp` (генерується з оригіналу) |
| `game.js`: `S`, `newGame`, voter model | `core/Model.hpp`, `core/Game.*` |
| `Math.random`, `gauss`, `seeded` | `core/Rng.hpp` |
| `f1/pct/num/money/plural/dstr` | `core/Util.*` (ru-RU: нерозривний пробіл, `−` U+2212) |
| `localStorage` | `ui/Storage` (`QSettings`, INI) |
| `useSyncExternalStore` + `render()` | сигнали/слоти + перемалювання віджетів |
| `SCREENS[phase]` / `registerScreen` | `QStackedWidget` у `MainWindow` |
| CSS `:root`, `.btn`, `.card`… | `ui/Theme` (QSS) + кастомні віджети |
| `modal()` / `#modal` | `ModalOverlay` |
| `toast()` / `#toastbox` | `Toast` (4200 мс) |
| `@keyframes a-rise / a-fade / a-pop / a-toast` | `QPropertyAnimation` + `cubic-bezier(.2,.7,.2,1)` |
| `@keyframes a-ken` (зум фону) | `QTimer` 30 кадрів/с + `QTransform` |
| `setInterval`/`setTimeout` (дебати, ніч) | `QTimer` *(Фаза 3)* |
| SVG-карта, півколо парламенту | `QPainter` / `QPainterPath` *(Фази 3–4)* |
| `confetti` canvas, `fx.js` частинки | `QPainter` + `QTimer` *(Фаза 3)* |
| `fetch` | не використовується в оригіналі |

## Статус перенесення

**Готово та перевірено (Фаза 1)**

- Усі таблиці даних: 9 регіонів (контури, ваги тем, база), 3 суперники, 5 біографій, 8 досягнень — генеруються з `game.js`.
- Виборча модель: `econBoost`, `salMap`, `appeal`, `shares`, `polled`, `national`, `evProjection`, `topIssues`, `recordHist`, `newGame`, `initCampaign`.
- Форматування `f1/pct/num/sgn/money/plural/dstr`, `hashStr`, `seeded`.
- **1006 перевірок збігаються з оригінальним JS** (60 сценаріїв: 5 біографій × 3 віки × 2 тривалості × 2 стани економіки/зусиль). Навмисне псування формул тест виявляє.
- Ресурси: усі 212 зображень витягнуто з base64 у файли.

**Написано, але ще НЕ скомпільовано** (у середовищі розробки не було Qt/CMake/MinGW): весь шар `src/ui/*` і `main.cpp` —
головне меню (фото з Ken Burns, градієнтний логотип, 3 кнопки, ссылки), Настройки (перемикачі зберігаються), Достижения, Как играть,
Удалить сохранение, тости, анімації появи. Можливі дрібні помилки компіляції — надішліть вивід збірки, виправлю.

**Ще не перенесено** (кнопки «Новая игра / Продолжить / Быстрый старт» зараз показують тост про це):

| Фаза | Зміст |
|---|---|
| 2 | Створення кандидата (вигляд/біографія/партія/очки), таблиці STAFF/PROMISES/LAWS/POSTS/MINISTERS, дії кампанії `A.*`, `nextWeek`, черга подій (35 подій), JSON-збереження |
| 3 | Екрани кампанії: карта 9 регіонів, план тижня, програма, штаб, групи, соцмережі, опитування, фінанси, новини; дебати з таймером; день і ніч виборів; перемога/поразка; ефекти `fx.js` |
| 4 | Кабінет, президентство, парламент (півколо), закони, економіка, міжнародні відносини, підсумки кар'єри, умови досягнень |
| 5 | Механіки: гроші за голоси, підкуп, дерево партії (17 посад), армія і переворот, лобізм, профілі людей, відрядження агітаторів, охорона/покушення |
| 6 | Полірування, візуальне порівняння з оригіналом, іконка, інсталятор |

## Відомі відмінності від веб-версії

- `backdrop-filter: blur` на кнопках меню в Qt Widgets недоступний — використано напівпрозорий фон.
- `prefers-reduced-motion` не читається: анімації завжди ввімкнені.
- Шрифти не підвантажуються з CDN — потрібні локальні `.ttf` (див. вище).
