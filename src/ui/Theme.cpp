#include "Theme.hpp"

#include <QDir>
#include <QFontDatabase>
#include <QPointF>
#include <QStringList>

namespace mandat::ui::theme {

void loadFonts(const QString& dir) {
    QDir d(dir);
    if (!d.exists()) return;
    const QStringList files = d.entryList({"*.ttf", "*.otf"}, QDir::Files);
    for (const QString& f : files) QFontDatabase::addApplicationFont(d.absoluteFilePath(f));
}

QString family(const QStringList& candidates) {
    const QStringList have = QFontDatabase::families();
    for (const QString& c : candidates)
        if (have.contains(c, Qt::CaseInsensitive)) return c;
    return candidates.isEmpty() ? QString() : candidates.last();
}

QString fDisplay() { static const QString f = family({"Fira Sans Extra Condensed", "Arial Narrow", "Segoe UI"}); return f; }
QString fBody()    { static const QString f = family({"Fira Sans", "Segoe UI", "Arial"}); return f; }
QString fMono()    { static const QString f = family({"JetBrains Mono", "Consolas", "Courier New"}); return f; }
QString fSerif()   { static const QString f = family({"PT Serif", "Georgia", "Times New Roman"}); return f; }

QEasingCurve ease() {
    QEasingCurve c(QEasingCurve::BezierSpline);
    c.addCubicBezierSegment(QPointF(.2, .7), QPointF(.2, 1.0), QPointF(1.0, 1.0));
    return c;
}

QString styleSheet() {
    // @BODY@ / @DISPLAY@ / @SERIF@ підставляються реально доступними шрифтами
    // (не QString::arg: він нумерує лише наявні маркери і легко переплутає порядок).
    QString s = QStringLiteral(R"(
QWidget { color: #eef3fb; font-family: "@BODY@"; font-size: 15px; }
QMainWindow, QWidget#root { background: #060d1a; }
QToolTip { background: #1a2b4d; color: #eef3fb; border: 1px solid #2c4675; padding: 4px 8px; }

/* ---------- кнопки (.btn) ---------- */
QPushButton[kind="btn"], QPushButton[kind="primary"], QPushButton[kind="danger"], QPushButton[kind="ghost"] {
  background: #1a2b4d; border: 1px solid #2c4675; border-radius: 5px; padding: 8px 12px; text-align: left;
}
QPushButton[kind="btn"]:hover { background: #2c4675; }
QPushButton[kind="ghost"] { background: transparent; }
QPushButton[kind="ghost"]:hover { background: #2c4675; }
QPushButton[kind="danger"] { border-color: #ff5a4e; color: #ff5a4e; background: transparent; }
QPushButton[kind="danger"]:hover { background: rgba(255,90,78,0.12); }
QPushButton[kind="primary"] { background: #1f6fff; border-color: #1f6fff; color: #ffffff; font-weight: 600; }
QPushButton[kind="primary"]:hover { background: #3d84ff; }
QPushButton:focus { border: 2px solid #f4b740; }
QPushButton:disabled { color: rgba(238,243,251,0.45); }

/* посилання в меню (.hlink) */
QPushButton[kind="hlink"] { background: none; border: 0; color: #93a5c4; font-size: 14px; padding: 4px 0; text-align: left; }
QPushButton[kind="hlink"]:hover { color: #ffffff; }

/* ---------- модальне вікно (.modal) ---------- */
QFrame#modal { background: #0d1830; border: 1px solid #2c4675; border-radius: 8px; }
QFrame#mhead { background: transparent; border: 0; border-bottom: 1px solid #1f3358; }
QLabel#mtitle { font-family: "@SERIF@"; font-weight: 700; font-size: 21px; }
QLabel[kicker="red"]   { background: #ff5a4e; color: #ffffff; }
QLabel[kicker="blue"]  { background: #3d84ff; color: #ffffff; }
QLabel[kicker="amber"] { background: #f4b740; color: #251900; }
QLabel[kicker] { font-family: "@DISPLAY@"; font-weight: 800; font-size: 13px; padding: 2px 8px; border-radius: 2px; }
QLabel[muted="true"] { color: #93a5c4; }
QFrame[card="item"] { background: #13213d; border: 1px solid #1f3358; border-radius: 6px; }

/* ---------- toast ---------- */
QLabel#toast { background: #1a2b4d; border: 1px solid #f4b740; border-radius: 6px; padding: 10px 16px; font-size: 14px; }

/* ---------- прокрутка ---------- */
QScrollArea { background: transparent; border: 0; }
QScrollBar:vertical { background: transparent; width: 10px; margin: 0; }
QScrollBar::handle:vertical { background: #2c4675; border-radius: 5px; min-height: 28px; }
QScrollBar::handle:vertical:hover { background: #3d84ff; }
QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical { height: 0; }
QScrollBar::add-page:vertical, QScrollBar::sub-page:vertical { background: transparent; }
)");
    s.replace("@BODY@", fBody());
    s.replace("@DISPLAY@", fDisplay());
    s.replace("@SERIF@", fSerif());
    return s;
}

} // namespace mandat::ui::theme
