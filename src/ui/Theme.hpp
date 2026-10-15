// Тема: палітра, шрифти й глобальна таблиця стилів (порт :root з styles.css).
#pragma once
#include <QColor>
#include <QEasingCurve>
#include <QString>

namespace mandat::ui::theme {

// --- палітра (CSS-змінні оригінала) ---
inline const QColor ink{0x06, 0x0d, 0x1a};
inline const QColor panel{0x0d, 0x18, 0x30};
inline const QColor panel2{0x13, 0x21, 0x3d};
inline const QColor panel3{0x1a, 0x2b, 0x4d};
inline const QColor line{0x1f, 0x33, 0x58};
inline const QColor line2{0x2c, 0x46, 0x75};
inline const QColor text{0xee, 0xf3, 0xfb};
inline const QColor muted{0x93, 0xa5, 0xc4};
inline const QColor dim{0x5d, 0x6f, 0x92};
inline const QColor blue{0x1f, 0x6f, 0xff};
inline const QColor blue2{0x3d, 0x84, 0xff};
inline const QColor amber{0xf4, 0xb7, 0x40};
inline const QColor amberInk{0x25, 0x19, 0x00};
inline const QColor you{0x3d, 0x84, 0xff};
inline const QColor rival{0xff, 0x5a, 0x4e};
inline const QColor good{0x3f, 0xcf, 0x7f};
inline const QColor bad{0xff, 0x5a, 0x4e};

// --- шрифти ---
// Підвантажує *.ttf/*.otf з каталогу (resources/fonts поруч із exe).
void loadFonts(const QString& dir);
// Перший наявний у системі сімейство зі списку (аналог font-family: a, b, c).
QString family(const QStringList& candidates);
QString fDisplay();   // Fira Sans Extra Condensed → Arial Narrow
QString fBody();      // Fira Sans → Segoe UI
QString fMono();      // JetBrains Mono → Consolas
QString fSerif();     // PT Serif → Georgia

// cubic-bezier(.2,.7,.2,1) — --ease з animations.css
QEasingCurve ease();

// Глобальний QSS (кнопки, скролбари, тултіпи, kicker, модальні панелі)
QString styleSheet();

} // namespace mandat::ui::theme
