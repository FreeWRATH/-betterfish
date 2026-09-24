#include "position.h"

#include <algorithm>
#include <cstring>
#include <sstream>

const char* Position::StartFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const int SeeValue[6] = {100, 300, 300, 500, 900, 20000};

namespace {

struct Zobrist {
    U64 psq[12][64];
    U64 castle[16];
    U64 epFile[8];
    U64 side;
} Z;

int CastleMask[64];

const char PieceChars[] = "PNBRQKpnbrqk";

}  // namespace

void init_zobrist() {
    U64 s = 0x2545F4914F6CDD1DULL;
    auto next = [&]() {
        s ^= s >> 12;
        s ^= s << 25;
        s ^= s >> 27;
        return s * 2685821657736338717ULL;
    };
    for (auto& p : Z.psq)
        for (auto& k : p) k = next();
    for (auto& k : Z.castle) k = next();
    for (auto& k : Z.epFile) k = next();
    Z.side = next();

    for (int& m : CastleMask) m = 15;
    CastleMask[0] &= ~WQ;
    CastleMask[7] &= ~WK;
    CastleMask[4] &= ~(WK | WQ);
    CastleMask[56] &= ~BQ;
    CastleMask[63] &= ~BK;
    CastleMask[60] &= ~(BK | BQ);
}

void Position::put_piece(int p, int sq) {
    bb[p] |= bit(sq);
    byColor[color_of(p)] |= bit(sq);
    all |= bit(sq);
    board[sq] = p;
    key ^= Z.psq[p][sq];
}

void Position::remove_piece(int sq) {
    int p = board[sq];
    bb[p] ^= bit(sq);
    byColor[color_of(p)] ^= bit(sq);
    all ^= bit(sq);
    board[sq] = NO_PIECE;
    key ^= Z.psq[p][sq];
}

void Position::move_piece(int from, int to) {
    int p = board[from];
    U64 fromTo = bit(from) | bit(to);
    bb[p] ^= fromTo;
    byColor[color_of(p)] ^= fromTo;
    all ^= fromTo;
    board[from] = NO_PIECE;
    board[to] = p;
    key ^= Z.psq[p][from] ^ Z.psq[p][to];
}

bool Position::set_fen(const std::string& fenStr) {
    std::memset(bb, 0, sizeof(bb));
    byColor[0] = byColor[1] = all = 0;
    for (int& b : board) b = NO_PIECE;
    key = 0;
    gamePly = 0;

    std::istringstream ss(fenStr);
    std::string placement, stm, cast, eps;
    if (!(ss >> placement >> stm)) return false;
    ss >> cast >> eps;
    halfmove = 0;
    fullmove = 1;
    ss >> halfmove >> fullmove;

    int sq = 56;
    for (char c : placement) {
        if (c == '/') {
            sq -= 16;
        } else if (c >= '1' && c <= '8') {
            sq += c - '0';
        } else {
            const char* p = std::strchr(PieceChars, c);
            if (!p || sq < 0 || sq > 63) return false;
            put_piece(int(p - PieceChars), sq++);
        }
    }
    if (popcount(bb[W_KING]) != 1 || popcount(bb[B_KING]) != 1) return false;

    side = stm == "b" ? BLACK : WHITE;
    castling = 0;
    for (char c : cast) {
        if (c == 'K') castling |= WK;
        if (c == 'Q') castling |= WQ;
        if (c == 'k') castling |= BK;
        if (c == 'q') castling |= BQ;
    }
    ep = NO_SQ;
    if (eps.size() == 2 && eps[0] >= 'a' && eps[0] <= 'h' && eps[1] >= '1' && eps[1] <= '8') {
        int e = (eps[1] - '1') * 8 + (eps[0] - 'a');
        if (PawnAttacks[side ^ 1][e] & pieces(side, PAWN)) ep = e;
    }

    key ^= Z.castle[castling];
    if (ep != NO_SQ) key ^= Z.epFile[file_of(ep)];
    if (side == BLACK) key ^= Z.side;
    return true;
}

