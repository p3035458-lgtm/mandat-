#include "Modal.hpp"

#include <QGraphicsOpacityEffect>
#include <QLabel>
#include <QMouseEvent>
#include <QPainter>
#include <QPropertyAnimation>
#include <QVBoxLayout>

#include "Theme.hpp"
#include "Widgets.hpp"

namespace mandat::ui {

// ======================= ModalOverlay =======================

ModalOverlay::ModalOverlay(QWidget* parent) : QWidget(parent) {
    setAttribute(Qt::WA_StyledBackground, false);
    hide();
    panel_ = new QFrame(this);
    panel_->setObjectName("modal");
    auto* lay = new QVBoxLayout(panel_);
    lay->setContentsMargins(1, 1, 1, 1);
    scroll_ = new QScrollArea(panel_);
    scroll_->setWidgetResizable(true);
    scroll_->setFrameShape(QFrame::NoFrame);
    scroll_->setHorizontalScrollBarPolicy(Qt::ScrollBarAlwaysOff);
    scroll_->viewport()->setAutoFillBackground(false);        // фон дає панель #modal
    lay->addWidget(scroll_);
}

void ModalOverlay::paintEvent(QPaintEvent*) {
    QPainter p(this);
    p.fillRect(rect(), QColor(3, 7, 15, 199));                // rgba(3,7,15,.78)
}

void ModalOverlay::present(QWidget* content, bool wide) {
    if (content_) { scroll_->takeWidget(); content_->deleteLater(); content_ = nullptr; }
    content_ = content;
    wide_ = wide;
    scroll_->setWidget(content_);
    setGeometry(parentWidget()->rect());
    open_ = true;
    show();
    raise();
    relayout();

    // .mback: a-fade .22s;  .modal: a-pop .34s (сповзання на 18px)
    auto* eff = new QGraphicsOpacityEffect(this);
    setGraphicsEffect(eff);
    auto* fade = new QPropertyAnimation(eff, "opacity", this);
    fade->setDuration(220);
    fade->setStartValue(0.0);
    fade->setEndValue(1.0);
    connect(fade, &QPropertyAnimation::finished, this, [this]() {
        QTimer::singleShot(0, this, [this]() { setGraphicsEffect(nullptr); });
    });
    fade->start(QAbstractAnimation::DeleteWhenStopped);

    const QRect end = panel_->geometry();
    auto* pop = new QPropertyAnimation(panel_, "geometry", this);
    pop->setDuration(340);
    pop->setStartValue(end.translated(0, 18));
    pop->setEndValue(end);
    pop->setEasingCurve(theme::ease());
    pop->start(QAbstractAnimation::DeleteWhenStopped);

    // фокус на першу кнопку, як у оригіналі
    if (auto* b = content_->findChild<QAbstractButton*>()) b->setFocus(Qt::OtherFocusReason);
}

void ModalOverlay::relayout() {
    if (!open_ || !content_) return;
    const int maxW = wide_ ? 980 : 680;
    const int w = qMin(maxW, width() - 32);
    int h = content_->sizeHint().height();
    if (content_->layout()) h = qMax(h, content_->layout()->totalHeightForWidth(w - 2));
    h = qMin(h + 2, height() - 32);
    panel_->setGeometry((width() - w) / 2, (height() - h) / 2, w, h);
}

void ModalOverlay::dismiss() {
    open_ = false;
    hide();
    if (content_) { scroll_->takeWidget(); content_->deleteLater(); content_ = nullptr; }
}

// ======================= Toast =======================

Toast::Toast(QWidget* parent) : QLabel(parent) {
    setObjectName("toast");
    setWordWrap(true);
    setTextFormat(Qt::RichText);
    setAlignment(Qt::AlignCenter);
    hide();
    hide_.setSingleShot(true);
    connect(&hide_, &QTimer::timeout, this, &QWidget::hide);
}

void Toast::reposition() {
    const int maxW = qMin(560, parentWidget()->width() - 32);
    setFixedWidth(qMin(maxW, qMax(200, fontMetrics().horizontalAdvance(text()) + 40)));
    adjustSize();
    move((parentWidget()->width() - width()) / 2, parentWidget()->height() - 52 - height());   // bottom: 52px
}

void Toast::showText(const QString& html) {
    setText(html);
    reposition();
    show();
    raise();
    auto* eff = new QGraphicsOpacityEffect(this);              // a-toast .34s
    setGraphicsEffect(eff);
    auto* fade = new QPropertyAnimation(eff, "opacity", this);
    fade->setDuration(340);
    fade->setStartValue(0.0);
    fade->setEndValue(1.0);
    fade->start(QAbstractAnimation::DeleteWhenStopped);
    const QPoint end = pos();
    auto* slide = new QPropertyAnimation(this, "pos", this);
    slide->setDuration(340);
    slide->setStartValue(end + QPoint(0, 16));
    slide->setEndValue(end);
    slide->setEasingCurve(theme::ease());
    slide->start(QAbstractAnimation::DeleteWhenStopped);
    hide_.start(4200);
}

// ======================= helpers =======================

QWidget* makeBody(QWidget* parent) {
    auto* w = new QWidget(parent);
    auto* l = new QVBoxLayout(w);
    l->setContentsMargins(18, 16, 18, 16);
    l->setSpacing(12);
    return w;
}

QWidget* makeModalContent(const QString& kicker, const char* tone, const QString& title, QWidget* body) {
    auto* root = new QWidget;
    auto* lay = new QVBoxLayout(root);
    lay->setContentsMargins(0, 0, 0, 0);
    lay->setSpacing(0);

    auto* head = new QFrame;
    head->setObjectName("mhead");
    auto* hl = new QVBoxLayout(head);
    hl->setContentsMargins(18, 14, 18, 12);
    hl->setSpacing(8);
    hl->addWidget(makeKicker(kicker, tone), 0, Qt::AlignLeft);
    auto* h2 = new QLabel(title);
    h2->setObjectName("mtitle");
    h2->setWordWrap(true);
    hl->addWidget(h2);

    lay->addWidget(head);
    lay->addWidget(body);
    return root;
}

} // namespace mandat::ui
