#include "Widgets.hpp"

#include <QFontMetrics>
#include <QGraphicsDropShadowEffect>
#include <QLinearGradient>
#include <QPainter>
#include <QPainterPath>
#include <QPropertyAnimation>

#include "Theme.hpp"

namespace mandat::ui {

using namespace theme;

// ===================== фабрики =====================

QPushButton* makeButton(const QString& text, const char* kind, QWidget* parent) {
    auto* b = new QPushButton(text, parent);
    b->setProperty("kind", kind);
    b->setCursor(Qt::PointingHandCursor);
    b->setFocusPolicy(Qt::TabFocus);
    if (QString(kind) == "primary") {                      // box-shadow: 0 4px 14px rgba(31,111,255,.35)
        auto* sh = new QGraphicsDropShadowEffect(b);
        sh->setBlurRadius(14);
        sh->setOffset(0, 4);
        sh->setColor(QColor(31, 111, 255, 90));
        b->setGraphicsEffect(sh);
    }
    return b;
}

QLabel* makeKicker(const QString& text, const char* tone, QWidget* parent) {
    auto* l = new QLabel(text.toUpper(), parent);
    l->setProperty("kicker", tone);
    QFont f = l->font();
    f.setLetterSpacing(QFont::AbsoluteSpacing, 1.0);       // .08em при 13px
    l->setFont(f);
    l->setSizePolicy(QSizePolicy::Maximum, QSizePolicy::Fixed);
    return l;
}

QLabel* makeText(const QString& html, bool muted, QWidget* parent) {
    auto* l = new QLabel(html, parent);
    l->setWordWrap(true);
    l->setTextFormat(Qt::RichText);
    l->setProperty("muted", muted);
    return l;
}

// ===================== HomeButton =====================

HomeButton::HomeButton(const QString& icon, const QString& title, const QString& subtitle,
                       bool primary, QWidget* parent)
    : QAbstractButton(parent), icon_(icon), title_(title), subtitle_(subtitle), primary_(primary) {
    setCursor(Qt::PointingHandCursor);
    setFocusPolicy(Qt::TabFocus);
    setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
}

QSize HomeButton::sizeHint() const {
    QFont tf(fBody()); tf.setPixelSize(17); tf.setBold(true);
    QFont sf(fBody()); sf.setPixelSize(13);
    const int textH = QFontMetrics(tf).height() + 2 + QFontMetrics(sf).height();
    return {420, 14 * 2 + qMax(38, textH)};
}

void HomeButton::enterEvent(QEnterEvent*) { hover_ = true; if (isEnabled()) animateTo(5); update(); }
void HomeButton::leaveEvent(QEvent*) { hover_ = false; animateTo(0); update(); }

void HomeButton::animateTo(qreal v) {                      // transform: translateX(5px), .14s
    auto* a = new QPropertyAnimation(this, "slide", this);
    a->setDuration(140);
    a->setStartValue(slide_);
    a->setEndValue(v);
    a->setEasingCurve(ease());
    a->start(QAbstractAnimation::DeleteWhenStopped);
}

void HomeButton::paintEvent(QPaintEvent*) {
    QPainter p(this);
    p.setRenderHint(QPainter::Antialiasing);
    p.setRenderHint(QPainter::TextAntialiasing);
    if (!isEnabled()) p.setOpacity(.45);

    const bool hot = hover_ && isEnabled();
    const QRectF r = QRectF(rect()).adjusted(.5, .5, -6.5, -.5).translated(slide_, 0);   // запас 6px під зсув

    QPainterPath path;
    path.addRoundedRect(r, 10, 10);

    if (hot) {                                                // :hover:not(:disabled) перекриває .primary
        p.fillPath(path, QColor(26, 42, 84, 230));
        p.setPen(QPen(blue2, 1));
    } else if (primary_) {
        QLinearGradient g(r.topLeft(), r.bottomRight());
        g.setColorAt(0, QColor(0x2a, 0x6b, 0xff));
        g.setColorAt(1, QColor(0x1f, 0x4f, 0xd1));
        p.fillPath(path, g);
        p.setPen(QPen(QColor(0x5d, 0x8d, 0xff), 1));
    } else {
        p.fillPath(path, QColor(18, 28, 56, 199));
        p.setPen(QPen(line2, 1));
    }
    p.drawPath(path);

    // іконка 38×38, radius 9
    const QRectF ib(r.left() + 18, r.center().y() - 19, 38, 38);
    QPainterPath ip;
    ip.addRoundedRect(ib, 9, 9);
    p.fillPath(ip, primary_ ? QColor(255, 255, 255, 46) : QColor(61, 132, 255, 41));
    QFont icf(fBody()); icf.setPixelSize(18);
    p.setFont(icf);
    p.setPen(primary_ ? QColor(Qt::white) : QColor(0x9e, 0xc0, 0xff));
    p.drawText(ib, Qt::AlignCenter, icon_);

    // тексти
    const qreal tx = ib.right() + 14;
    const qreal tw = r.right() - tx - 18;
    QFont tf(fBody()); tf.setPixelSize(17); tf.setBold(true);
    QFont sf(fBody()); sf.setPixelSize(13);
    const QFontMetrics tm(tf), sm(sf);
    const qreal blockH = tm.height() + 2 + sm.height();
    const qreal top = r.center().y() - blockH / 2;
    p.setFont(tf);
    p.setPen(QColor(0xee, 0xf3, 0xfb));
    p.drawText(QRectF(tx, top, tw, tm.height()), Qt::AlignLeft | Qt::AlignVCenter, tm.elidedText(title_, Qt::ElideRight, int(tw)));
    p.setFont(sf);
    p.setPen(primary_ ? QColor(0xcf, 0xe0, 0xff) : muted);
    p.drawText(QRectF(tx, top + tm.height() + 2, tw, sm.height()), Qt::AlignLeft | Qt::AlignVCenter,
               sm.elidedText(subtitle_, Qt::ElideRight, int(tw)));

    if (hasFocus()) {                                          // :focus-visible → 2px amber outline
        p.setOpacity(1);
        p.setPen(QPen(amber, 2));
        p.setBrush(Qt::NoBrush);
        p.drawRoundedRect(r.adjusted(-2, -2, 2, 2), 11, 11);
    }
}

// ===================== GradientLabel =====================

GradientLabel::GradientLabel(const QString& text, QWidget* parent) : QWidget(parent), text_(text.toUpper()) {
    setAttribute(Qt::WA_TransparentForMouseEvents);
}

void GradientLabel::setPixelSize(int px) { px_ = px; updateGeometry(); update(); }

QFont GradientLabel::logoFont() const {
    QFont f(fDisplay());
    f.setPixelSize(px_);
    f.setWeight(QFont::ExtraBold);
    f.setLetterSpacing(QFont::AbsoluteSpacing, px_ * 0.06);
    return f;
}

QSize GradientLabel::sizeHint() const {
    const QFontMetrics fm(logoFont());
    return {fm.horizontalAdvance(text_) + 8, px_};            // line-height: 1
}

void GradientLabel::paintEvent(QPaintEvent*) {
    QPainter p(this);
    p.setRenderHint(QPainter::Antialiasing);
    const QFontMetrics fm(logoFont());
    QPainterPath path;
    path.addText(0, (height() - fm.height()) / 2.0 + fm.ascent(), logoFont(), text_);
    QLinearGradient g(0, 0, 0, height());                     // linear-gradient(180deg, #fff, #8fa3c8)
    g.setColorAt(0, QColor(Qt::white));
    g.setColorAt(1, QColor(0x8f, 0xa3, 0xc8));
    p.fillPath(path, g);
}

// ===================== SwitchButton =====================

SwitchButton::SwitchButton(const QString& label, bool on, QWidget* parent)
    : QAbstractButton(parent), label_(label), knob_(on ? 1.0 : 0.0) {
    setCheckable(true);
    setChecked(on);
    setCursor(Qt::PointingHandCursor);
    setFocusPolicy(Qt::TabFocus);
    setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed);
}