std::string Position::fen() const {
    std::string s;
    for (int r = 7; r >= 0; --r) {
        int empty = 0;
        for (int f = 0; f < 8; ++f) {
            int p = board[r * 8 + f];
            if (p == NO_PIECE) {
                ++empty;
                continue;
            }
            if (empty) s += char('0' + empty), empty = 0;
            s += PieceChars[p];
        }
        if (empty) s += char('0' + empty);
        if (r) s += '/';
    }
    s += side == WHITE ? " w " : " b ";
    std::string c;
    if (castling & WK) c += 'K';
    if (castling & WQ) c += 'Q';
    if (castling & BK) c += 'k';
    if (castling & BQ) c += 'q';
    s += c.empty() ? "-" : c;
    s += ' ';
    s += ep == NO_SQ ? "-" : square_name(ep);
    s += ' ' + std::to_string(halfmove) + ' ' + std::to_string(fullmove);
    return s;
}

std::string Position::pretty() const {
    std::ostringstream os;
    os << "\n +---+---+---+---+---+---+---+---+\n";
    for (int r = 7; r >= 0; --r) {
        for (int f = 0; f < 8; ++f) {
            int p = board[r * 8 + f];
            os << " | " << (p == NO_PIECE ? ' ' : PieceChars[p]);
        }
        os << " | " << (r + 1) << "\n +---+---+---+---+---+---+---+---+\n";
    }
    os << "   a   b   c   d   e   f   g   h\n\nFen: " << fen() << "\nKey: " << std::hex << key << std::dec
       << "\n";
    return os.str();
}

U64 Position::attackers_to(int sq, U64 occ) const {
    return (PawnAttacks[BLACK][sq] & bb[W_PAWN]) | (PawnAttacks[WHITE][sq] & bb[B_PAWN]) |
           (KnightAttacks[sq] & pieces_pt(KNIGHT)) | (KingAttacks[sq] & pieces_pt(KING)) |
           (bishop_attacks(sq, occ) & (pieces_pt(BISHOP) | pieces_pt(QUEEN))) |
           (rook_attacks(sq, occ) & (pieces_pt(ROOK) | pieces_pt(QUEEN)));
}

bool Position::attacked(int sq, int by) const {
    if (PawnAttacks[by ^ 1][sq] & pieces(by, PAWN)) return true;
    if (KnightAttacks[sq] & pieces(by, KNIGHT)) return true;
    if (KingAttacks[sq] & pieces(by, KING)) return true;
    U64 bq = pieces(by, BISHOP) | pieces(by, QUEEN);
    if (bq && (bishop_attacks(sq, all) & bq)) return true;
    U64 rq = pieces(by, ROOK) | pieces(by, QUEEN);
    return rq && (rook_attacks(sq, all) & rq);
}

bool Position::make(Move m) {
    const int from = from_sq(m), to = to_sq(m), fl = move_flags(m);
    const int us = side, them = us ^ 1;
    const int pc = board[from];

    Undo& u = stack[gamePly];
    u.move = m;
    u.castling = castling;
    u.ep = ep;
    u.halfmove = halfmove;
    u.key = key;
    u.captured = NO_PIECE;
    keys[gamePly] = key;
    ++gamePly;

    if (ep != NO_SQ) key ^= Z.epFile[file_of(ep)];
    ep = NO_SQ;
    ++halfmove;

    if (fl == EP_CAPTURE) {
        int capSq = to + (us == WHITE ? -8 : 8);
        u.captured = board[capSq];
        remove_piece(capSq);
    } else if (fl & CAPTURE) {
        u.captured = board[to];
        remove_piece(to);
    }
    if (u.captured != NO_PIECE) halfmove = 0;

    move_piece(from, to);

    if (type_of(pc) == PAWN) {
        halfmove = 0;
        if (fl == DOUBLE_PUSH) {
            int epSq = from + (us == WHITE ? 8 : -8);
            if (PawnAttacks[us][epSq] & pieces(them, PAWN)) {
                ep = epSq;
                key ^= Z.epFile[file_of(ep)];
            }
        } else if (fl & PROMO) {
            remove_piece(to);
            put_piece(make_piece(us, promo_type(m)), to);
        }
    } else if (fl == KING_CASTLE) {
        move_piece(us == WHITE ? 7 : 63, us == WHITE ? 5 : 61);
    } else if (fl == QUEEN_CASTLE) {
        move_piece(us == WHITE ? 0 : 56, us == WHITE ? 3 : 59);
    }

    key ^= Z.castle[castling];
    castling &= CastleMask[from] & CastleMask[to];
    key ^= Z.castle[castling];

    side = them;
    key ^= Z.side;
    if (us == BLACK) ++fullmove;

    if (attacked(king_sq(us), them)) {
        unmake(m);
        return false;
    }
    return true;
}

