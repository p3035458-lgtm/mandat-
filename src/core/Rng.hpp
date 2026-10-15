// Генератор випадкових чисел: аналоги rnd/ri/pick/gauss з оригіналу.
#pragma once
#include <cmath>
#include <cstdint>
#include <random>
#include <string>
#include <vector>

#include "Util.hpp"

namespace mandat::core {

class Rng {
public:
    static Rng& instance() { static Rng r; return r; }
    void seed(uint64_t s) { eng_.seed(s); }

    double unit() { return std::uniform_real_distribution<double>(0.0, 1.0)(eng_); }   // Math.random()
    double rnd(double a, double b) { return a + unit() * (b - a); }
    int ri(int a, int b) { return static_cast<int>(std::floor(rnd(a, b + 1))); }
    template <class T> const T& pick(const std::vector<T>& v) { return v[static_cast<size_t>(std::floor(unit() * v.size()))]; }
    double gauss() {                                                                    // Box–Muller, як в оригіналі
        double u = 0, v = 0;
        while (u == 0) u = unit();
        while (v == 0) v = unit();
        return std::sqrt(-2 * std::log(u)) * std::cos(2 * 3.14159265358979323846 * v);
    }
private:
    Rng() : eng_(std::random_device{}()) {}
    std::mt19937_64 eng_;
};

inline double rnd(double a, double b) { return Rng::instance().rnd(a, b); }
inline int ri(int a, int b) { return Rng::instance().ri(a, b); }
inline double gauss() { return Rng::instance().gauss(); }
inline double chance() { return Rng::instance().unit(); }

// seeded(seed) з оригіналу (mulberry32): детермінований генератор для профілів людей.
class Seeded {
public:
    explicit Seeded(const std::string& seed) : a_(hashStr(seed) ? hashStr(seed) : 1u) {}
    double next() {
        a_ += 0x6D2B79F5u;
        uint32_t t = (a_ ^ (a_ >> 15)) * (1u | a_);
        t = (t + (t ^ (t >> 7)) * (61u | t)) ^ t;
        return static_cast<double>(t ^ (t >> 14)) / 4294967296.0;
    }
private:
    uint32_t a_;
};

} // namespace mandat::core
