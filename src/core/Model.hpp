// Модель стану гри (S у оригіналі). Фаза 1: кампанія + виборча модель.
#pragma once
#include <array>
#include <cstdint>
#include <map>
#include <string>
#include <vector>

#include "Data.hpp"

namespace mandat::core {

struct Candidate {
    std::string id, name, shortName, party, color;
    double cha = 0, comp = 0;
    double trust = 0, trust0 = 0, rec = 0;
    std::array<double, NISS> issues{};
    std::map<std::string, double> bonus;      // регіон -> бонус
    double leanMod = 0, lean0 = 0;
    int power = 0, pause = 0, dirt = 0;
    std::string deal, blurb;
    bool out = false, fem = false;
};

struct RegionState {
    std::array<double, NCAND> effort{};
    double und = 0, gotv = 0;
    bool flood = false;
};

struct Econ {
    double gdp = 1.2e12, growth = 1.8, trend = 2.0, infl = 4.2, unemp = 5.1, wage = 3200;
    double debt = 744e9, revenue = 310e9, spending = 340e9, energy = 100, rate = 4.5;
    bool recession = false;
};

struct Debate { int at = 0, n = 0; bool done = false; };

struct HistPoint {                                // recordHist()
    int week = 0;
    std::array<double, NCAND> v{};
    std::array<bool, NCAND> has{};
    double und = 0;
};

struct Campaign {
    int total = 0, left = 0, week = 0;
    int ap = 10, apMax = 10;
    int64_t date = 0;                             // день виборів (UTC ms)
    bool reelect = false, precise = false, costWarned = false;
    std::vector<std::array<double, NCAND>> noise; // по регіонах
    std::array<double, NCAND> natNoise{};
    std::vector<Debate> debates;
    std::vector<HistPoint> hist;
    double lastIncome = 0, lastSalary = 0;
};

struct NewsItem { std::string text, tag, date; };

struct GameState {
    int ver = 1;
    std::string phase = "campaign";
    int cycle = 1;
    std::string name, party, bio;
    double budget = 0;
    std::vector<std::string> staff;
    std::vector<NewsItem> news;               // новіші спереду (unshift)
    std::map<std::string, double> flags;
    std::string tab = "actions";
    int sel = 2;
    Econ econ, econ0;
    int look = 0, age = 48;
    double scan = 0;
    std::array<Candidate, NCAND> c;
    std::vector<int> order{0, 1, 2, 3};       // індекси в c: player, carter, miller, wilson
    std::vector<RegionState> regions;
    Campaign camp;
};

struct NewGameOptions {
    std::string name = "Илья Руденко", party = "Новый курс", bio = "biz";
    int days = 182, age = 34, look = 0;
    bool hasStats = false;                    // розподіл очок з екрана створення
    double statTrust = 0, statPop = 0, statCha = 0, statComp = 0, statScan = 0;
};

} // namespace mandat::core
