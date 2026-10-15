#include "Util.hpp"

#include <cmath>
#include <cstdio>
#include <vector>

namespace mandat::core {

static const char* kMinus = "\xE2\x88\x92";   // U+2212 «−»
static const char* kNbsp = "\xC2\xA0";        // U+00A0

double jsRound(double v) {
    double r = std::floor(v + 0.5);
    return r == 0 ? 0.0 : r;                  // без «-0»
}

std::string f1(double v) {
    double r = jsRound(v * 10) / 10;
    if (r == 0) r = 0;
    char buf[64];
    std::snprintf(buf, sizeof buf, "%.1f", r);
    std::string s = buf;
    auto p = s.find('.');
    if (p != std::string::npos) s[p] = ',';
    return s;
}

std::string pct(double v) { return f1(v) + "%"; }

std::string num(double v) {
    double r = jsRound(v);
    bool neg = r < 0;
    char buf[64];
    std::snprintf(buf, sizeof buf, "%.0f", std::fabs(r));
    std::string d = buf, out;
    int n = static_cast<int>(d.size());
    for (int i = 0; i < n; ++i) {
        out += d[i];
        int left = n - 1 - i;
        if (left > 0 && left % 3 == 0) out += kNbsp;
    }
    return neg ? std::string(kMinus) + out : out;
}

std::string sgn(double v) {
    std::string s = v >= 0.05 ? "+" : (v <= -0.05 ? kMinus : "");
    return s + f1(std::fabs(v));
}

std::string money(double v) {
    double a = std::fabs(v);
    std::string s = v < 0 ? kMinus : "";
    if (a >= 1e9) return s + "$" + f1(a / 1e9) + " млрд";
    if (a >= 1e6) return s + "$" + f1(a / 1e6) + " млн";
    if (a >= 1e3) return s + "$" + num(a / 1e3) + " тыс.";
    return s + "$" + num(a);
}

std::string plural(double n, const std::string& a, const std::string& b, const std::string& c) {
    long long m = static_cast<long long>(std::fabs(jsRound(n))) % 100;
    long long n1 = m % 10;
    if (m > 10 && m < 20) return c;
    if (n1 > 1 && n1 < 5) return b;
    if (n1 == 1) return a;
    return c;
}

static std::vector<std::string> splitWords(const std::string& s) {
    std::vector<std::string> out;
    std::string cur;
    for (unsigned char ch : s) {
        if (ch == ' ' || ch == '\t' || ch == '\n') { if (!cur.empty()) { out.push_back(cur); cur.clear(); } }
        else cur += static_cast<char>(ch);
    }
    if (!cur.empty()) out.push_back(cur);
    return out;
}

std::string surname(const std::string& full) {
    auto w = splitWords(full);
    return w.empty() ? full : w.back();
}

static std::string firstChar(const std::string& w) {       // перший символ UTF-8
    if (w.empty()) return "";
    unsigned char c = w[0];
    size_t len = c < 0x80 ? 1 : (c >> 5) == 6 ? 2 : (c >> 4) == 14 ? 3 : 4;
    return w.substr(0, len);
}

std::string initials(const std::string& full) {
    // Для кирилиці верхній регістр першої літери: у даних усі імена вже з великої.
    std::string out;
    int n = 0;
    for (const auto& w : splitWords(full)) {
        if (n++ == 2) break;
        out += firstChar(w);
    }
    return out;
}

// Алгоритм days_from_civil (Howard Hinnant)
static int64_t daysFromCivil(int y, unsigned m, unsigned d) {
    y -= m <= 2;
    const int64_t era = (y >= 0 ? y : y - 399) / 400;
    const unsigned yoe = static_cast<unsigned>(y - era * 400);
    const unsigned doy = (153 * (m + (m > 2 ? -3 : 9)) + 2) / 5 + d - 1;
    const unsigned doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    return era * 146097 + static_cast<int64_t>(doe) - 719468;
}

static void civilFromDays(int64_t z, int& y, unsigned& m, unsigned& d) {
    z += 719468;
    const int64_t era = (z >= 0 ? z : z - 146096) / 146097;
    const unsigned doe = static_cast<unsigned>(z - era * 146097);
    const unsigned yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    y = static_cast<int>(yoe) + static_cast<int>(era * 400);
    const unsigned doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    const unsigned mp = (5 * doy + 2) / 153;
    d = doy - (153 * mp + 2) / 5 + 1;
    m = mp < 10 ? mp + 3 : mp - 9;
    y += m <= 2;
}

int64_t utcMs(int year, int month0, int day) {
    return daysFromCivil(year, static_cast<unsigned>(month0 + 1), static_cast<unsigned>(day)) * DAY_MS;
}

std::string dstr(int64_t ms) {
    static const char* MON[] = {"января", "февраля", "марта", "апреля", "мая", "июня", "июля",
                                "августа", "сентября", "октября", "ноября", "декабря"};
    int64_t days = ms >= 0 ? ms / DAY_MS : -((-ms + DAY_MS - 1) / DAY_MS);
    int y; unsigned m, d;
    civilFromDays(days, y, m, d);
    return std::to_string(d) + " " + MON[m - 1] + " " + std::to_string(y);
}

uint32_t hashStr(const std::string& s) {
    // Оригинал: for (const c of String(s)) h ^= c.charCodeAt(0) — по символах (UTF-16 code unit).
    // Для BMP-символів (вся кирилиця) декодуємо UTF-8 у code point.
    uint32_t h = 2166136261u;
    for (size_t i = 0; i < s.size();) {
        unsigned char c = s[i];
        uint32_t cp; size_t len;
        if (c < 0x80) { cp = c; len = 1; }
        else if ((c >> 5) == 6) { cp = c & 0x1F; len = 2; }
        else if ((c >> 4) == 14) { cp = c & 0x0F; len = 3; }
        else { cp = c & 0x07; len = 4; }
        for (size_t k = 1; k < len && i + k < s.size(); ++k) cp = (cp << 6) | (static_cast<unsigned char>(s[i + k]) & 0x3F);
        i += len;
        if (cp > 0xFFFF) cp = 0xD800 + ((cp - 0x10000) >> 10);   // charCodeAt(0) = старший сурогат
        h ^= cp;
        h *= 16777619u;
    }
    return h;
}

} // namespace mandat::core
