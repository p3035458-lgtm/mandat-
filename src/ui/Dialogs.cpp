#include "Dialogs.hpp"

#include <QFrame>
#include <QGraphicsOpacityEffect>
#include <QHBoxLayout>
#include <QLabel>
#include <QSet>
#include <QVBoxLayout>

#include "core/Data.hpp"
#include "Modal.hpp"
#include "Storage.hpp"
#include "Theme.hpp"
#include "Widgets.hpp"

namespace mandat::ui::Dialogs {

using mandat::core::achievementDefs;

static QString u(const std::string& s) { return QString::fromUtf8(s.data(), static_cast<int>(s.size())); }

// ---------------- Настройки ----------------
QWidget* settings(DialogHost* host) {
    QWidget* body = makeBody();
    auto* lay = qobject_cast<QVBoxLayout*>(body->layout());

    auto* fast = new SwitchButton(QStringLiteral("Быстрая ночь выборов (сразу ×3)"), Storage::flag("fastNight"));
    QObject::connect(fast, &QAbstractButton::toggled, [](bool on) { Storage::setFlag("fastNight", on); });
    lay->addWidget(fast);

    auto* noTimer = new SwitchButton(QStringLiteral("Без таймера на дебатах"), Storage::flag("noTimer"));
    QObject::connect(noTimer, &QAbstractButton::toggled, [](bool on) { Storage::setFlag("noTimer", on); });
    lay->addWidget(noTimer);

    auto* del = makeButton(QStringLiteral("Удалить сохранение"), "danger");
    QObject::connect(del, &QPushButton::clicked, [host]() { host->openModal(restartAsk(host)); });
    lay->addWidget(del);

    auto* done = makeButton(QStringLiteral("Готово"), "primary");
    QObject::connect(done, &QPushButton::clicked, [host]() { host->closeModal(); });
    lay->addWidget(done);

    return makeModalContent(QStringLiteral("Настройки"), "blue", QStringLiteral("Настройки игры"), body);
}

// ---------------- Достижения ----------------
QWidget* achievements(DialogHost* host) {
    const QStringList gotList = Storage::achievements();           // один список: ітератори з різних тимчасових — UB
    const QSet<QString> got(gotList.begin(), gotList.end());
    const auto& defs = achievementDefs();
    int unlocked = 0;
    for (const auto& a : defs) if (got.contains(u(a.id))) ++unlocked;

    QWidget* body = makeBody();
    auto* lay = qobject_cast<QVBoxLayout*>(body->layout());

    auto* list = new QVBoxLayout;
    list->setSpacing(8);
    for (const auto& a : defs) {
        const bool ok = got.contains(u(a.id));
        auto* item = new QFrame;
        item->setProperty("card", "item");
        auto* row = new QHBoxLayout(item);
        row->setContentsMargins(12, 10, 12, 10);
        row->setSpacing(12);

        auto* st = new QLabel(ok ? QStringLiteral("★") : QStringLiteral("·"));   // .st.done / .st.wait
        st->setFixedSize(18, 18);
        st->setAlignment(Qt::AlignCenter);
        st->setStyleSheet(ok ? "background:#3fcf7f;color:#04210f;border-radius:9px;font-size:12px;font-weight:700;"
                             : "background:#1a2b4d;color:#93a5c4;border:1px solid #2c4675;border-radius:9px;font-size:12px;font-weight:700;");
        row->addWidget(st, 0, Qt::AlignTop);

        auto* col = new QVBoxLayout;
        col->setSpacing(0);
        auto* t = new QLabel(QString("<b>%1</b>").arg(u(a.title).toHtmlEscaped()));
        auto* d = new QLabel(u(a.desc));
        d->setWordWrap(true);
        d->setStyleSheet("color:#93a5c4;font-size:13px;");
        col->addWidget(t);
        col->addWidget(d);
        row->addLayout(col, 1);

        if (!ok) {                                  // opacity:.55 у неоткритих
            auto* eff = new QGraphicsOpacityEffect(item);
            eff->setOpacity(.55);
            item->setGraphicsEffect(eff);
        }
        list->addWidget(item);
    }
    lay->addLayout(list);

    auto* close = makeButton(QStringLiteral("Закрыть"), "primary");
    QObject::connect(close, &QPushButton::clicked, [host]() { host->closeModal(); });
    lay->addWidget(close);

    return makeModalContent(QStringLiteral("Достижения"), "blue",
                            QString("%1/%2 открыто").arg(unlocked).arg(defs.size()), body);
}

// ---------------- Как играть ----------------
QWidget* howTo(DialogHost* host) {
    static const char* P[] = {
        "<b>Кампания.</b> Каждую неделю у кандидата 3 часа (больше с руководителем кампании). Митинги и реклама работают в регионах, речи дают обещания, интервью и соцсети — узнаваемость.",
        "<b>Деньги за голоса.</b> Раздача денег избирателям даёт быстрый прирост, особенно в бедных регионах. Каждая раздача копит риск огласки и скандала, повторные в том же регионе работают слабее.",
        "<b>Бюджет.</b> Деньги ограничены: штаб, зарплаты и охрана стоят каждую неделю. Перед платой выберите размер суммы: скромно, стандартно или щедро. Прогноз недели виден в верхней панели и на вкладке «Лобби и охрана».",
        "<b>Лоббисты.</b> Группы влияния платят за обещания и поддержку, но сдвигают вас к элитам и копят риск утечки. Отказ и борьба с олигархами сдвигают вас к народу, зато появляются враги, а с ними угроза покушений: наймите охрану.",
        "<b>Армия.</b> Яркие генералы продаются за деньги, но дорого и с риском огласки. Лояльность армии складывается из лояльности подкупленных генералов с учётом их влияния. При высокой лояльности и поддержке столичного гарнизона можно начать операцию «Рассвет»: успех даёт власть без выборов, провал означает конец карьеры.",
        "<b>Партия.</b> Должности в древе фракции дают лояльность элиты и бонусы. Лояльность можно тратить на мобилизацию отделений. Во вкладке «Партия» можно подкупать людей из окружения соперников, но риск огласки растёт.",
        "<b>Покушения.</b> Угрозы и нападения случаются редко. Охрана снижает последствия, а удачное решение превращает событие в сочувствие избирателей.",
        "<b>Выборы.</b> 9 регионов, 538 выборщиков, для победы нужно 270. Ночью голоса подсчитываются вживую, лидер в регионе может смениться.",
        "<b>Президентство.</b> 16 кварталов. Законы проходят через парламент (251 из 500), кризисы требуют решений, обещания отслеживаются.",
        "<b>Вторые выборы.</b> Соперник процитирует каждое невыполненное обещание.",
    };
    QWidget* body = makeBody();
    auto* lay = qobject_cast<QVBoxLayout*>(body->layout());
    for (const char* p : P) lay->addWidget(makeText(QString::fromUtf8(p)));
    lay->addWidget(makeText(QStringLiteral("Сохранение автоматическое."), true));
    auto* ok = makeButton(QStringLiteral("Понятно"), "primary");
    QObject::connect(ok, &QPushButton::clicked, [host]() { host->closeModal(); });
    lay->addWidget(ok);
    return makeModalContent(QStringLiteral("Как играть"), "blue", QStringLiteral("Четыре стадии карьеры"), body);
}

// ---------------- Удалить сохранение ----------------
QWidget* restartAsk(DialogHost* host) {
    QWidget* body = makeBody();
    auto* lay = qobject_cast<QVBoxLayout*>(body->layout());
    lay->addWidget(makeText(QStringLiteral("Прогресс будет потерян без возможности восстановления.")));
    auto* row = new QHBoxLayout;
    row->setSpacing(10);
    auto* yes = makeButton(QStringLiteral("Да, начать заново"), "danger");
    auto* no = makeButton(QStringLiteral("Отмена"), "btn");
    row->addWidget(yes);
    row->addWidget(no);
    row->addStretch();
    lay->addLayout(row);
    QObject::connect(yes, &QPushButton::clicked, [host]() {          // A.restart
        Storage::wipeSave();
        host->closeModal();
        host->saveWiped();
    });
    QObject::connect(no, &QPushButton::clicked, [host]() { host->closeModal(); });
    return makeModalContent(QStringLiteral("Внимание"), "red", QStringLiteral("Удалить текущую карьеру?"), body);
}

} // namespace mandat::ui::Dialogs