void Position::unmake(Move m) {
    --gamePly;
    const Undo& u = stack[gamePly];
    side ^= 1;
    const int us = side;
    const int from = from_sq(m), to = to_sq(m), fl = move_flags(m);

    if (fl & PROMO) {
        remove_piece(to);
        put_piece(make_piece(us, PAWN), to);
    }
    move_piece(to, from);

    if (fl == KING_CASTLE)
        move_piece(us == WHITE ? 5 : 61, us == WHITE ? 7 : 63);
    else if (fl == QUEEN_CASTLE)
        move_piece(us == WHITE ? 3 : 59, us == WHITE ? 0 : 56);

    if (u.captured != NO_PIECE)
        put_piece(u.captured, fl == EP_CAPTURE ? to + (us == WHITE ? -8 : 8) : to);

    castling = u.castling;
    ep = u.ep;
    halfmove = u.halfmove;
    key = u.key;
    if (us == BLACK) --fullmove;
}

void Position::make_null() {
    Undo& u = stack[gamePly];
    u.move = NO_MOVE;
    u.captured = NO_PIECE;
    u.castling = castling;
    u.ep = ep;
    u.halfmove = halfmove;
    u.key = key;
    keys[gamePly] = key;
    ++gamePly;

    if (ep != NO_SQ) key ^= Z.epFile[file_of(ep)];
    ep = NO_SQ;
    // Repetition detection must not look past a null move.
    halfmove = 0;
    side ^= 1;
    key ^= Z.side;
}

void Position::unmake_null() {
    --gamePly;
    const Undo& u = stack[gamePly];
    side ^= 1;
    ep = u.ep;
    halfmove = u.halfmove;
    key = u.key;
}

bool Position::is_repetition() const {
    int n = std::min(halfmove, gamePly);
    for (int i = 4; i <= n; i += 2)
        if (keys[gamePly - i] == key) return true;
    return false;
}

bool Position::insufficient_material() const {
    if (pieces_pt(PAWN) | pieces_pt(ROOK) | pieces_pt(QUEEN)) return false;
    return popcount(pieces_pt(KNIGHT) | pieces_pt(BISHOP)) <= 1;
}

Move Position::parse_uci_move(const std::string& s) const {
    MoveList list;
    generate_moves(*this, list, GEN_ALL);
    for (int i = 0; i < list.size; ++i)
        if (move_to_uci(list.moves[i]) == s) return list.moves[i];
    return NO_MOVE;
}

// ---------------------------------------------------------------------------
// Move generation (pseudo-legal; legality is checked in Position::make)
// ---------------------------------------------------------------------------

namespace {

inline void add_promotions(MoveList& list, int from, int to, bool capture, GenType type) {
    int base = capture ? PROMO_CAPTURE : PROMO;
    list.add(make_move(from, to, base | (QUEEN - KNIGHT)));
    if (type == GEN_ALL || capture) {
        list.add(make_move(from, to, base | (KNIGHT - KNIGHT)));
        list.add(make_move(from, to, base | (ROOK - KNIGHT)));
        list.add(make_move(from, to, base | (BISHOP - KNIGHT)));
    }
}

}  // namespace

