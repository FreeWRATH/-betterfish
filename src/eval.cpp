// Tapered evaluation: PeSTO piece-square tables (Ronald Friederich) plus
// pawn structure, mobility, rook files, bishop pair and king attack terms.

#include "eval.h"

#include <algorithm>
#include <cstdlib>

namespace {

const int MgValue[6] = {82, 337, 365, 477, 1025, 0};
const int EgValue[6] = {94, 281, 297, 512, 936, 0};
const int PhaseInc[6] = {0, 1, 1, 2, 4, 0};

// Tables are laid out visually (a8 first) from White's point of view.
const int MgPst[6][64] = {
    {  0,   0,   0,   0,   0,   0,  0,   0,
      98, 134,  61,  95,  68, 126, 34, -11,
      -6,   7,  26,  31,  65,  56, 25, -20,
     -14,  13,   6,  21,  23,  12, 17, -23,
     -27,  -2,  -5,  12,  17,   6, 10, -25,
     -26,  -4,  -4, -10,   3,   3, 33, -12,
     -35,  -1, -20, -23, -15,  24, 38, -22,
       0,   0,   0,   0,   0,   0,  0,   0},
    {-167, -89, -34, -49,  61, -97, -15, -107,
      -73, -41,  72,  36,  23,  62,   7,  -17,
      -47,  60,  37,  65,  84, 129,  73,   44,
       -9,  17,  19,  53,  37,  69,  18,   22,
      -13,   4,  16,  13,  28,  19,  21,   -8,
      -23,  -9,  12,  10,  19,  17,  25,  -16,
      -29, -53, -12,  -3,  -1,  18, -14,  -19,
     -105, -21, -58, -33, -17, -28, -19,  -23},
    {-29,   4, -82, -37, -25, -42,   7,  -8,
     -26,  16, -18, -13,  30,  59,  18, -47,
     -16,  37,  43,  40,  35,  50,  37,  -2,
      -4,   5,  19,  50,  37,  37,   7,  -2,
      -6,  13,  13,  26,  34,  12,  10,   4,
       0,  15,  15,  15,  14,  27,  18,  10,
       4,  15,  16,   0,   7,  21,  33,   1,
     -33,  -3, -14, -21, -13, -12, -39, -21},
    { 32,  42,  32,  51, 63,  9,  31,  43,
      27,  32,  58,  62, 80, 67,  26,  44,
      -5,  19,  26,  36, 17, 45,  61,  16,
     -24, -11,   7,  26, 24, 35,  -8, -20,
     -36, -26, -12,  -1,  9, -7,   6, -23,
     -45, -25, -16, -17,  3,  0,  -5, -33,
     -44, -16, -20,  -9, -1, 11,  -6, -71,
     -19, -13,   1,  17, 16,  7, -37, -26},
    {-28,   0,  29,  12,  59,  44,  43,  45,
     -24, -39,  -5,   1, -16,  57,  28,  54,
     -13, -17,   7,   8,  29,  56,  47,  57,
     -27, -27, -16, -16,  -1,  17,  -2,   1,
      -9, -26,  -9, -10,  -2,  -4,   3,  -3,
     -14,   2, -11,  -2,  -5,   2,  14,   5,
     -35,  -8,  11,   2,   8,  15,  -3,   1,
      -1, -18,  -9,  10, -15, -25, -31, -50},
    {-65,  23,  16, -15, -56, -34,   2,  13,
      29,  -1, -20,  -7,  -8,  -4, -38, -29,
      -9,  24,   2, -16, -20,   6,  22, -22,
     -17, -20, -12, -27, -30, -25, -14, -36,
     -49,  -1, -27, -39, -46, -44, -33, -51,
     -14, -14, -22, -46, -44, -30, -15, -27,
       1,   7,  -8, -64, -43, -16,   9,   8,
     -15,  36,  12, -54,   8, -28,  24,  14},
};

const int EgPst[6][64] = {
    {  0,   0,   0,   0,   0,   0,   0,   0,
     178, 173, 158, 134, 147, 132, 165, 187,
      94, 100,  85,  67,  56,  53,  82,  84,
      32,  24,  13,   5,  -2,   4,  17,  17,
      13,   9,  -3,  -7,  -7,  -8,   3,  -1,
       4,   7,  -6,   1,   0,  -5,  -1,  -8,
      13,   8,   8,  10,  13,   0,   2,  -7,
       0,   0,   0,   0,   0,   0,   0,   0},
    {-58, -38, -13, -28, -31, -27, -63, -99,
     -25,  -8, -25,  -2,  -9, -25, -24, -52,
     -24, -20,  10,   9,  -1,  -9, -19, -41,
     -17,   3,  22,  22,  22,  11,   8, -18,
     -18,  -6,  16,  25,  16,  17,   4, -18,
     -23,  -3,  -1,  15,  10,  -3, -20, -22,
     -42, -20, -10,  -5,  -2, -20, -23, -44,
     -29, -51, -23, -15, -22, -18, -50, -64},
    {-14, -21, -11,  -8, -7,  -9, -17, -24,
      -8,  -4,   7, -12, -3, -13,  -4, -14,
       2,  -8,   0,  -1, -2,   6,   0,   4,
      -3,   9,  12,   9, 14,  10,   3,   2,
      -6,   3,  13,  19,  7,  10,  -3,  -9,
     -12,  -3,   8,  10, 13,   3,  -7, -15,
     -14, -18,  -7,  -1,  4,  -9, -15, -27,
     -23,  -9, -23,  -5, -9, -16,  -5, -17},
    { 13, 10, 18, 15, 12,  12,   8,   5,
      11, 13, 13, 11, -3,   3,   8,   3,
       7,  7,  7,  5,  4,  -3,  -5,  -3,
       4,  3, 13,  1,  2,   1,  -1,   2,
       3,  5,  8,  4, -5,  -6,  -8, -11,
      -4,  0, -5, -1, -7, -12,  -8, -16,
      -6, -6,  0,  2, -9,  -9, -11,  -3,
      -9,  2,  3, -1, -5, -13,   4, -20},
    { -9,  22,  22,  27,  27,  19,  10,  20,
     -17,  20,  32,  41,  58,  25,  30,   0,
     -20,   6,   9,  49,  47,  35,  19,   9,
       3,  22,  24,  45,  57,  40,  57,  36,
     -18,  28,  19,  47,  31,  34,  39,  23,
     -16, -27,  15,   6,   9,  17,  10,   5,
     -22, -23, -30, -16, -16, -23, -36, -32,
     -33, -28, -22, -43,  -5, -32, -20, -41},
    {-74, -35, -18, -18, -11,  15,   4, -17,
     -12,  17,  14,  17,  17,  38,  23,  11,
      10,  17,  23,  15,  20,  45,  44,  13,
      -8,  22,  24,  27,  26,  33,  26,   3,
     -18,  -4,  21,  24,  27,  23,   9, -11,
     -19,  -3,  11,  21,  23,  16,   7,  -9,
     -27, -11,   4,  13,  14,   4,  -5, -17,
     -53, -34, -21, -11, -28, -14, -24, -43},
};

// Combined material + PST indexed by [piece][square] (a1 = 0).
int MgTable[12][64];
int EgTable[12][64];

const int PassedMg[8] = {0, 2, 5, 10, 20, 35, 55, 0};
const int PassedEg[8] = {0, 8, 12, 20, 38, 65, 100, 0};

const int KingAttackWeight[6] = {0, 2, 2, 3, 5, 0};

struct Score {
    int mg = 0, eg = 0;
    void add(int m, int e) { mg += m; eg += e; }
};

}  // namespace

