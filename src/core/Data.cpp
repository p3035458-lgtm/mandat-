#include "Data.hpp"

namespace mandat::core {

int regionIndex(const std::string& id) {
    const auto& r = regions();
    for (size_t i = 0; i < r.size(); ++i)
        if (r[i].id == id) return static_cast<int>(i);
    return -1;
}

const Bio* findBio(const std::string& id) {
    for (const auto& b : bios())
        if (b.id == id) return &b;
    return nullptr;
}

} // namespace mandat::core
