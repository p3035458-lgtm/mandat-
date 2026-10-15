// Власні віджети: кнопка головного меню (.hbtn), логотип із градієнтом (.home-logo),
// перемикач (.toggle/.sw), а також фабрики кнопок і kicker-міток.
#pragma once
#include <QAbstractButton>
#include <QLabel>
#include <QPushButton>
#include <QString>

namespace mandat::ui {

// kind: "btn" | "primary" | "danger" | "ghost" | "hlink"
QPushButton* makeButton(const QString& text, const char* kind = "btn", QWidget* parent = nullptr);
// tone: "red" | "blue" | "amber"
QLabel* makeKicker(const QString& text, const char* tone = "red", QWidget* parent = nullptr);
QLabel* makeText(const QString& html, bool muted = false, QWidget* parent = nullptr);

// ---- .hbtn: велика кнопка меню з іконкою, заголовком і підписом ----
class HomeButton : public QAbstractButton {
    Q_OBJECT
    Q_PROPERTY(qreal slide READ slide WRITE setSlide)
public:
    HomeButton(const QString& icon, const QString& title, const QString& subtitle,
               bool primary, QWidget* parent = nullptr);
    void setSubtitle(const QString& s) { subtitle_ = s; update(); }
    QSize sizeHint() const override;
    QSize minimumSizeHint() const override { return {200, sizeHint().height()}; }
    qreal slide() const { return slide_; }
    void setSlide(qreal v) { slide_ = v; update(); }
protected:
    void paintEvent(QPaintEvent*) override;
    void enterEvent(QEnterEvent*) override;
    void leaveEvent(QEvent*) override;
private:
    void animateTo(qreal v);
    QString icon_, title_, subtitle_;
    bool primary_;
    bool hover_ = false;
    qreal slide_ = 0;
};

// ---- .home-logo: заголовок із вертикальним градієнтом (#fff → #8fa3c8) ----
class GradientLabel : public QWidget {
    Q_OBJECT
public:
    explicit GradientLabel(const QString& text, QWidget* parent = nullptr);
    void setPixelSize(int px);
    QSize sizeHint() const override;
protected:
    void paintEvent(QPaintEvent*) override;
private:
    QFont logoFont() const;
    QString text_;
    int px_ = 84;
};

// ---- .toggle + .sw: рядок із перемикачем ----
class SwitchButton : public QAbstractButton {
    Q_OBJECT
    Q_PROPERTY(qreal knob READ knob WRITE setKnob)
public:
    SwitchButton(const QString& label, bool on, QWidget* parent = nullptr);
    QSize sizeHint() const override;
    qreal knob() const { return knob_; }
    void setKnob(qreal v) { knob_ = v; update(); }
protected:
    void paintEvent(QPaintEvent*) override;
    void nextCheckState() override;
    void enterEvent(QEnterEvent*) override { hover_ = true; update(); }
    void leaveEvent(QEvent*) override { hover_ = false; update(); }
private:
    QString label_;
    qreal knob_;
    bool hover_ = false;
};

} // namespace mandat::ui
