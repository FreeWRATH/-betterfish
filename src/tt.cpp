#include "tt.h"

#include <algorithm>

TranspositionTable TT;

namespace {

// data layout: move:16 | score:16 | eval:16 | depth:8 | bound:2 | age:6
inline U64 pack(Move move, int score, int eval, int depth, int bound, int age) {
    return U64(move) | (U64(uint16_t(int16_t(score))) << 16) | (U64(uint16_t(int16_t(eval))) << 32) |
           (U64(uint8_t(depth)) << 48) | (U64(bound) << 56) | (U64(age) << 58);
}

inline Move data_move(U64 d) { return Move(d & 0xFFFF); }
inline int data_score(U64 d) { return int16_t((d >> 16) & 0xFFFF); }
inline int data_eval(U64 d) { return int16_t((d >> 32) & 0xFFFF); }
inline int data_depth(U64 d) { return int((d >> 48) & 0xFF); }
inline int data_bound(U64 d) { return int((d >> 56) & 3); }
inline int data_age(U64 d) { return int((d >> 58) & 63); }

}  // namespace

void TranspositionTable::resize(size_t mb) {
    if (mb < 1) mb = 1;
    numBuckets = mb * 1024 * 1024 / sizeof(Bucket);
    table.reset(new Bucket[numBuckets]);
    clear();
}

void TranspositionTable::clear() {
    for (size_t i = 0; i < numBuckets; ++i)
        for (auto& e : table[i].entries) {
            e.check.store(0, std::memory_order_relaxed);
            e.data.store(0, std::memory_order_relaxed);
        }
    age = 0;
}

bool TranspositionTable::probe(U64 key, TTData& out) const {
    Bucket* b = bucket(key);
    for (auto& e : b->entries) {
        U64 data = e.data.load(std::memory_order_relaxed);
        U64 check = e.check.load(std::memory_order_relaxed);
        if ((check ^ data) == key && data_bound(data) != BOUND_NONE) {
            out.move = data_move(data);
            out.score = data_score(data);
            out.eval = data_eval(data);
            out.depth = data_depth(data);
            out.bound = data_bound(data);
            return true;
        }
    }
    return false;
}

void TranspositionTable::store(U64 key, Move move, int score, int eval, int depth, int bound) {
    Bucket* b = bucket(key);
    Entry* replace = nullptr;
    int worst = 1 << 30;

    for (auto& e : b->entries) {
        U64 data = e.data.load(std::memory_order_relaxed);
        U64 check = e.check.load(std::memory_order_relaxed);
        if ((check ^ data) == key) {
            // Same position: keep the old move if we have none, and don't
            // overwrite a much deeper result with a shallow non-exact one.
            if (move == NO_MOVE) move = data_move(data);
            if (bound != BOUND_EXACT && depth + 3 < data_depth(data) && data_age(data) == age) return;
            replace = &e;
            break;
        }
        int ageDiff = (age - data_age(data)) & 63;
        int value = data_depth(data) - 8 * ageDiff;
        if (value < worst) {
            worst = value;
            replace = &e;
        }
    }

    if (depth < 0) depth = 0;
    U64 data = pack(move, score, eval, depth, bound, age);
    replace->check.store(key ^ data, std::memory_order_relaxed);
    replace->data.store(data, std::memory_order_relaxed);
}

int TranspositionTable::hashfull() const {
    int count = 0;
    size_t n = std::min<size_t>(numBuckets, 250);
    for (size_t i = 0; i < n; ++i)
        for (auto& e : table[i].entries) {
            U64 data = e.data.load(std::memory_order_relaxed);
            if (data_bound(data) != BOUND_NONE && data_age(data) == age) ++count;
        }
    return n ? int(count * 1000 / (n * BucketSize)) : 0;
}