void generate_moves(const Position& pos, MoveList& list, GenType type) {
    const int us = pos.side, them = us ^ 1;
    const U64 enemies = pos.byColor[them];
    const U64 empty = ~pos.all;
    const int up = us == WHITE ? 8 : -8;
    const U64 promoRank = us == WHITE ? RankBB[6] : RankBB[1];
    const U64 startRank = us == WHITE ? RankBB[1] : RankBB[6];

    // Pawns
    U64 pawns = pos.pieces(us, PAWN);
    while (pawns) {
        int from = pop_lsb(pawns);
        int to = from + up;
        bool promo = promoRank & bit(from);

        if (empty & bit(to)) {
            if (promo) {
                add_promotions(list, from, to, false, type);
            } else if (type == GEN_ALL) {
                list.add(make_move(from, to, QUIET));
                if ((startRank & bit(from)) && (empty & bit(to + up)))
                    list.add(make_move(from, to + up, DOUBLE_PUSH));
            }
        }

        U64 caps = PawnAttacks[us][from] & enemies;
        while (caps) {
            int c = pop_lsb(caps);
            if (promo)
                add_promotions(list, from, c, true, type);
            else
                list.add(make_move(from, c, CAPTURE));
        }

        if (pos.ep != NO_SQ && (PawnAttacks[us][from] & bit(pos.ep)))
            list.add(make_move(from, pos.ep, EP_CAPTURE));
    }

    const U64 targets = type == GEN_NOISY ? enemies : ~pos.byColor[us];

    auto add_targets = [&](int from, U64 att) {
        att &= targets;
        while (att) {
            int to = pop_lsb(att);
            list.add(make_move(from, to, (enemies & bit(to)) ? CAPTURE : QUIET));
        }
    };

    U64 b = pos.pieces(us, KNIGHT);
    while (b) {
        int from = pop_lsb(b);
        add_targets(from, KnightAttacks[from]);
    }
    b = pos.pieces(us, BISHOP);
    while (b) {
        int from = pop_lsb(b);
        add_targets(from, bishop_attacks(from, pos.all));
    }
    b = pos.pieces(us, ROOK);
    while (b) {
        int from = pop_lsb(b);
        add_targets(from, rook_attacks(from, pos.all));
    }
    b = pos.pieces(us, QUEEN);
    while (b) {
        int from = pop_lsb(b);
        add_targets(from, queen_attacks(from, pos.all));
    }
    int ksq = pos.king_sq(us);
    add_targets(ksq, KingAttacks[ksq]);

    if (type == GEN_ALL && pos.castling) {
        if (us == WHITE) {
            if ((pos.castling & WK) && !(pos.all & (bit(5) | bit(6))) && !pos.attacked(4, them) &&
                !pos.attacked(5, them))
                list.add(make_move(4, 6, KING_CASTLE));
            if ((pos.castling & WQ) && !(pos.all & (bit(1) | bit(2) | bit(3))) && !pos.attacked(4, them) &&
                !pos.attacked(3, them))
                list.add(make_move(4, 2, QUEEN_CASTLE));
        } else {
            if ((pos.castling & BK) && !(pos.all & (bit(61) | bit(62))) && !pos.attacked(60, them) &&
                !pos.attacked(61, them))
                list.add(make_move(60, 62, KING_CASTLE));
            if ((pos.castling & BQ) && !(pos.all & (bit(57) | bit(58) | bit(59))) && !pos.attacked(60, them) &&
                !pos.attacked(59, them))
                list.add(make_move(60, 58, QUEEN_CASTLE));
        }
    }
}

// ---------------------------------------------------------------------------
// Static exchange evaluation (swap algorithm with x-rays)
// ---------------------------------------------------------------------------

bool see_ge(const Position& pos, Move m, int threshold) {
    if (is_castle(m) || move_flags(m) == EP_CAPTURE || is_promo(m)) return threshold <= 0;

    const int from = from_sq(m), to = to_sq(m);
    int swap = (pos.board[to] == NO_PIECE ? 0 : SeeValue[type_of(pos.board[to])]) - threshold;
    if (swap < 0) return false;

    swap = SeeValue[type_of(pos.board[from])] - swap;
    if (swap <= 0) return true;

    U64 occ = pos.all ^ bit(from) ^ bit(to);
    int stm = color_of(pos.board[from]);
    U64 attackers = pos.attackers_to(to, occ);
    const U64 diag = pos.pieces_pt(BISHOP) | pos.pieces_pt(QUEEN);
    const U64 orth = pos.pieces_pt(ROOK) | pos.pieces_pt(QUEEN);
    int res = 1;

    for (;;) {
        stm ^= 1;
        attackers &= occ;
        U64 stmAttackers = attackers & pos.byColor[stm];
        if (!stmAttackers) break;
        res ^= 1;

        int pt;
        for (pt = PAWN; pt <= KING; ++pt)
            if (stmAttackers & pos.pieces(stm, pt)) break;

        if (pt == KING) return (attackers & ~pos.byColor[stm]) ? res ^ 1 : res;

        swap = SeeValue[pt] - swap;
        if (swap < res) break;

        occ ^= bit(lsb(stmAttackers & pos.pieces(stm, pt)));
        if (pt == PAWN || pt == BISHOP || pt == QUEEN) attackers |= bishop_attacks(to, occ) & diag;
        if (pt == ROOK || pt == QUEEN) attackers |= rook_attacks(to, occ) & orth;
    }
    return res;
}
