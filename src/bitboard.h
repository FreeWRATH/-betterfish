#pragma once

#include "types.h"

constexpr U64 FILE_A_BB = 0x0101010101010101ULL;
constexpr U64 FILE_H_BB = FILE_A_BB << 7;
constexpr U64 RANK_1_BB = 0xFFULL;
constexpr U64 RANK_8_BB = RANK_1_BB << 56;

constexpr U64 bit(int sq) { return 1ULL << sq; }

inline int popcount(U64 b) { return __builtin_popcountll(b); }
inline int lsb(U64 b) { return __builtin_ctzll(b); }
inline int pop_lsb(U64& b) {
    int s = lsb(b);
    b &= b - 1;
    return s;
}

struct Magic {
    U64 mask;
    U64 magic;
    U64* attacks;
    int shift;
    unsigned index(U64 occ) const { return unsigned(((occ & mask) * magic) >> shift); }
};

extern Magic BishopMagics[64];
extern Magic RookMagics[64];

extern U64 PawnAttacks[2][64];
extern U64 KnightAttacks[64];
extern U64 KingAttacks[64];
extern U64 FileBB[8];
extern U64 RankBB[8];
extern U64 AdjacentFilesBB[8];
extern U64 PassedMask[2][64];   // squares ahead on same + adjacent files
extern U64 ForwardFileBB[2][64];

inline U64 bishop_attacks(int sq, U64 occ) {
    const Magic& m = BishopMagics[sq];
    return m.attacks[m.index(occ)];
}
inline U64 rook_attacks(int sq, U64 occ) {
    const Magic& m = RookMagics[sq];
    return m.attacks[m.index(occ)];
}
inline U64 queen_attacks(int sq, U64 occ) { return bishop_attacks(sq, occ) | rook_attacks(sq, occ); }

void init_bitboards();
