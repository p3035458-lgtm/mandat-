cmake_minimum_required(VERSION 3.21)
project(mandat VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

if(MSVC)
  add_compile_options(/utf-8 /W4 /permissive-)    # вихідники в UTF-8 (кирилиця в рядках)
else()
  add_compile_options(-Wall -Wextra)
endif()

option(MANDAT_BUILD_GUI   "Зібрати Qt-застосунок mandat.exe" ON)
option(MANDAT_BUILD_TESTS "Зібрати тести ядра (без Qt)"      ON)

# ---------------------------------------------------------------------------
# Ядро гри: чистий C++17, без Qt (моделі, дані, виборча модель, форматування)
# ---------------------------------------------------------------------------
add_library(mandat_core STATIC
  src/core/Util.cpp
  src/core/Data.cpp
  src/core/DataTables.gen.cpp
  src/core/Game.cpp)
target_include_directories(mandat_core PUBLIC src)

if(MANDAT_BUILD_TESTS)
  enable_testing()
  add_executable(core_tests tests/core_tests.cpp)
  target_link_libraries(core_tests PRIVATE mandat_core)
  add_test(NAME core_vs_js_golden
           COMMAND core_tests ${CMAKE_CURRENT_SOURCE_DIR}/tests/golden.tsv)
endif()

# ---------------------------------------------------------------------------
# GUI: Qt 6 Widgets  →  bin/mandat.exe
# ---------------------------------------------------------------------------
if(MANDAT_BUILD_GUI)
  find_package(Qt6 6.4 REQUIRED COMPONENTS Widgets)
  set(CMAKE_AUTOMOC ON)
  set(CMAKE_AUTORCC ON)

  add_executable(mandat WIN32
    src/main.cpp
    src/ui/Anim.hpp
    src/ui/Theme.hpp        src/ui/Theme.cpp
    src/ui/Storage.hpp      src/ui/Storage.cpp
    src/ui/Widgets.hpp      src/ui/Widgets.cpp
    src/ui/Modal.hpp        src/ui/Modal.cpp
    src/ui/Dialogs.hpp      src/ui/Dialogs.cpp
    src/ui/HomeScreen.hpp   src/ui/HomeScreen.cpp
    src/ui/MainWindow.hpp   src/ui/MainWindow.cpp
    resources/mandat.qrc)
  set_target_properties(mandat PROPERTIES OUTPUT_NAME mandat WIN32_EXECUTABLE ON)
  target_link_libraries(mandat PRIVATE mandat_core Qt6::Widgets)

  # Шрифти (Fira Sans тощо) копіюються поруч з exe, якщо лежать у resources/fonts
  add_custom_command(TARGET mandat POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
            ${CMAKE_CURRENT_SOURCE_DIR}/resources/fonts $<TARGET_FILE_DIR:mandat>/fonts)

  # Ціль `deploy`: збирає переносну папку з усіма DLL Qt (windeployqt)
  if(WIN32)
    find_program(WINDEPLOYQT windeployqt HINTS "${Qt6_DIR}/../../../bin")
    if(WINDEPLOYQT)
      add_custom_target(deploy
        COMMAND ${WINDEPLOYQT} --release --no-translations $<TARGET_FILE:mandat>
        DEPENDS mandat
        COMMENT "windeployqt: збираю переносну папку у $<TARGET_FILE_DIR:mandat>")
    endif()
  endif()

  install(TARGETS mandat RUNTIME DESTINATION .)
  install(DIRECTORY resources/fonts DESTINATION .)
endif()
