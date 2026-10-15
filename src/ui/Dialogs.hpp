// Модальні вікна меню: Настройки, Достижения, Как играть, Удалить сохранение.
// (порт A.settings / A.achievements / A.howto / A.restartAsk з game.js)
#pragma once
#include <QString>
#include <QWidget>

namespace mandat::ui {

// Інтерфейс, через який діалоги спілкуються з головним вікном.
class DialogHost {
public:
    virtual ~DialogHost() = default;
    virtual void openModal(QWidget* content, bool wide = false) = 0;
    virtual void closeModal() = 0;
    virtual void toast(const QString& html) = 0;
    virtual void saveWiped() = 0;          // A.restart: після видалення збереження
};

namespace Dialogs {
QWidget* settings(DialogHost* host);
QWidget* achievements(DialogHost* host);
QWidget* howTo(DialogHost* host);
QWidget* restartAsk(DialogHost* host);
}

} // namespace mandat::ui
