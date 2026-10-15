// Анімації, відповідні @keyframes з animations.css.
#pragma once
#include <QGraphicsOpacityEffect>
#include <QParallelAnimationGroup>
#include <QPropertyAnimation>
#include <QTimer>
#include <QWidget>

#include "Theme.hpp"

namespace mandat::ui {

// a-rise: from { opacity:0; translateY(14px) } to { none } — з затримкою і backwards-fill.
// Викликати ПІСЛЯ того, як layout розставив віджет (див. HomeScreen::playEnter).
inline void riseIn(QWidget* w, int delayMs, int durMs, int dy = 14) {
    auto* eff = new QGraphicsOpacityEffect(w);
    eff->setOpacity(0.0);
    w->setGraphicsEffect(eff);                        // backwards: до старту елемент невидимий

    const QPoint end = w->pos();
    w->move(end.x(), end.y() + dy);

    auto* group = new QParallelAnimationGroup(w);
    auto* fade = new QPropertyAnimation(eff, "opacity", group);
    fade->setDuration(durMs);
    fade->setStartValue(0.0);
    fade->setEndValue(1.0);
    fade->setEasingCurve(theme::ease());
    auto* slide = new QPropertyAnimation(w, "pos", group);
    slide->setDuration(durMs);
    slide->setStartValue(QPoint(end.x(), end.y() + dy));
    slide->setEndValue(end);
    slide->setEasingCurve(theme::ease());
    group->addAnimation(fade);
    group->addAnimation(slide);

    QObject::connect(group, &QAbstractAnimation::finished, w, [w, eff]() {
        // прибрати ефект, щоб не гальмував подальше малювання
        QTimer::singleShot(0, w, [w, eff]() { if (w->graphicsEffect() == eff) w->setGraphicsEffect(nullptr); });
    });
    QTimer::singleShot(delayMs, group, [group]() { group->start(QAbstractAnimation::DeleteWhenStopped); });
}

} // namespace mandat::ui
