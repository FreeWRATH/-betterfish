#include "bitboard.h"

#include <vector>

Magic BishopMagics[64];
Magic RookMagics[64];

U64 PawnAttacks[2][64];
U64 KnightAttacks[64];
U64 KingAttacks[64];
U64 FileBB[8];
U64 RankBB[8];
U64 AdjacentFilesBB[8];
U64 PassedMask[2][64];
U64 ForwardFileBB[2][64];

namespace {

U64 RookTable[0x19000];
U64 BishopTable[0x1480];

const int RookDirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
const int BishopDirs[4][2] = {{1, 1}, {1, -1}, {-1, 1}, {-1, -1}};

U64 sliding_attacks(int sq, U64 occ, const int dirs[4][2]) {
    U64 att = 0;
    for (int d = 0; d < 4; ++d) {
        int r = rank_of(sq) + dirs[d][0], f = file_of(sq) + dirs[d][1];
        while (r >= 0 && r < 8 && f >= 0 && f < 8) {
            int s = r * 8 + f;
            att |= bit(s);
            if (occ & bit(s)) break;
            r += dirs[d][0];
            f += dirs[d][1];
        }
    }
    return att;
}

U64 rng_state = 0x9E3779B97F4A7C15ULL;
U64 rng() {
    rng_state ^= rng_state >> 12;
    rng_state ^= rng_state << 25;
    rng_state ^= rng_state >> 27;
    return rng_state * 2685821657736338717ULL;
}

void init_magics(Magic* magics, U64* table, const int dirs[4][2]) {
    U64* ptr = table;
    std::vector<U64> occs(4096), refs(4096);
    std::vector<int> epoch(4096, 0);
    int attempt = 0;

    for (int sq = 0; sq < 64; ++sq) {
        U64 edges = ((RANK_1_BB | RANK_8_BB) & ~RankBB[rank_of(sq)]) |
                    ((FILE_A_BB | FILE_H_BB) & ~FileBB[file_of(sq)]);
        Magic& m = magics[sq];
        m.mask = sliding_attacks(sq, 0, dirs) & ~edges;
        m.shift = 64 - popcount(m.mask);
        m.attacks = ptr;

        int n = 0;
        U64 b = 0;
        do {
            occs[n] = b;
            refs[n] = sliding_attacks(sq, b, dirs);
            ++n;
            b = (b - m.mask) & m.mask;
        } while (b);

        for (;;) {
            m.magic = rng() & rng() & rng();
            if (popcount((m.mask * m.magic) >> 56) < 6) continue;
            ++attempt;
            bool ok = true;
            for (int i = 0; i < n && ok; ++i) {
                unsigned idx = m.index(occs[i]);
                if (epoch[idx] < attempt) {
                    epoch[idx] = attempt;
                    ptr[idx] = refs[i];
                } else if (ptr[idx] != refs[i]) {
                    ok = false;
                }
            }
            if (ok) break;
        }
        ptr += n;
    }
}

}  // namespace

void init_bitboards() {
    for (int i = 0; i < 8; ++i) {
        FileBB[i] = FILE_A_BB << i;
        RankBB[i] = RANK_1_BB << (8 * i);
    }
    for (int i = 0; i < 8; ++i)
        AdjacentFilesBB[i] = (i > 0 ? FileBB[i - 1] : 0) | (i < 7 ? FileBB[i + 1] : 0);

    for (int sq = 0; sq < 64; ++sq) {
        int r = rank_of(sq), f = file_of(sq);
        auto set = [&](U64& target, int dr, int df) {
            int nr = r + dr, nf = f + df;
            if (nr >= 0 && nr < 8 && nf >= 0 && nf < 8) target |= bit(nr * 8 + nf);
        };

        PawnAttacks[WHITE][sq] = PawnAttacks[BLACK][sq] = 0;
        set(PawnAttacks[WHITE][sq], 1, -1);
        set(PawnAttacks[WHITE][sq], 1, 1);
        set(PawnAttacks[BLACK][sq], -1, -1);
        set(PawnAttacks[BLACK][sq], -1, 1);

        KnightAttacks[sq] = 0;
        const int kn[8][2] = {{1, 2}, {2, 1}, {2, -1}, {1, -2}, {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2}};
        for (auto& d : kn) set(KnightAttacks[sq], d[0], d[1]);

        KingAttacks[sq] = 0;
        for (int dr = -1; dr <= 1; ++dr)
            for (int df = -1; df <= 1; ++df)
                if (dr || df) set(KingAttacks[sq], dr, df);

        U64 aheadW = 0, aheadB = 0;
        for (int rr = r + 1; rr < 8; ++rr) aheadW |= RankBB[rr];
        for (int rr = r - 1; rr >= 0; --rr) aheadB |= RankBB[rr];
        ForwardFileBB[WHITE][sq] = aheadW & FileBB[f];
        ForwardFileBB[BLACK][sq] = aheadB & FileBB[f];
        PassedMask[WHITE][sq] = aheadW & (FileBB[f] | AdjacentFilesBB[f]);
        PassedMask[BLACK][sq] = aheadB & (FileBB[f] | AdjacentFilesBB[f]);
    }

    init_magics(RookMagics, RookTable, RookDirs);
    init_magics(BishopMagics, BishopTable, BishopDirs);
}
