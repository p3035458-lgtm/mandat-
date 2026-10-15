// Статичні дані гри (регіони, суперники, біографії). Таблиці генеруються
// tools/gen_data.mjs прямо з оригінального game.js (DataTables.gen.cpp).
#pragma once
#include <array>
#include <string>
#include <utility>
#include <vector>

namespace mandat::core {

constexpr int NISS = 7;    // prices, health, jobs, security, ecology, education, corruption
constexpr int NCAND = 4;   // player, carter, miller, wilson  (S.order в оригіналі)

enum Issue { Prices, Health, Jobs, Security, Ecology, Education, Corruption };

struct IssueInfo { std::string id, name; };

struct Region {
    std::string id, name;
    double pop;
    int ev, turn, undec;
    double youth;
    int report;
    double gdpc, un;
    std::string desc;
    std::array<int, 4> box;                 // рамка підпису на карті (433x250)
    std::vector<std::pair<int, int>> hot;   // контур клікабельної області
    std::array<double, NISS> sal;           // значущість тем
    std::array<double, NCAND> lean;         // базова підтримка кандидатів
};

struct Rival {
    std::string id, name, party, color;
    double trust, rec;
    int power;
    std::string deal;
    std::array<double, NISS> issues;
    std::string blurb;
};

struct Bio {
    std::string id, name, desc;
    double cha, comp, budget, trust, rec;
    std::vector<std::pair<int, double>> issues;       // перекриває базові 18
    std::vector<std::pair<std::string, double>> bonus; // регіон -> бонус
    double skeleton;
    std::string skel;
};

struct AchievementDef { std::string id, title, desc; };

const std::array<IssueInfo, NISS>& issueInfo();
const std::vector<Region>& regions();
const std::vector<Rival>& rivals();   // carter, miller, wilson
const std::vector<Bio>& bios();
const std::vector<AchievementDef>& achievementDefs();   // умови — у Фазі 3 (потрібен S.career)

int regionIndex(const std::string& id);          // REGI(); -1 якщо нема
const Bio* findBio(const std::string& id);
inline const char* countryName() { return "Ардания"; }

} // namespace mandat::core
