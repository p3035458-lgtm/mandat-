// Модальне вікно поверх екрана (#modal / .mback / .modal) і тост (#toastbox / .toast).
#pragma once
#include <QFrame>
#include <QLabel>
#include <QMouseEvent>
#include <QScrollArea>
#include <QTimer>
#include <QWidget>

namespace mandat::ui {

class ModalOverlay : public QWidget {
    Q_OBJECT
public:
    explicit ModalOverlay(QWidget* parent);
    // Показує content (власність переходить до вікна). wide → ширина до 980px замість 680px.
    void present(QWidget* content, bool wide = false);
    void dismiss();                       // A.close / closeModal
    bool isOpen() const { return open_; }
    void relayout();
protected:
    void paintEvent(QPaintEvent*) override;
    void resizeEvent(QResizeEvent*) override { relayout(); }
    void mousePressEvent(QMouseEvent* e) override { e->accept(); }   // клік по затемненню нічого не робить
private:
    QFrame* panel_ = nullptr;
    QScrollArea* scroll_ = nullptr;
    QWidget* content_ = nullptr;
    bool wide_ = false, open_ = false;
};

class Toast : public QLabel {
    Q_OBJECT
public:
    explicit Toast(QWidget* parent);
    void showText(const QString& html);   // toast(t): 4200 мс
    void reposition();
private:
    QTimer hide_;
};

// ---- helpers для побудови вмісту модалок (.mhead / .mbody) ----
QWidget* makeModalContent(const QString& kicker, const char* tone, const QString& title, QWidget* body);
QWidget* makeBody(QWidget* parent = nullptr);   // QWidget з QVBoxLayout(16,18,16,18; spacing 12)

} // namespace mandat::ui
