// Рушій: виборча модель і запуск гри (порт блоку «voter model» та newGame()).
#pragma once
#include <array>
#include <cstdint>
#include <string>
#include <vector>

#include "Model.hpp"

namespace mandat::core {

class Game {
public:
    GameState S;

    // --- запуск ---
    void newGame(const NewGameOptions& o);
    void initCampaign(int days, bool reelect);

    // --- допоміжні (S.* у оригіналі) ---
    bool has(const std::string& staffId) const;
    double fx(const std::string& key) const;          // ефекти штабу/партії (Фаза 2: STAFF, PARTY_TREE)
    Candidate& player() { return S.c[0]; }
    std::vector<int> active() const;                  // order без вибулих
    std::vector<int> rivalsActive() const;
    int64_t curDate() const;
    std::string nowLabel() const;
    void news(const std::string& text, const std::string& tag = "");

    // --- виборча модель ---
    std::array<double, NISS> econBoost() const;
    std::array<double, NISS> salMap(const Region& R) const;
    static double factor(const Candidate& k);
    double appeal(int region, int cand) const;
    std::array<double, NCAND + 1> shares(int region) const;    // [0..3] кандидати, [4] undecided
    double pollErr() const;
    void regenNoise();
    std::array<double, NCAND + 1> polled(int region) const;
    std::array<double, NCAND + 1> national(bool poll) const;
    int mainRival() const;
    std::array<int, NCAND> evProjection(bool poll) const;
    std::vector<int> topIssues(int n) const;
    void recordHist();
    void addEffortAll(int cand, double v, int issue = -1);
};

} // namespace mandat::core
