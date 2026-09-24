#pragma once

#include <atomic>
#include <cstddef>
#include <memory>

#include "types.h"

enum Bound : int { BOUND_NONE = 0, BOUND_UPPER = 1, BOUND_LOWER = 2, BOUND_EXACT = 3 };

struct TTData {
    Move move;
    int score;
    int eval;
    int depth;
    int bound;
};

// Shared, lock-free transposition table. Each entry stores (key ^ data, data)
// so torn writes from concurrent threads are detected as a key mismatch.
class TranspositionTable {
public:
    void resize(size_t mb);
    void clear();
    void new_search() { age = (age + 1) & 63; }

    bool probe(U64 key, TTData& out) const;
    void store(U64 key, Move move, int score, int eval, int depth, int bound);
    int hashfull() const;

private:
    struct Entry {
        std::atomic<U64> check;
        std::atomic<U64> data;
    };
    static constexpr int BucketSize = 4;
    struct alignas(64) Bucket {
        Entry entries[BucketSize];
    };

    Bucket* bucket(U64 key) const {
        return &table[size_t((unsigned __int128)key * numBuckets >> 64)];
    }

    std::unique_ptr<Bucket[]> table;
    size_t numBuckets = 0;
    int age = 0;
};

extern TranspositionTable TT;

inline int score_to_tt(int s, int ply) {
    if (s >= MATE_BOUND) return s + ply;
    if (s <= -MATE_BOUND) return s - ply;
    return s;
}

inline int score_from_tt(int s, int ply) {
    if (s >= MATE_BOUND) return s - ply;
    if (s <= -MATE_BOUND) return s + ply;
    return s;
}
