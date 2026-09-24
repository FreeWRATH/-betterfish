#pragma once

#include <cstdint>
#include <string>

using U64 = uint64_t;
using Move = uint16_t;

constexpr int MAX_PLY = 128;
constexpr int MAX_MOVES = 256;
constexpr int MAX_GAME_PLY = 4096;

constexpr int INF = 32001;
constexpr int MATE = 32000;
constexpr int MATE_BOUND = MATE - MAX_PLY;
constexpr int VALUE_NONE = 32002;

enum Color : int { WHITE, BLACK };
enum PieceType : int { PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING };
enum Piece : int {
    W_PAWN, W_KNIGHT, W_BISHOP, W_ROOK, W_QUEEN, W_KING,
    B_PAWN, B_KNIGHT, B_BISHOP, B_ROOK, B_QUEEN, B_KING,
    NO_PIECE
};

constexpr int NO_SQ = 64;

enum CastlingRight : int { WK = 1, WQ = 2, BK = 4, BQ = 8 };

constexpr int make_piece(int c, int pt) { return c * 6 + pt; }
constexpr int type_of(int p) { return p % 6; }
constexpr int color_of(int p) { return p / 6; }
constexpr int rank_of(int sq) { return sq >> 3; }
constexpr int file_of(int sq) { return sq & 7; }
constexpr int relative_rank(int c, int sq) { return c == WHITE ? rank_of(sq) : 7 - rank_of(sq); }

// Move encoding: bits 0-5 from, 6-11 to, 12-15 flags.
enum MoveFlag : int {
    QUIET = 0,
    DOUBLE_PUSH = 1,
    KING_CASTLE = 2,
    QUEEN_CASTLE = 3,
    CAPTURE = 4,
    EP_CAPTURE = 5,
    PROMO = 8,          // PROMO | (pt - KNIGHT)
    PROMO_CAPTURE = 12  // PROMO_CAPTURE | (pt - KNIGHT)
};

constexpr Move NO_MOVE = 0;

constexpr Move make_move(int from, int to, int flags = QUIET) {
    return Move(from | (to << 6) | (flags << 12));
}
constexpr int from_sq(Move m) { return m & 63; }
constexpr int to_sq(Move m) { return (m >> 6) & 63; }
constexpr int move_flags(Move m) { return m >> 12; }
constexpr bool is_capture(Move m) { return move_flags(m) & 4; }
constexpr bool is_promo(Move m) { return move_flags(m) & 8; }
constexpr int promo_type(Move m) { return (move_flags(m) & 3) + KNIGHT; }
constexpr bool is_castle(Move m) { return move_flags(m) == KING_CASTLE || move_flags(m) == QUEEN_CASTLE; }
constexpr bool is_quiet(Move m) { return !(move_flags(m) & 12); }

inline std::string square_name(int sq) {
    return std::string{char('a' + file_of(sq)), char('1' + rank_of(sq))};
}

inline std::string move_to_uci(Move m) {
    if (m == NO_MOVE) return "0000";
    std::string s = square_name(from_sq(m)) + square_name(to_sq(m));
    if (is_promo(m)) s += "nbrq"[promo_type(m) - KNIGHT];
    return s;
}
