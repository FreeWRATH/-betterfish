#pragma once

#include <atomic>
#include <cstdint>

#include "position.h"

struct SearchLimits {
    int depth = MAX_PLY - 1;
    int64_t wtime = -1, btime = -1, winc = 0, binc = 0;
    int movestogo = 0;
    int64_t movetime = -1;
    uint64_t nodes = 0;
    bool infinite = false;
    bool ponder = false;
};

namespace Search {

void init();
void set_threads(int n);
void clear();  // ucinewgame

// Blocks until the search finishes, then prints "bestmove".
void run(const Position& pos, const SearchLimits& limits);

void stop();
void ponderhit();

extern int MoveOverhead;
extern std::atomic<bool> Silent;

// Runs a fixed-depth search without printing. Returns nodes searched.
uint64_t bench_search(const Position& pos, int depth);

}  // namespace Search