QSize SwitchButton::sizeHint() const { return {360, 42}; }

void SwitchButton::nextCheckState() {
    QAbstractButton::nextCheckState();
    auto* a = new QPropertyAnimation(this, "knob", this);     // left .15s
    a->setDuration(150);
    a->setStartValue(knob_);
    a->setEndValue(isChecked() ? 1.0 : 0.0);
    a->start(QAbstractAnimation::DeleteWhenStopped);
}

void SwitchButton::paintEvent(QPaintEvent*) {
    QPainter p(this);
    p.setRenderHint(QPainter::Antialiasing);
    const QRectF r = QRectF(rect()).adjusted(.5, .5, -.5, -.5);
    QPainterPath bg; bg.addRoundedRect(r, 5, 5);
    if (hover_) p.fillPath(bg, line2);
    p.setPen(QPen(line2, 1));
    p.drawPath(bg);

    const QRectF sw(r.left() + 12, r.center().y() - 11, 40, 22);          // .sw 40×22
    QPainterPath sp; sp.addRoundedRect(sw, 11, 11);
    const QColor off = panel3, on = you;
    const QColor fill(int(off.red() + (on.red() - off.red()) * knob_),
                      int(off.green() + (on.green() - off.green()) * knob_),
                      int(off.blue() + (on.blue() - off.blue()) * knob_));
    p.fillPath(sp, fill);
    p.setPen(QPen(isChecked() ? you : line2, 1));
    p.drawPath(sp);
    const qreal kx = sw.left() + 2 + (40 - 4 - 16) * knob_;
    p.setPen(Qt::NoPen);
    p.setBrush(isChecked() ? QColor(Qt::white) : muted);
    p.drawEllipse(QRectF(kx, sw.top() + 3, 16, 16));

    QFont f(fBody()); f.setPixelSize(15);
    p.setFont(f);
    p.setPen(theme::text);       // не `text`: це метод QAbstractButton::text()
    p.drawText(QRectF(sw.right() + 8, r.top(), r.right() - sw.right() - 20, r.height()),
               Qt::AlignLeft | Qt::AlignVCenter, label_);

    if (hasFocus()) { p.setPen(QPen(amber, 2)); p.setBrush(Qt::NoBrush); p.drawRoundedRect(r.adjusted(-1, -1, 1, 1), 6, 6); }
}

} // namespace mandat::ui
