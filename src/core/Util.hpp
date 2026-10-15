// Форматування та допоміжні функції (f1, pct, num, sgn, money, plural, dstr, ...).
// Поведінка збігається з JS-оригіналом (ru-RU: кома, нерозривний пробіл, U+2212).
#pragma once
#include <cstdint>
#include <string>

namespace mandat::core {

template <class T> constexpr T clamp(T v, T a, T b) { return v < a ? a : (v > b ? b : v); }

double jsRound(double v);                  // Math.round (half up)
std::string f1(double v);                  // 12,3
std::string pct(double v);                 // 12,3%
std::string num(double v);                 // 1 234 567
std::string sgn(double v);                 // +1,2 / −1,2
std::string money(double v);               // $1,2 млн
std::string plural(double n, const std::string& a, const std::string& b, const std::string& c);
std::string surname(const std::string& full);
std::string initials(const std::string& full);

int64_t utcMs(int year, int month0, int day);   // Date.UTC(y, m, d)
constexpr int64_t DAY_MS = 86400000LL;
std::string dstr(int64_t ms);                   // «7 ноября 2028»

uint32_t hashStr(const std::string& s);         // FNV-1a, як hashStr() в оригіналі

} // namespace mandat::core
