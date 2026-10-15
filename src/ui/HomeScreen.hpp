// Главная страница (порт screens/Menu.jsx + menu.css): фон-фото с медленным зумом,
// затемнение, логотип, три большие кнопки и ссылки.
#pragma once
#include <QElapsedTimer>
#include <QPixmap>
#include <QTimer>
#include <QWidget>

namespace mandat::ui {

class HomeButton;
class GradientLabel;

class HomeScreen : public QWidget {
    Q_OBJECT
public:
    explicit HomeScreen(QWidget* parent = nullptr);
    void refresh();            // перечитати збереження (кнопка «Продолжить»)
    void playEnter();          // .screen-enter: поява елементів із затримкою
signals:
    void newGameRequested();
    void continueRequested();
    void quickStartRequested();
    void settingsRequested();
    void achievementsRequested();
    void howToRequested();
protected:
    void paintEvent(QPaintEvent*) override;
    void resizeEvent(QResizeEvent*) override;
    void showEvent(QShowEvent*) override;
    void hideEvent(QHideEvent*) override;
private:
    void layoutInner();
    bool narrow() const { return width() <= 760; }

    QPixmap bg_;
    QWidget* inner_ = nullptr;
    GradientLabel* logo_ = nullptr;
    QWidget* tag_ = nullptr;
    HomeButton *bNew_ = nullptr, *bContinue_ = nullptr, *bQuick_ = nullptr;
    QWidget* links_ = nullptr;
    QTimer tick_;
    QElapsedTimer clock_;
    qreal ken_ = 0;            // 0..1: a-ken alternate infinite (26 с туди, 26 с назад)
};

} // namespace mandat::ui
