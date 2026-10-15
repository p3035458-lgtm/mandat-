#include "HomeScreen.hpp"

#include <QHBoxLayout>
#include <QHash>
#include <QLabel>
#include <QLinearGradient>
#include <QPainter>
#include <QPainterPath>
#include <QVBoxLayout>
#include <cmath>

#include "Anim.hpp"
#include "Storage.hpp"
#include "Theme.hpp"
#include "Widgets.hpp"

namespace mandat::ui {

using namespace theme;

static QString phaseLabel(const QString& phase) {
    static const QHash<QString, QString> M = {
        {"campaign", QStringLiteral("Предвыборная кампания")}, {"eday", QStringLiteral("День выборов")},
        {"night", QStringLiteral("Ночь выборов")}, {"victory", QStringLiteral("Победа на выборах")},
        {"defeat", QStringLiteral("Поражение")}, {"cabinet", QStringLiteral("Формирование правительства")},
        {"presidency", QStringLiteral("Президентство")}, {"legacy", QStringLiteral("Итоги карьеры")},
        {"coup", QStringLiteral("Переворот")}};
    return M.value(phase, QStringLiteral("Игра"));
}

HomeScreen::HomeScreen(QWidget* parent) : QWidget(parent), bg_(QStringLiteral(":/img/menu.jpg")) {
    setAttribute(Qt::WA_OpaquePaintEvent, false);
    setMinimumHeight(520);

    inner_ = new QWidget(this);
    auto* col = new QVBoxLayout(inner_);
    col->setSpacing(0);

    logo_ = new GradientLabel(QStringLiteral("Mandate"));
    col->addWidget(logo_, 0, Qt::AlignLeft);

    auto* tag = new QLabel(QStringLiteral("Политический симулятор: выборы, деньги, лобби и власть"));
    tag->setWordWrap(true);
    tag->setMaximumWidth(380);                                   // max-width: 42ch
    tag->setStyleSheet("color:#93a5c4;font-size:16px;");
    tag_ = tag;
    col->addSpacing(12);
    col->addWidget(tag);
    col->addSpacing(28);

    auto* actions = new QVBoxLayout;
    actions->setSpacing(10);
    bNew_ = new HomeButton(QStringLiteral("⌂"), QStringLiteral("Новая игра"),
                           QStringLiteral("Создать кандидата и начать кампанию"), true);
    bContinue_ = new HomeButton(QStringLiteral("↻"), QStringLiteral("Продолжить"), QString(), false);
    bQuick_ = new HomeButton(QStringLiteral("⚡"), QStringLiteral("Быстрый старт"),
                             QStringLiteral("Случайный кандидат, сразу в бой"), false);
    actions->addWidget(bNew_);
    actions->addWidget(bContinue_);
    actions->addWidget(bQuick_);
    col->addLayout(actions);
    col->addSpacing(22);

    links_ = new QWidget;
    auto* lk = new QHBoxLayout(links_);
    lk->setContentsMargins(0, 0, 0, 0);
    lk->setSpacing(18);
    auto* s = makeButton(QStringLiteral("⚙ Настройки"), "hlink");
    auto* a = makeButton(QStringLiteral("★ Достижения"), "hlink");
    auto* h = makeButton(QStringLiteral("? Как играть"), "hlink");
    lk->addWidget(s);
    lk->addWidget(a);
    lk->addWidget(h);
    lk->addStretch();
    col->addWidget(links_);

    connect(bNew_, &QAbstractButton::clicked, this, &HomeScreen::newGameRequested);
    connect(bContinue_, &QAbstractButton::clicked, this, &HomeScreen::continueRequested);
    connect(bQuick_, &QAbstractButton::clicked, this, &HomeScreen::quickStartRequested);
    connect(s, &QPushButton::clicked, this, &HomeScreen::settingsRequested);
    connect(a, &QPushButton::clicked, this, &HomeScreen::achievementsRequested);
    connect(h, &QPushButton::clicked, this, &HomeScreen::howToRequested);

    // a-ken: 26 с scale(1.03)→scale(1.13) translate(-1.5%,-1%), ease-in-out, alternate
    tick_.setInterval(33);
    connect(&tick_, &QTimer::timeout, this, [this]() {
        const double t = std::fmod(clock_.elapsed() / 52000.0, 1.0);
        ken_ = 0.5 - 0.5 * std::cos(2 * 3.14159265358979323846 * t);
        update();
    });

    refresh();
}

void HomeScreen::refresh() {
    const SaveInfo sv = Storage::saveInfo();
    bContinue_->setEnabled(sv.valid);
    if (sv.valid) {
        QString where = phaseLabel(sv.phase);
        if (sv.phase == "campaign" && sv.week >= 0) where += QString(", неделя %1").arg(sv.week);
        bContinue_->setSubtitle(QString("%1 · %2").arg(sv.name, where));
    } else {
        bContinue_->setSubtitle(QStringLiteral("Нет сохранённой игры"));
    }
}

void HomeScreen::showEvent(QShowEvent* e) {
    QWidget::showEvent(e);
    clock_.start();
    tick_.start();
}
void HomeScreen::hideEvent(QHideEvent* e) {
    QWidget::hideEvent(e);
    tick_.stop();
}

void HomeScreen::resizeEvent(QResizeEvent* e) {
    QWidget::resizeEvent(e);
    layoutInner();
}

void HomeScreen::layoutInner() {
    // .home-in: padding 48px clamp(20px,5vw,64px); max-width 560px
    const int vw = window() ? window()->width() : width();
    const int padX = qBound(20, int(vw * 0.05), 64);
    const int w = qMin(560, width());
    logo_->setPixelSize(qBound(44, int(vw * 0.07), 84));              // clamp(44px,7vw,84px)
    inner_->layout()->setContentsMargins(padX, 48, padX, 48);
    inner_->layout()->activate();
    int h = inner_->layout()->totalHeightForWidth(w);
    if (h <= 0) h = inner_->sizeHint().height();
    h = qMin(h, height());
    const int y = narrow() ? height() - h : (height() - h) / 2;       // мобільний варіант: притиснуто донизу
    inner_->setGeometry(0, qMax(0, y), w, h);
}

void HomeScreen::playEnter() {
    layoutInner();
    // .screen-enter: логотип .8с/.1с, підпис .7с/.2с, кнопки .5с із кроком .08с від .3с
    riseIn(logo_, 100, 800);
    riseIn(tag_, 200, 700);
    riseIn(bNew_, 300, 500);
    riseIn(bContinue_, 380, 500);
    riseIn(bQuick_, 460, 500);
}

void HomeScreen::paintEvent(QPaintEvent*) {
    QPainter p(this);
    p.setRenderHint(QPainter::Antialiasing);
    p.setRenderHint(QPainter::SmoothPixmapTransform);

    const QRectF R = QRectF(rect()).adjusted(.5, .5, -.5, -.5);
    QPainterPath clip;
    clip.addRoundedRect(R, 12, 12);                                   // border-radius: 12px; overflow:hidden
    p.fillPath(clip, QColor(0x05, 0x0a, 0x18));
    p.setClipPath(clip);

    if (!bg_.isNull()) {
        const double W = width(), H = height();
        const double cover = qMax(W / bg_.width(), H / bg_.height());   // object-fit: cover
        const double dw = bg_.width() * cover, dh = bg_.height() * cover;
        const double dx = (W - dw) * (narrow() ? .70 : .78);            // object-position
        const double dy = (H - dh) * .5;
        const double s = 1.03 + 0.10 * ken_;
        QTransform tr;
        tr.translate(W / 2, H / 2);
        tr.scale(s, s);
        tr.translate(-0.015 * W * ken_, -0.01 * H * ken_);
        tr.translate(-W / 2, -H / 2);
        p.setWorldTransform(tr);
        p.drawPixmap(QRectF(dx, dy, dw, dh), bg_, QRectF(bg_.rect()));
        p.resetTransform();
    }

    // .home-shade
    if (narrow()) {
        QLinearGradient g(0, 0, 0, height());
        g.setColorAt(0, QColor(4, 9, 22, 140));
        g.setColorAt(.55, QColor(4, 9, 22, 242));
        g.setColorAt(1, QColor(4, 9, 22, 242));
        p.fillRect(rect(), g);
    } else {
        QLinearGradient g(0, 0, width(), 0);
        g.setColorAt(0, QColor(4, 9, 22, 247));
        g.setColorAt(.32, QColor(4, 9, 22, 230));
        g.setColorAt(.62, QColor(4, 9, 22, 89));
        g.setColorAt(1, QColor(4, 9, 22, 0));
        p.fillRect(rect(), g);
    }

    p.setClipping(false);
    p.setPen(QPen(line2, 1));                                          // border: 1px solid var(--line-2)
    p.setBrush(Qt::NoBrush);
    p.drawRoundedRect(R, 12, 12);
}

} // namespace mandat::ui