void init_eval() {
    for (int pt = PAWN; pt <= KING; ++pt)
        for (int sq = 0; sq < 64; ++sq) {
            // White uses the visually-flipped index, Black the raw one.
            MgTable[make_piece(WHITE, pt)][sq] = MgValue[pt] + MgPst[pt][sq ^ 56];
            EgTable[make_piece(WHITE, pt)][sq] = EgValue[pt] + EgPst[pt][sq ^ 56];
            MgTable[make_piece(BLACK, pt)][sq] = MgValue[pt] + MgPst[pt][sq];
            EgTable[make_piece(BLACK, pt)][sq] = EgValue[pt] + EgPst[pt][sq];
        }
}

int evaluate(const Position& pos) {
    Score s[2];
    int phase = 0;

    for (int p = 0; p < 12; ++p) {
        U64 b = pos.bb[p];
        const int c = color_of(p);
        phase += PhaseInc[type_of(p)] * popcount(b);
        while (b) {
            int sq = pop_lsb(b);
            s[c].add(MgTable[p][sq], EgTable[p][sq]);
        }
    }

    U64 pawnAttacks[2];
    pawnAttacks[WHITE] = ((pos.pieces(WHITE, PAWN) & ~FILE_A_BB) << 7) | ((pos.pieces(WHITE, PAWN) & ~FILE_H_BB) << 9);
    pawnAttacks[BLACK] = ((pos.pieces(BLACK, PAWN) & ~FILE_A_BB) >> 9) | ((pos.pieces(BLACK, PAWN) & ~FILE_H_BB) >> 7);

    for (int c = WHITE; c <= BLACK; ++c) {
        const int them = c ^ 1;
        const U64 ours = pos.pieces(c, PAWN);
        const U64 theirs = pos.pieces(them, PAWN);
        Score& sc = s[c];

        // Pawn structure
        U64 b = ours;
        while (b) {
            int sq = pop_lsb(b);
            int f = file_of(sq);
            if (!(ours & AdjacentFilesBB[f])) sc.add(-8, -14);
            if (ours & ForwardFileBB[c][sq]) sc.add(-8, -20);
            if (!(PassedMask[c][sq] & theirs)) {
                int r = relative_rank(c, sq);
                sc.add(PassedMg[r], PassedEg[r]);
                // Blocked passers are worth less.
                int stop = sq + (c == WHITE ? 8 : -8);
                if (pos.board[stop] != NO_PIECE) sc.add(-PassedMg[r] / 3, -PassedEg[r] / 3);
            }
        }

        if (popcount(pos.pieces(c, BISHOP)) >= 2) sc.add(28, 50);

        // Mobility and king attacks
        const U64 mobArea = ~pos.byColor[c] & ~pawnAttacks[them];
        const int enemyKing = pos.king_sq(them);
        const U64 kingZone = KingAttacks[enemyKing] | bit(enemyKing);
        int attackers = 0, attackUnits = 0;

        auto tally = [&](int pt, U64 att) {
            U64 z = att & kingZone;
            if (z) {
                ++attackers;
                attackUnits += KingAttackWeight[pt] * popcount(z);
            }
        };

        b = pos.pieces(c, KNIGHT);
        while (b) {
            int sq = pop_lsb(b);
            U64 att = KnightAttacks[sq];
            int mob = popcount(att & mobArea);
            sc.add(4 * (mob - 4), 4 * (mob - 4));
            tally(KNIGHT, att);
        }
        b = pos.pieces(c, BISHOP);
        while (b) {
            int sq = pop_lsb(b);
            U64 att = bishop_attacks(sq, pos.all);
            int mob = popcount(att & mobArea);
            sc.add(5 * (mob - 6), 5 * (mob - 6));
            tally(BISHOP, att);
        }
        b = pos.pieces(c, ROOK);
        while (b) {
            int sq = pop_lsb(b);
            U64 att = rook_attacks(sq, pos.all);
            int mob = popcount(att & mobArea);
            sc.add(2 * (mob - 7), 4 * (mob - 7));
            tally(ROOK, att);
            U64 file = FileBB[file_of(sq)];
            if (!(file & ours)) {
                if (!(file & theirs))
                    sc.add(25, 10);
                else
                    sc.add(12, 5);
            }
        }
        b = pos.pieces(c, QUEEN);
        while (b) {
            int sq = pop_lsb(b);
            U64 att = queen_attacks(sq, pos.all);
            int mob = popcount(att & mobArea);
            sc.add(1 * (mob - 13), 2 * (mob - 13));
            tally(QUEEN, att);
        }

        if (attackers >= 2 && pos.pieces(c, QUEEN))
            sc.add(std::min(attackUnits * attackUnits / 4, 400), 0);
    }

    int mg = s[WHITE].mg - s[BLACK].mg;
    int eg = s[WHITE].eg - s[BLACK].eg;
    int mgPhase = std::min(phase, 24);
    int score = (mg * mgPhase + eg * (24 - mgPhase)) / 24;

    // Drawish endgames: the stronger side has no pawns and at most a minor
    // piece extra cannot usually win.
    int strong = score > 0 ? WHITE : BLACK;
    if (!pos.pieces(strong, PAWN)) {
        auto npm = [&](int c) {
            return 300 * popcount(pos.pieces(c, KNIGHT) | pos.pieces(c, BISHOP)) +
                   500 * popcount(pos.pieces(c, ROOK)) + 900 * popcount(pos.pieces(c, QUEEN));
        };
        if (npm(strong) - npm(strong ^ 1) <= 300) score /= 4;
    }
    if (pos.insufficient_material()) return 0;

    // Fade towards a draw as the fifty-move counter grows.
    score = score * (200 - pos.halfmove) / 200;

    const int tempo = 12;
    return (pos.side == WHITE ? score : -score) + tempo;
}
