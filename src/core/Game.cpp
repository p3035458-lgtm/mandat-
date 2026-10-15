#include "Game.hpp"

#include <algorithm>
#include <cmath>

#include "Rng.hpp"
#include "Util.hpp"

namespace mandat::core {

// ============================ запуск гри ============================

void Game::newGame(const NewGameOptions& o) {
    const Bio* bio = findBio(o.bio);
    if (!bio) bio = &bios().front();

    S = GameState{};
    S.name = o.name;
    S.party = o.party;
    S.bio = bio->id;
    S.budget = bio->budget;
    S.econ0 = S.econ;
    S.flags["recWeek"] = chance() < .65 ? ri(5, 13) : -1;

    std::array<double, NISS> issues;
    issues.fill(18);
    for (const auto& [i, v] : bio->issues) issues[i] = v;

    S.look = o.look;
    S.age = o.age ? o.age : 48;
    const int ag = S.age;

    Candidate& P = S.c[0];
    P.id = "player";
    P.cha = clamp<double>(bio->cha + (ag < 45 ? 5 : ag > 60 ? -5 : 0), 20, 95);
    P.comp = clamp<double>(bio->comp + (ag > 50 ? 5 : ag < 36 ? -6 : 0), 20, 95);
    P.name = o.name;
    P.shortName = surname(o.name);
    P.party = o.party;
    P.color = "#4a90ff";
    P.trust = P.trust0 = bio->trust;
    P.rec = bio->rec;
    P.issues = issues;
    for (const auto& [k, v] : bio->bonus) P.bonus[k] = v;
    P.out = false;

    int slot = 1;
    for (const Rival& r : rivals()) {
        Candidate& k = S.c[slot++];
        k.id = r.id;
        k.name = r.name;
        k.shortName = surname(r.name);
        k.party = r.party;
        k.color = r.color;
        k.trust = k.trust0 = r.trust;
        k.rec = r.rec;
        k.issues = r.issues;
        k.power = r.power;
        k.deal = r.deal;
        k.blurb = r.blurb;
        k.out = false;
        k.dirt = 0;
        k.fem = r.id == "miller";
        k.lean0 = 0;
    }

    if (o.hasStats) {
        P.trust = P.trust0 = o.statTrust;
        P.rec = o.statPop;
        P.cha = o.statCha;
        P.comp = o.statComp;
        S.scan = o.statScan / 100;
    }

    S.order = {0, 1, 2, 3};
    initCampaign(o.days, false);
    news(o.name + " объявил о выдвижении в президенты Арданы", "camp");
    news("Безработица в Ардании: 5,1%. Инфляция: 4,2%", "econ");
}

void Game::initCampaign(int days, bool reelect) {
    const int64_t elDate = S.cycle == 1 ? utcMs(2028, 10, 7) : utcMs(2032, 10, 2);
    S.regions.assign(regions().size(), RegionState{});
    S.sel = regionIndex("central");

    Campaign cp;
    cp.total = days;
    cp.left = days;
    cp.week = 0;
    cp.ap = 10 + static_cast<int>(fx("ap"));
    cp.apMax = cp.ap;
    cp.date = elDate;
    cp.reelect = reelect;
    cp.precise = false;
    const std::vector<int> deb = days > 200 ? std::vector<int>{150, 80, 21} : std::vector<int>{80, 21};
    int n = 0;
    for (int at : deb) cp.debates.push_back({at, ++n, false});
    S.camp = cp;
    S.phase = "campaign";
    S.tab = "actions";
    regenNoise();
    recordHist();
}

// ============================ помічники ============================

bool Game::has(const std::string& id) const {
    return std::find(S.staff.begin(), S.staff.end(), id) != S.staff.end();
}

double Game::fx(const std::string&) const {
    // Фаза 2: сума ефектів STAFF[...].fx[k] + partyFx(k). До перенесення таблиць
    // штаб порожній, тому ефект рівно 0 — це збігається з початком будь-якої гри.
    return 0;
}

std::vector<int> Game::active() const {
    std::vector<int> r;
    for (int c : S.order) if (!S.c[c].out) r.push_back(c);
    return r;
}

std::vector<int> Game::rivalsActive() const {
    std::vector<int> r;
    for (int c : active()) if (c != 0) r.push_back(c);
    return r;
}

int64_t Game::curDate() const { return S.camp.date - static_cast<int64_t>(S.camp.left) * DAY_MS; }

std::string Game::nowLabel() const {
    // Фаза 2: для президентства qLabel(S.pres.q).
    if (S.camp.total > 0) return dstr(curDate());
    return "";
}

void Game::news(const std::string& text, const std::string& tag) {
    S.news.insert(S.news.begin(), NewsItem{text, tag, nowLabel()});
    if (S.news.size() > 90) S.news.resize(90);
}

// ============================ виборча модель ============================

std::array<double, NISS> Game::econBoost() const {
    const Econ& e = S.econ;
    std::array<double, NISS> b{};
    b[Jobs] = std::max(0.0, (e.unemp - 5) * .35);
    b[Prices] = std::max(0.0, (e.infl - 3) * .18) + std::max(0.0, (e.energy - 110) / 100);
    auto fl = [&](const char* k) { auto it = S.flags.find(k); return it == S.flags.end() ? 0.0 : it->second; };
    b[Security] = fl("secBoost");
    b[Health] = fl("healthBoost");
    return b;
}

std::array<double, NISS> Game::salMap(const Region& R) const {
    const auto b = econBoost();
    std::array<double, NISS> m{};
    double t = 0;
    for (int i = 0; i < NISS; ++i) { m[i] = R.sal[i] * (1 + b[i]); t += m[i]; }
    for (int i = 0; i < NISS; ++i) m[i] /= t;
    return m;
}

double Game::factor(const Candidate& k) { return (.7 + k.trust / 100 * .6) * (.55 + k.rec / 100 * .5); }

double Game::appeal(int i, int c) const {
    const Region& R = regions()[i];
    const RegionState& st = S.regions[i];
    const Candidate& k = S.c[c];
    if (k.out) return 0;
    const auto sm = salMap(R);
    double fit = 0;
    for (int x = 0; x < NISS; ++x) fit += sm[x] * k.issues[x];
    auto bi = k.bonus.find(R.id);
    const double bonus = bi == k.bonus.end() ? 0.0 : bi->second;
    const double a = R.lean[c] + k.leanMod + bonus + st.effort[c] + fit * .14;
    return std::max(1.0, a * factor(k));
}

std::array<double, NCAND + 1> Game::shares(int i) const {
    const Region& R = regions()[i];
    const RegionState& st = S.regions[i];
    const Campaign& cp = S.camp;
    const double u = std::max(1.0, (R.undec + st.und) * (.4 + .6 * std::max(0, cp.left) / static_cast<double>(cp.total)));
    std::array<double, NCAND + 1> o{};
    double t = u;
    for (int c : S.order) { o[c] = appeal(i, c); t += o[c]; }
    for (int c : S.order) o[c] = o[c] / t * 100;
    o[NCAND] = u / t * 100;
    return o;
}

double Game::pollErr() const { return S.camp.precise ? .6 : has("analyst") ? 1.5 : 3.5; }

void Game::regenNoise() {
    const double e = pollErr();
    S.camp.noise.assign(regions().size(), {});
    for (auto& n : S.camp.noise) for (int c : S.order) n[c] = gauss() * e / 2;
    S.camp.natNoise = {};
    for (int c : S.order) S.camp.natNoise[c] = gauss() * e / 4;
}

std::array<double, NCAND + 1> Game::polled(int i) const {
    const auto s = shares(i);
    const auto& n = S.camp.noise[i];
    std::array<double, NCAND + 1> o{};
    double t = 0;
    for (int c : S.order) { o[c] = S.c[c].out ? 0 : std::max(.3, s[c] + n[c]); t += o[c]; }
    o[NCAND] = s[NCAND];
    t += o[NCAND];
    for (auto& v : o) v = v / t * 100;
    return o;
}

std::array<double, NCAND + 1> Game::national(bool poll) const {
    std::array<double, NCAND + 1> o{};
    double P = 0;
    const auto& regs = regions();
    for (size_t i = 0; i < regs.size(); ++i) {
        const auto s = poll ? polled(static_cast<int>(i)) : shares(static_cast<int>(i));
        P += regs[i].pop;
        for (int k = 0; k <= NCAND; ++k) o[k] += s[k] * regs[i].pop;
    }
    for (auto& v : o) v /= P;
    if (poll)
        for (int c : S.order)
            if (!S.c[c].out) o[c] = std::max(.3, o[c] + S.camp.natNoise[c]);
    return o;
}

int Game::mainRival() const {
    const auto n = national(false);
    auto r = rivalsActive();
    if (r.empty()) return -1;
    std::stable_sort(r.begin(), r.end(), [&](int a, int b) { return n[b] < n[a]; });
    return r.front();
}

std::array<int, NCAND> Game::evProjection(bool poll) const {
    std::array<int, NCAND> o{};
    const auto& regs = regions();
    const auto act = active();
    for (size_t i = 0; i < regs.size(); ++i) {
        const auto s = poll ? polled(static_cast<int>(i)) : shares(static_cast<int>(i));
        int best = -1;
        for (int c : act) if (best < 0 || s[c] > s[best]) best = c;
        if (best >= 0) o[best] += regs[i].ev;
    }
    return o;
}

std::vector<int> Game::topIssues(int n) const {
    std::array<double, NISS> tot{};
    for (const Region& R : regions()) {
        const auto m = salMap(R);
        for (int i = 0; i < NISS; ++i) tot[i] += m[i] * R.pop;
    }
    std::vector<int> idx(NISS);
    for (int i = 0; i < NISS; ++i) idx[i] = i;
    std::stable_sort(idx.begin(), idx.end(), [&](int a, int b) { return tot[b] < tot[a]; });
    idx.resize(std::min<size_t>(n, idx.size()));
    return idx;
}

void Game::recordHist() {
    const auto n = national(true);
    HistPoint h;
    h.week = S.camp.week;
    for (int c : S.order) { h.has[c] = !S.c[c].out; h.v[c] = S.c[c].out ? 0 : n[c]; }
    h.und = n[NCAND];
    S.camp.hist.push_back(h);
}

void Game::addEffortAll(int c, double v, int issue) {
    const auto& regs = regions();
    for (size_t i = 0; i < regs.size(); ++i) {
        const double w = issue >= 0 ? (.5 + 3 * salMap(regs[i])[issue]) : 1.0;
        S.regions[i].effort[c] += v * w;
    }
}

} // namespace mandat::core
