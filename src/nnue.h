#pragma once

// NNUE evaluation: (768 -> HL) x 2 perspectives -> SCReLU -> 1, with the
// output layer selected by the number of pieces on the board.
// The first layer is kept up to date incrementally as pieces move.

#include <cstdint>
#include <string>

#include "types.h"

namespace NNUE {

constexpr int Inputs = 768;
constexpr int HL = 256;
constexpr int QA = 255;
constexpr int QB = 64;
constexpr int Scale = 400;
constexpr int OutputBuckets = 8;

inline int output_bucket(int pieceCount) { return (pieceCount - 2) / 4; }

struct alignas(64) Accumulator {
    int16_t v[2][HL];
};

struct Net {
    alignas(64) int16_t ftW[Inputs * HL];
    alignas(64) int16_t ftB[HL];
    alignas(64) int16_t outW[OutputBuckets][2 * HL];
    int16_t outB[OutputBuckets];
};

extern Net net;
extern bool Loaded;   // a network is available
extern bool Enabled;  // UCI option "Use NNUE"

bool load_embedded();
bool load_file(const std::string& path);

// Feature index of `piece` on `sq` as seen from `persp`: the board is
// mirrored for Black so both sides see "their" pieces first.
inline int feature(int persp, int piece, int sq) {
    int c = color_of(piece);
    if (persp == BLACK) {
        sq ^= 56;
        c ^= 1;
    }
    return (c * 6 + type_of(piece)) * 64 + sq;
}

inline void add(Accumulator& a, int piece, int sq) {
    for (int p = 0; p < 2; ++p) {
        const int16_t* w = net.ftW + feature(p, piece, sq) * HL;
        for (int i = 0; i < HL; ++i) a.v[p][i] += w[i];
    }
}

inline void sub(Accumulator& a, int piece, int sq) {
    for (int p = 0; p < 2; ++p) {
        const int16_t* w = net.ftW + feature(p, piece, sq) * HL;
        for (int i = 0; i < HL; ++i) a.v[p][i] -= w[i];
    }
}

inline void move(Accumulator& a, int piece, int from, int to) {
    for (int p = 0; p < 2; ++p) {
        const int16_t* wf = net.ftW + feature(p, piece, from) * HL;
        const int16_t* wt = net.ftW + feature(p, piece, to) * HL;
        for (int i = 0; i < HL; ++i) a.v[p][i] += wt[i] - wf[i];
    }
}

void refresh(Accumulator& a, const U64 bb[12]);

// Evaluation in centipawns from the side to move's point of view.
int evaluate(const Accumulator& a, int stm, int pieceCount);

}  // namespace NNUE
