// Звіряє C++-ядро з еталоном, порахованим оригінальним JS (tests/golden.tsv).
// Збірка/запуск:  див. CMakeLists.txt (ціль core_tests) або  tests/run_core_tests.sh
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "core/Game.hpp"
#include "core/Rng.hpp"
#include "core/Util.hpp"

using namespace mandat::core;

static int g_fail = 0, g_ok = 0;

static void check(bool ok, const std::string& what, const std::string& got, const std::string& want) {
    if (ok) { ++g_ok; return; }
    if (++g_fail <= 40) std::cerr << "FAIL " << what << "\n   got : " << got << "\n   want: " << want << "\n";
}

static std::vector<std::string> split(const std::string& s, char d) {
    std::vector<std::string> r; std::string cur; std::stringstream ss(s);
    while (std::getline(ss, cur, d)) r.push_back(cur);
    return r;
}
static std::vector<double> nums(const std::string& s) {
    std::vector<double> r;
    for (auto& t : split(s, ' ')) if (!t.empty()) r.push_back(std::strtod(t.c_str(), nullptr));
    return r;
}
static bool near(double a, double b) { return std::fabs(a - b) <= 1e-9 * std::max(1.0, std::fabs(b)); }

static void compareVec(const std::string& what, const std::vector<double>& got, const std::vector<double>& want) {
    bool ok = got.size() == want.size();
    for (size_t i = 0; ok && i < got.size(); ++i) ok = near(got[i], want[i]);
    auto j = [](const std::vector<double>& v) { std::string s; char b[40]; for (double x : v) { std::snprintf(b, sizeof b, "%.12g ", x); s += b; } return s; };
    check(ok, what, j(got), j(want));
}

// Побудова гри під той самий сценарій, що й у make_golden.mjs
static void buildScenario(Game& g, const std::string& bio, int age, int days, int scen) {
    NewGameOptions o; o.bio = bio; o.age = age; o.days = days;
    g.newGame(o);
    if (scen == 1) {
        auto& s = g.S;
        s.econ.unemp = 8.2; s.econ.infl = 9.1; s.econ.energy = 150;
        s.flags["secBoost"] = 0.3; s.flags["healthBoost"] = 0.15;
        for (size_t i = 0; i < s.regions.size(); ++i) {
            s.regions[i].effort[0] = i * 0.7;
            s.regions[i].effort[1] = 5 - i * 0.4;
            s.regions[i].und = static_cast<double>(i % 3);
        }
        s.c[1].trust = 40; s.c[2].rec = 70; s.c[0].leanMod = 1.5;
        s.c[3].out = true;
        s.camp.left = days / 3;
    }
}

int main(int argc, char** argv) {
    const std::string path = argc > 1 ? argv[1] : "tests/golden.tsv";
    std::ifstream f(path);
    if (!f) { std::cerr << "нема файлу " << path << "\n"; return 2; }

    std::string line;
    Game g;
    std::string curTag; // кеш сценарію
    while (std::getline(f, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();   // CRLF на Windows
        auto c = split(line, '\t');
        if (c.size() < 3) continue;
        const std::string &k = c[0], &a = c[1], &want = c[2];
        const std::string w = k + " " + a;

        if (k == "f1") { std::string got = f1(std::strtod(a.c_str(), nullptr)); check(got == want, w, got, want); }
        else if (k == "pct") { std::string got = pct(std::strtod(a.c_str(), nullptr)); check(got == want, w, got, want); }
        else if (k == "num") { std::string got = num(std::strtod(a.c_str(), nullptr)); check(got == want, w, got, want); }
        else if (k == "sgn") { std::string got = sgn(std::strtod(a.c_str(), nullptr)); check(got == want, w, got, want); }
        else if (k == "money") { std::string got = money(std::strtod(a.c_str(), nullptr)); check(got == want, w, got, want); }
        else if (k == "plural") { std::string got = plural(std::strtod(a.c_str(), nullptr), "неделя", "недели", "недель"); check(got == want, w, got, want); }
        else if (k == "dstr") { std::string got = dstr(std::strtoll(a.c_str(), nullptr, 10)); check(got == want, w, got, want); }
        else if (k == "hash") { std::string got = std::to_string(hashStr(a)); check(got == want, w, got, want); }
        else if (k == "seeded") {
            Seeded r(a); std::vector<double> got; for (int i = 0; i < 8; ++i) got.push_back(r.next());
            compareVec(w, got, nums(want));
        }
        else if (k == "surname" || k == "initials") {
            // вхід у JSON-лапках
            std::string in = a.substr(1, a.size() - 2);
            std::string got = k == "surname" ? surname(in) : initials(in);
            check(got == want, w, got, want);
        }
        else if (k == "player" || k == "national" || k == "ev" || k == "top" || k == "debates" || k == "shares") {
            auto p = split(a, '/');
            const std::string bio = p[0]; const int age = std::atoi(p[1].c_str()), days = std::atoi(p[2].c_str()), scen = std::atoi(p[3].c_str());
            const std::string base = p[0] + "/" + p[1] + "/" + p[2] + "/" + p[3];
            if (curTag != base) { buildScenario(g, bio, age, days, scen); curTag = base; }
            if (k == "player") {
                const auto& P = g.S.c[0];
                compareVec(w, {P.cha, P.comp, P.trust, P.rec, g.S.budget}, nums(want));
            } else if (k == "shares") {
                const auto s = g.shares(std::atoi(p[4].c_str()));
                compareVec(w, {s[0], s[1], s[2], s[3], s[4]}, nums(want));
            } else if (k == "national") {
                const auto s = g.national(false);
                compareVec(w, {s[0], s[1], s[2], s[3], s[4]}, nums(want));
            } else if (k == "ev") {
                const auto e = g.evProjection(false);
                compareVec(w, {double(e[0]), double(e[1]), double(e[2]), double(e[3])}, nums(want));
            } else if (k == "top") {
                std::string got;
                for (int i : g.topIssues(7)) got += (got.empty() ? "" : " ") + issueInfo()[i].id;
                check(got == want, w, got, want);
            } else if (k == "debates") {
                std::string got;
                for (auto& d : g.S.camp.debates) got += (got.empty() ? "" : " ") + std::to_string(d.at);
                check(got == want, w, got, want);
            }
        }
    }

    // --- власні інваріанти (без еталона) ---
    {
        Game gg; NewGameOptions o; gg.newGame(o);
        double s = 0; auto sh = gg.shares(0); for (double v : sh) s += v;
        check(near(s, 100), "shares sum = 100", std::to_string(s), "100");
        check(gg.S.camp.hist.size() == 1, "recordHist at start", std::to_string(gg.S.camp.hist.size()), "1");
        check(gg.S.news.size() == 2 && gg.S.news[0].text.find("5,1%") != std::string::npos, "news order", gg.S.news[0].text, "…5,1%…");
        const std::string wantDate = dstr(utcMs(2028, 10, 7) - 182 * DAY_MS);
        check(gg.S.news[0].date == wantDate, "news date label", gg.S.news[0].date, wantDate);
    }

    std::printf("core tests: %d passed, %d failed\n", g_ok, g_fail);
    return g_fail ? 1 : 0;
}
