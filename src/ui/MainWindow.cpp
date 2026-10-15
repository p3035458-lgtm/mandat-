#include "MainWindow.hpp"

#include <QHBoxLayout>
#include <QTimer>
#include <QVBoxLayout>

#include "HomeScreen.hpp"
#include "Modal.hpp"
#include "Storage.hpp"

namespace mandat::ui {

MainWindow::MainWindow() {
    setWindowTitle(QStringLiteral("Mandate"));
    setMinimumSize(900, 620);
    resize(1280, 820);

    auto* root = new QWidget;
    root->setObjectName("root");
    setCentralWidget(root);

    // .wrap: padding 16px, max-width 1440px, по центру
    auto* outer = new QHBoxLayout(root);
    outer->setContentsMargins(16, 16, 16, 16);
    outer->addStretch(1);
    stack_ = new QStackedWidget;
    stack_->setMaximumWidth(1440);
    stack_->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Expanding);
    outer->addWidget(stack_, 100);
    outer->addStretch(1);

    home_ = new HomeScreen;
    stack_->addWidget(home_);

    overlay_ = new ModalOverlay(root);
    toast_ = new Toast(root);

    // Меню → дії (A.goSetup, A.continue, A.quick, A.settings, A.achievements, A.howto)
    connect(home_, &HomeScreen::newGameRequested, this, [this] { notYetPorted(QStringLiteral("Создание кандидата")); });
    connect(home_, &HomeScreen::continueRequested, this, [this] { notYetPorted(QStringLiteral("Загрузка кампании")); });
    connect(home_, &HomeScreen::quickStartRequested, this, [this] { notYetPorted(QStringLiteral("Быстрый старт")); });
    connect(home_, &HomeScreen::settingsRequested, this, [this] { openModal(Dialogs::settings(this)); });
    connect(home_, &HomeScreen::achievementsRequested, this, [this] { openModal(Dialogs::achievements(this)); });
    connect(home_, &HomeScreen::howToRequested, this, [this] { openModal(Dialogs::howTo(this)); });

    showMenu();
}

void MainWindow::showMenu() {
    home_->refresh();
    stack_->setCurrentWidget(home_);
    QTimer::singleShot(0, home_, &HomeScreen::playEnter);     // анимація входу лише при зміні екрана
}

void MainWindow::notYetPorted(const QString& what) {
    // Екрани гри переносяться поетапно (див. README, «Фаза 2»).
    toast(QStringLiteral("«%1» ещё переносится на C++ (следующая фаза порта).").arg(what));
}

void MainWindow::openModal(QWidget* content, bool wide) { overlay_->present(content, wide); }
void MainWindow::closeModal() { overlay_->dismiss(); }
void MainWindow::toast(const QString& html) { toast_->showText(html); }
void MainWindow::saveWiped() { showMenu(); }

void MainWindow::resizeEvent(QResizeEvent* e) {
    QMainWindow::resizeEvent(e);
    if (overlay_ && centralWidget()) {
        overlay_->setGeometry(centralWidget()->rect());
        overlay_->relayout();
    }
    if (toast_ && toast_->isVisible()) toast_->reposition();
}

} // namespace mandat::ui
