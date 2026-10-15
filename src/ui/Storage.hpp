// Локальне сховище (замінює localStorage оригіналу).
// Файл: %APPDATA%\Mandat\Mandat.ini (QSettings::IniFormat) — легко копіювати між ПК.
// Ключі збережено як в оригіналі: mandat-save-v1 / mandat-settings / mandat-ach.
#pragma once
#include <QString>
#include <QStringList>

namespace mandat::ui {

struct SaveInfo {
    bool valid = false;       // є збереження з полем phase
    QString phase, name;
    int week = -1;            // camp.week (для фази campaign)
};

class Storage {
public:
    // збереження гри (JSON, формат сумісний з оригінальним S)
    static QString saveJson();
    static void setSaveJson(const QString& json);
    static void wipeSave();
    static SaveInfo saveInfo();

    // налаштування (fastNight, noTimer)
    static bool flag(const QString& key);
    static void setFlag(const QString& key, bool on);

    // відкриті досягнення
    static QStringList achievements();
    static void setAchievements(const QStringList& ids);
};

} // namespace mandat::ui
