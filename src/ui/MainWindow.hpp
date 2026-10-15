#pragma once
#include <QMainWindow>
#include <QStackedWidget>

#include "Dialogs.hpp"

namespace mandat::ui {

class HomeScreen;
class ModalOverlay;
class Toast;

// Головне вікно: стек екранів (замість React-роутера за S.phase) + модальний шар і тости.
class MainWindow : public QMainWindow, public DialogHost {
    Q_OBJECT
public:
    MainWindow();

    // DialogHost
    void openModal(QWidget* content, bool wide = false) override;
    void closeModal() override;
    void toast(const QString& html) override;
    void saveWiped() override;

    void showMenu();                    // A.backMenu

protected:
    void resizeEvent(QResizeEvent*) override;

private:
    void notYetPorted(const QString& what);

    QStackedWidget* stack_ = nullptr;
    HomeScreen* home_ = nullptr;
    ModalOverlay* overlay_ = nullptr;
    Toast* toast_ = nullptr;
};

} // namespace mandat::ui
