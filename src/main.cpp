// mandat.exe — точка входу. Qt 6 Widgets, Windows GUI (без консолі).
#include <QApplication>
#include <QCoreApplication>
#include <QStyleFactory>

#include "ui/MainWindow.hpp"
#include "ui/Theme.hpp"

int main(int argc, char* argv[]) {
    QApplication app(argc, argv);
    QCoreApplication::setOrganizationName("Mandat");
    QCoreApplication::setApplicationName("Mandate");
    QApplication::setStyle(QStyleFactory::create("Fusion"));      // однаковий вигляд на всіх Windows

    // Шрифти оригіналу (Fira Sans, Fira Sans Extra Condensed, JetBrains Mono, PT Serif) —
    // кладуться в папку fonts поруч із mandat.exe; без них використовуються Segoe UI / Arial Narrow.
    mandat::ui::theme::loadFonts(QCoreApplication::applicationDirPath() + "/fonts");
    app.setStyleSheet(mandat::ui::theme::styleSheet());

    mandat::ui::MainWindow w;
    w.show();
    return app.exec();
}
