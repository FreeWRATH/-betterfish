#pragma once

#include <string>

#include "bitboard.h"
#include "nnue.h"
#include "types.h"

struct MoveList {
    Move moves[MAX_MOVES];
    int scores[MAX_MOVES];
    int size = 0;
    void add(Move m) { moves[size++] = m; }
};

enum GenType { GEN_ALL, GEN_NOISY };

struct Undo {
    Move move;
    int captured;
    int castling;
    int ep;
    int halfmove;
    U64 key;
    U64 pawnKey;
};

class Position {
public:
    U64 bb[12];
    U64 byColor[2];
    U64 all;
    int board[64];
    int side;
    int castling;
    int ep;
    int halfmove;
    int fullmove;
    U64 key;
    U64 pawnKey;  // hash of pawn placement only

    int gamePly = 0;
    Undo stack[MAX_GAME_PLY];
    U64 keys[MAX_GAME_PLY];

    // NNUE accumulators: one per make() since the last reset_accumulator().
    static constexpr int AccStackSize = MAX_PLY + 16;
    NNUE::Accumulator accStack[AccStackSize];
    int accIdx = 0;
    const NNUE::Accumulator& accumulator() const { return accStack[accIdx]; }
    // Recompute the accumulator from scratch and drop the incremental stack.
    // Must be called when making moves outside of a search (game history).
    void reset_accumulator() {
        accIdx = 0;
        NNUE::refresh(accStack[0], bb);
    }

    static const char* StartFen;

    bool set_fen(const std::string& fen);
    std::string fen() const;
    std::string pretty() const;

    // Makes a pseudo-legal move. Returns false (and restores the position)
    // if the move leaves the mover's king in check.
    bool make(Move m);
    void unmake(Move m);
    void make_null();
    void unmake_null();

    U64 pieces(int c, int pt) const { return bb[make_piece(c, pt)]; }
    U64 pieces_pt(int pt) const { return bb[pt] | bb[pt + 6]; }
    int king_sq(int c) const { return lsb(bb[make_piece(c, KING)]); }

    U64 attackers_to(int sq, U64 occ) const;
    bool attacked(int sq, int by) const;
    bool in_check() const { return attacked(king_sq(side), side ^ 1); }

    bool is_repetition() const;
    bool insufficient_material() const;
    bool has_non_pawn_material(int c) const {
        return byColor[c] & ~(pieces(c, PAWN) | pieces(c, KING));
    }

    Move parse_uci_move(const std::string& s) const;

private:
    template <bool Acc = true> void put_piece(int p, int sq);
    template <bool Acc = true> void remove_piece(int sq);
    template <bool Acc = true> void move_piece(int from, int to);
};

void generate_moves(const Position& pos, MoveList& list, GenType type);

// Static exchange evaluation: true if the move wins at least `threshold`.
bool see_ge(const Position& pos, Move m, int threshold);
extern const int SeeValue[6];

void init_zobrist();
