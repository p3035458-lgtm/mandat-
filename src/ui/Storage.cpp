#include "Storage.hpp"

#include <QJsonDocument>
#include <QJsonObject>
#include <QSettings>

namespace mandat::ui {

static QSettings& cfg() {
    static QSettings s(QSettings::IniFormat, QSettings::UserScope, "Mandat", "Mandat");
    return s;
}

QString Storage::saveJson() { return cfg().value("mandat-save-v1").toString(); }

void Storage::setSaveJson(const QString& json) {
    cfg().setValue("mandat-save-v1", json);
    cfg().sync();
}

void Storage::wipeSave() {
    cfg().remove("mandat-save-v1");
    cfg().sync();
}

SaveInfo Storage::saveInfo() {
    SaveInfo info;
    const QString json = saveJson();
    if (json.isEmpty()) return info;
    const QJsonDocument doc = QJsonDocument::fromJson(json.toUtf8());
    if (!doc.isObject()) return info;
    const QJsonObject o = doc.object();
    info.phase = o.value("phase").toString();
    info.valid = !info.phase.isEmpty();
    info.name = o.value("name").toString();
    info.week = o.value("camp").toObject().value("week").toInt(-1);
    return info;
}

bool Storage::flag(const QString& key) { return cfg().value("mandat-settings/" + key, false).toBool(); }

void Storage::setFlag(const QString& key, bool on) {
    cfg().setValue("mandat-settings/" + key, on);
    cfg().sync();
}

QStringList Storage::achievements() { return cfg().value("mandat-ach").toStringList(); }

void Storage::setAchievements(const QStringList& ids) {
    cfg().setValue("mandat-ach", ids);
    cfg().sync();
}

} // namespace mandat::ui
