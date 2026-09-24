#include "search.h"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <memory>
#include <sstream>
#include <thread>
#include <vector>

#include "eval.h"
#include "tt.h"

namespace Search {
int MoveOverhead = 30;
std::atomic<bool> Silent{false};
}  // namespace Search

namespace {

using Clock = std::chrono::steady_clock;

std::atomic<bool> stopFlag{false};
std::atomic<bool> pondering{false};
SearchLimits limits;
Clock::time_point startTime;
int64_t softLimit = 0, hardLimit = 0;
bool useTime = false;

int LMR[64][64];

constexpr int CorrSize = 16384;
constexpr int CorrGrain = 256;

int64_t elapsed_ms() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(Clock::now() - startTime).count();
}

inline void update_history(int16_t& h, int bonus) {
    int v = h + bonus - h * std::abs(bonus) / 16384;
    h = int16_t(std::clamp(v, -16384, 16384));
}

struct Thread {
    int id = 0;
    Position pos;
    std::atomic<uint64_t> nodes{0};
    int seldepth = 0;
    int rootDepth = 0;
    int completedDepth = 0;
    Move bestMove = NO_MOVE;
    Move ponderMove = NO_MOVE;
    int bestScore = 0;

    int16_t history[2][64][64];
    std::vector<int16_t> contHist = std::vector<int16_t>(768 * 768);
    int16_t captHist[12][64][6];
    int corrHist[2][CorrSize];
    Move killers[MAX_PLY + 4][2];
    Move counters[12][64];
    Move excluded[MAX_PLY + 4];

    Move pv[MAX_PLY + 2][MAX_PLY + 2];
    int pvLen[MAX_PLY + 2];

    // Indexed by ply + 2 so that ply - 2 is always valid.
    int evalStack[MAX_PLY + 4];
    int pieceStack[MAX_PLY + 4];
    int toStack[MAX_PLY + 4];

    Thread() { clear(); }

    void clear() {
        std::fill(&history[0][0][0], &history[0][0][0] + 2 * 64 * 64, int16_t(0));
        std::fill(contHist.begin(), contHist.end(), int16_t(0));
        std::fill(&killers[0][0], &killers[0][0] + (MAX_PLY + 4) * 2, NO_MOVE);
        std::fill(&counters[0][0], &counters[0][0] + 12 * 64, NO_MOVE);
        std::fill(&captHist[0][0][0], &captHist[0][0][0] + 12 * 64 * 6, int16_t(0));
        std::fill(&corrHist[0][0], &corrHist[0][0] + 2 * CorrSize, 0);
        std::fill(excluded, excluded + MAX_PLY + 4, NO_MOVE);
    }

    int& corr_entry() { return corrHist[pos.side][pos.pawnKey & (CorrSize - 1)]; }
    int corrected_eval(int raw) {
        int v = raw + corr_entry() / CorrGrain;
        return std::clamp(v, -MATE_BOUND + 1, MATE_BOUND - 1);
    }
    void update_correction(int raw, int best, int depth) {
        int& e = corr_entry();
        const int w = std::min(depth * depth + 2 * depth + 1, 128);
        e = (e * (256 - w) + (best - raw) * CorrGrain * w) / 256;
        e = std::clamp(e, -CorrGrain * 32, CorrGrain * 32);
    }
    int16_t& capt_hist(Move m) {
        int victim = move_flags(m) == EP_CAPTURE ? PAWN : type_of(pos.board[to_sq(m)]);
        return captHist[pos.board[from_sq(m)]][to_sq(m)][victim];
    }

    void add_node() { nodes.store(nodes.load(std::memory_order_relaxed) + 1, std::memory_order_relaxed); }

    bool should_stop();
    void iterative_deepening();
    int search(int alpha, int beta, int depth, int ply, bool cutNode);
    int qsearch(int alpha, int beta, int ply);
    int quiet_score(Move m, int ply) const;
    void score_moves(MoveList& list, Move ttMove, int ply);
    void update_quiet_stats(Move best, int depth, int ply, const Move* quiets, int nq);
    void update_pv(int ply, Move m) {
        pv[ply][0] = m;
        for (int i = 0; i < pvLen[ply + 1]; ++i) pv[ply][i + 1] = pv[ply + 1][i];
        pvLen[ply] = pvLen[ply + 1] + 1;
    }
};

std::vector<std::unique_ptr<Thread>> threads;

uint64_t total_nodes() {
    uint64_t n = 0;
    for (auto& t : threads) n += t->nodes.load(std::memory_order_relaxed);
    return n;
}

bool Thread::should_stop() {
    if (stopFlag.load(std::memory_order_relaxed)) return true;
    if (id == 0 && (nodes.load(std::memory_order_relaxed) & 1023) == 0 && completedDepth >= 1) {
        if (limits.nodes && total_nodes() >= limits.nodes) stopFlag = true;
        if (useTime && !pondering.load(std::memory_order_relaxed) && elapsed_ms() >= hardLimit) stopFlag = true;
    }
    return stopFlag.load(std::memory_order_relaxed);
}

int Thread::quiet_score(Move m, int ply) const {
    const int from = from_sq(m), to = to_sq(m);
    const int cur = pos.board[from] * 64 + to;
    int s = history[pos.side][from][to];
    if (pieceStack[ply + 1] >= 0) s += contHist[(pieceStack[ply + 1] * 64 + toStack[ply + 1]) * 768 + cur];
    if (pieceStack[ply] >= 0) s += contHist[(pieceStack[ply] * 64 + toStack[ply]) * 768 + cur];
    return s;
}

void Thread::score_moves(MoveList& list, Move ttMove, int ply) {
    const Move counter = pieceStack[ply + 1] >= 0 ? counters[pieceStack[ply + 1]][toStack[ply + 1]] : NO_MOVE;
    for (int i = 0; i < list.size; ++i) {
        const Move m = list.moves[i];
        int& s = list.scores[i];
        if (m == ttMove) {
            s = 1 << 30;
        } else if (is_capture(m)) {
            int victim = move_flags(m) == EP_CAPTURE ? PAWN : type_of(pos.board[to_sq(m)]);
            int attacker = type_of(pos.board[from_sq(m)]);
            int mvvLva = SeeValue[victim] * 8 - attacker;
            if (is_promo(m)) mvvLva += SeeValue[promo_type(m)];
            s = (see_ge(pos, m, -50) ? 1000000 : -1000000) + mvvLva + capt_hist(m) / 8;
        } else if (is_promo(m)) {
            s = promo_type(m) == QUEEN ? 950000 : -2000000;
        } else if (m == killers[ply][0]) {
            s = 800000;
        } else if (m == killers[ply][1]) {
            s = 790000;
        } else if (m == counter) {
            s = 780000;
        } else {
            s = quiet_score(m, ply);
        }
    }
}

inline Move pick_move(MoveList& list, int i) {
    int best = i;
    for (int j = i + 1; j < list.size; ++j)
        if (list.scores[j] > list.scores[best]) best = j;
    std::swap(list.moves[i], list.moves[best]);
    std::swap(list.scores[i], list.scores[best]);
    return list.moves[i];
}

void Thread::update_quiet_stats(Move best, int depth, int ply, const Move* quiets, int nq) {
    if (killers[ply][0] != best) {
        killers[ply][1] = killers[ply][0];
        killers[ply][0] = best;
    }
    if (pieceStack[ply + 1] >= 0) counters[pieceStack[ply + 1]][toStack[ply + 1]] = best;

    const int bonus = std::min(150 * depth, 1600);
    for (int i = 0; i < nq; ++i) {
        const Move m = quiets[i];
        const int b = m == best ? bonus : -bonus;
        const int from = from_sq(m), to = to_sq(m);
        const int cur = pos.board[from] * 64 + to;
        update_history(history[pos.side][from][to], b);
        if (pieceStack[ply + 1] >= 0)
            update_history(contHist[(pieceStack[ply + 1] * 64 + toStack[ply + 1]) * 768 + cur], b);
        if (pieceStack[ply] >= 0) update_history(contHist[(pieceStack[ply] * 64 + toStack[ply]) * 768 + cur], b);
    }
}

int Thread::qsearch(int alpha, int beta, int ply) {
    const bool pvNode = beta - alpha > 1;
    pvLen[ply] = 0;
    add_node();
    if (should_stop()) return 0;
    if (ply > seldepth) seldepth = ply;

    if (pos.halfmove >= 100 || pos.insufficient_material()) return 0;
    const bool inCheck = pos.in_check();
    if (ply >= MAX_PLY - 1) return inCheck ? 0 : evaluate(pos);

    TTData tt;
    const bool ttHit = TT.probe(pos.key, tt);
    const int ttScore = ttHit ? score_from_tt(tt.score, ply) : VALUE_NONE;
    if (!pvNode && ttHit &&
        (tt.bound == BOUND_EXACT || (tt.bound == BOUND_LOWER && ttScore >= beta) ||
         (tt.bound == BOUND_UPPER && ttScore <= alpha)))
        return ttScore;

    int best, standPat, raw = VALUE_NONE;
    if (inCheck) {
        best = -INF;
        standPat = VALUE_NONE;
    } else {
        raw = ttHit && tt.eval != VALUE_NONE ? tt.eval : evaluate(pos);
        standPat = corrected_eval(raw);
        best = standPat;
        if (ttHit && (tt.bound & (ttScore > best ? BOUND_LOWER : BOUND_UPPER))) best = ttScore;
        if (best >= beta) return best;
        if (best > alpha) alpha = best;
    }

    MoveList list;
    generate_moves(pos, list, inCheck ? GEN_ALL : GEN_NOISY);
    score_moves(list, ttHit ? tt.move : NO_MOVE, ply);

    Move bestMove = NO_MOVE;
    int legal = 0;
    for (int i = 0; i < list.size; ++i) {
        const Move m = pick_move(list, i);

        if (!inCheck) {
            if (!is_promo(m)) {
                int victim = move_flags(m) == EP_CAPTURE ? PAWN : type_of(pos.board[to_sq(m)]);
                if (standPat + SeeValue[victim] + 200 <= alpha) continue;
            }
            if (!see_ge(pos, m, 0)) continue;
        }

        if (!pos.make(m)) continue;
        ++legal;
        pieceStack[ply + 2] = pos.board[to_sq(m)];
        toStack[ply + 2] = to_sq(m);
        const int v = -qsearch(-beta, -alpha, ply + 1);
        pos.unmake(m);
        if (stopFlag.load(std::memory_order_relaxed)) return 0;

        if (v > best) {
            best = v;
            if (v > alpha) {
                bestMove = m;
                if (pvNode) update_pv(ply, m);
                if (v >= beta) break;
                alpha = v;
            }
        }
    }

    if (inCheck && legal == 0) return -MATE + ply;

    TT.store(pos.key, bestMove, score_to_tt(best, ply), raw, 0, best >= beta ? BOUND_LOWER : BOUND_UPPER);
    return best;
}

int Thread::search(int alpha, int beta, int depth, int ply, bool cutNode) {
    const bool pvNode = beta - alpha > 1;
    const bool root = ply == 0;
    pvLen[ply] = 0;

    if (depth <= 0) return qsearch(alpha, beta, ply);

    add_node();
    if (should_stop()) return 0;
    if (ply > seldepth) seldepth = ply;

    const bool inCheck = pos.in_check();

    if (!root) {
        if (pos.halfmove >= 100 || pos.is_repetition() || pos.insufficient_material()) return 0;
        if (ply >= MAX_PLY - 1) return inCheck ? 0 : evaluate(pos);
        // Mate distance pruning
        alpha = std::max(alpha, -MATE + ply);
        beta = std::min(beta, MATE - ply - 1);
        if (alpha >= beta) return alpha;
    }

    const Move excludedMove = excluded[ply];
    TTData tt{};
    const bool ttHit = !excludedMove && TT.probe(pos.key, tt);
    const Move ttMove = ttHit ? tt.move : NO_MOVE;
    const int ttScore = ttHit ? score_from_tt(tt.score, ply) : VALUE_NONE;

    if (!pvNode && ttHit && tt.depth >= depth &&
        (tt.bound == BOUND_EXACT || (tt.bound == BOUND_LOWER && ttScore >= beta) ||
         (tt.bound == BOUND_UPPER && ttScore <= alpha)))
        return ttScore;

    int eval, rawEval = VALUE_NONE;
    if (inCheck) {
        eval = evalStack[ply + 2] = VALUE_NONE;
    } else if (excludedMove) {
        // Same position as the parent singular search: reuse its evaluation.
        rawEval = VALUE_NONE;
        eval = evalStack[ply + 2];
    } else {
        rawEval = ttHit && tt.eval != VALUE_NONE ? tt.eval : evaluate(pos);
        evalStack[ply + 2] = corrected_eval(rawEval);
        eval = evalStack[ply + 2];
        // A TT score is a better estimate than the static eval when its bound agrees.
        if (ttHit && std::abs(ttScore) < MATE_BOUND && (tt.bound & (ttScore > eval ? BOUND_LOWER : BOUND_UPPER)))
            eval = ttScore;
    }

    bool improving = false;
    if (!inCheck) {
        if (evalStack[ply] != VALUE_NONE)
            improving = evalStack[ply + 2] > evalStack[ply];
        else if (ply >= 2 && evalStack[ply - 2] != VALUE_NONE)
            improving = evalStack[ply + 2] > evalStack[ply - 2];
    }

    killers[ply + 1][0] = killers[ply + 1][1] = NO_MOVE;

    if (!pvNode && !inCheck && !excludedMove) {
        // Reverse futility pruning
        if (depth <= 8 && std::abs(eval) < MATE_BOUND && eval - 75 * (depth - improving) >= beta) return eval;

        // Razoring
        if (depth <= 3 && eval + 250 * depth < alpha) {
            int v = qsearch(alpha, beta, ply);
            if (v <= alpha) return v;
        }

        // Null move pruning
        if (depth >= 3 && eval >= beta && evalStack[ply + 2] >= beta && pieceStack[ply + 1] >= 0 &&
            pos.has_non_pawn_material(pos.side)) {
            int R = 3 + depth / 3 + std::min((eval - beta) / 200, 3);
            pos.make_null();
            pieceStack[ply + 2] = -1;
            toStack[ply + 2] = 0;
            int v = -search(-beta, -beta + 1, depth - R, ply + 1, !cutNode);
            pos.unmake_null();
            if (stopFlag.load(std::memory_order_relaxed)) return 0;
            if (v >= beta) return v >= MATE_BOUND ? beta : v;
        }
    }

    // Internal iterative reduction
    if (depth >= 4 && ttMove == NO_MOVE && (pvNode || cutNode)) --depth;

    MoveList list;
    generate_moves(pos, list, GEN_ALL);
    score_moves(list, ttMove, ply);

    Move quiets[64];
    int16_t* captSlots[32];
    int nq = 0, nc = 0;
    int bestScore = -INF;
    Move bestMove = NO_MOVE;
    int legal = 0, quietsSeen = 0;
    bool skipQuiets = false;

    for (int i = 0; i < list.size; ++i) {
        const Move m = pick_move(list, i);
        if (m == excludedMove) continue;
        const bool quiet = is_quiet(m);
        if (quiet && skipQuiets) continue;

        const int hist = quiet ? quiet_score(m, ply) : capt_hist(m);

        if (!root && bestScore > -MATE_BOUND) {
            const int lmrDepth = std::max(0, depth - LMR[std::min(depth, 63)][std::min(legal + 1, 63)]);
            if (quiet) {
                // Late move pruning
                if (depth <= 8 && quietsSeen >= (3 + depth * depth) / (improving ? 1 : 2)) {
                    skipQuiets = true;
                    continue;
                }
                // Futility pruning
                if (!inCheck && lmrDepth <= 8 && eval + 100 + 90 * lmrDepth <= alpha) {
                    skipQuiets = true;
                    continue;
                }
                // History pruning
                if (lmrDepth <= 3 && hist < -3000 * depth) continue;
                // SEE pruning for quiets
                if (lmrDepth <= 8 && !see_ge(pos, m, -30 * lmrDepth * lmrDepth)) continue;
            } else if (depth <= 6 && !see_ge(pos, m, -90 * depth)) {
                continue;
            }
        }

        // Singular extension: if every alternative to the TT move fails well
        // below the TT score, the TT move is forced and deserves more depth.
        int extension = 0;
        if (!root && m == ttMove && depth >= 7 && ply < 2 * rootDepth && (tt.bound & BOUND_LOWER) &&
            tt.depth >= depth - 3 && std::abs(ttScore) < MATE_BOUND) {
            const int sBeta = ttScore - 2 * depth;
            excluded[ply] = m;
            const int v = search(sBeta - 1, sBeta, (depth - 1) / 2, ply, cutNode);
            excluded[ply] = NO_MOVE;
            if (stopFlag.load(std::memory_order_relaxed)) return 0;
            if (v < sBeta)
                extension = !pvNode && v < sBeta - 25 ? 2 : 1;
            else if (sBeta >= beta)
                return sBeta;  // multi-cut: several moves beat beta
            else if (ttScore >= beta)
                extension = -1;
        }

        // Remember the capture's history slot while the board still has the mover.
        int16_t* captSlot = is_capture(m) ? &capt_hist(m) : nullptr;
        if (!pos.make(m)) continue;
        ++legal;
        if (captSlot && nc < 32) captSlots[nc++] = captSlot;
        if (quiet) {
            ++quietsSeen;
            if (nq < 64) quiets[nq++] = m;
        }
        pieceStack[ply + 2] = pos.board[to_sq(m)];
        toStack[ply + 2] = to_sq(m);

        const bool givesCheck = pos.in_check();
        if (!extension && givesCheck && ply < 2 * rootDepth) extension = 1;
        const int newDepth = depth - 1 + extension;

        int v;
        if (legal == 1) {
            v = -search(-beta, -alpha, newDepth, ply + 1, pvNode ? false : !cutNode);
        } else {
            int R = 0;
            if (depth >= 3 && legal > 1 + pvNode && (quiet || list.scores[i] < 0)) {
                R = LMR[std::min(depth, 63)][std::min(legal, 63)];
                R += !pvNode;
                R += cutNode;
                R -= improving;
                R -= givesCheck;
                if (quiet) {
                    R -= hist / 8000;
                    if (m == killers[ply][0] || m == killers[ply][1]) --R;
                }
                else
                    R -= hist / 6000;
                R = std::clamp(R, 0, std::max(newDepth - 1, 0));
            }
            v = -search(-alpha - 1, -alpha, newDepth - R, ply + 1, true);
            if (v > alpha && R > 0) v = -search(-alpha - 1, -alpha, newDepth, ply + 1, !cutNode);
            if (pvNode && v > alpha && v < beta) v = -search(-beta, -alpha, newDepth, ply + 1, false);
        }

        pos.unmake(m);
        if (stopFlag.load(std::memory_order_relaxed)) return 0;

        if (v > bestScore) {
            bestScore = v;
            if (v > alpha) {
                bestMove = m;
                if (pvNode) update_pv(ply, m);
                if (v >= beta) break;
                alpha = v;
            }
        }
    }

    if (legal == 0) return excludedMove ? alpha : inCheck ? -MATE + ply : 0;

    if (bestScore >= beta) {
        const int bonus = std::min(150 * depth, 1600);
        if (is_quiet(bestMove)) {
            update_quiet_stats(bestMove, depth, ply, quiets, nq);
        }
        // Captures that were tried and failed get a malus; a cutting capture
        // (always the last one recorded) gets a bonus.
        for (int i = 0; i < nc; ++i) {
            const bool isBest = !is_quiet(bestMove) && is_capture(bestMove) && i == nc - 1;
            update_history(*captSlots[i], isBest ? bonus : -bonus);
        }
    }

    if (excludedMove) return bestScore;

    const int bound = bestScore >= beta ? BOUND_LOWER : bestMove != NO_MOVE ? BOUND_EXACT : BOUND_UPPER;

    // Learn how far the static eval was off in positions with this pawn structure.
    if (!inCheck && (bestMove == NO_MOVE || is_quiet(bestMove)) &&
        !(bound == BOUND_LOWER && bestScore <= evalStack[ply + 2]) &&
        !(bound == BOUND_UPPER && bestScore >= evalStack[ply + 2]))
        update_correction(evalStack[ply + 2], bestScore, depth);

    TT.store(pos.key, bestMove, score_to_tt(bestScore, ply), rawEval, depth, bound);
    return bestScore;
}

std::string score_string(int score) {
    if (score >= MATE_BOUND) return "mate " + std::to_string((MATE - score + 1) / 2);
    if (score <= -MATE_BOUND) return "mate " + std::to_string(-(MATE + score) / 2);
    return "cp " + std::to_string(score);
}

void Thread::iterative_deepening() {
    completedDepth = 0;
    bestMove = ponderMove = NO_MOVE;
    bestScore = 0;
    for (int i = 0; i < 2; ++i) {
        pieceStack[i] = -1;
        toStack[i] = 0;
        evalStack[i] = VALUE_NONE;
    }

    // Fallback in case the search is stopped before depth 1 completes.
    MoveList rootMoves;
    generate_moves(pos, rootMoves, GEN_ALL);
    for (int i = 0; i < rootMoves.size; ++i)
        if (pos.make(rootMoves.moves[i])) {
            pos.unmake(rootMoves.moves[i]);
            bestMove = rootMoves.moves[i];
            break;
        }
    if (bestMove == NO_MOVE) return;

    Move prevBest = NO_MOVE;
    int stability = 0;
    int score = 0;

    for (int depth = 1; depth <= limits.depth; ++depth) {
        rootDepth = depth;
        seldepth = 0;

        int delta = 15;
        int alpha = -INF, beta = INF;
        if (depth >= 5) {
            alpha = std::max(score - delta, -INF);
            beta = std::min(score + delta, INF);
        }

        for (;;) {
            int v = search(alpha, beta, depth, 0, false);
            if (stopFlag.load()) break;
            if (v <= alpha) {
                beta = (alpha + beta) / 2;
                alpha = std::max(v - delta, -INF);
            } else if (v >= beta) {
                beta = std::min(v + delta, INF);
            } else {
                score = v;
                break;
            }
            delta += delta / 2;
            if (delta > 800) alpha = -INF, beta = INF;
        }
        if (stopFlag.load()) break;

        completedDepth = depth;
        bestScore = score;
        if (pvLen[0] > 0) bestMove = pv[0][0];
        ponderMove = pvLen[0] > 1 ? pv[0][1] : NO_MOVE;

        if (id != 0) continue;

        if (!Search::Silent) {
            int64_t ms = elapsed_ms();
            uint64_t n = total_nodes();
            std::ostringstream os;
            os << "info depth " << depth << " seldepth " << seldepth << " multipv 1 score " << score_string(score)
               << " nodes " << n << " nps " << (ms > 0 ? n * 1000 / ms : n) << " hashfull " << TT.hashfull()
               << " time " << ms << " pv";
            for (int i = 0; i < pvLen[0]; ++i) os << ' ' << move_to_uci(pv[0][i]);
            std::cout << os.str() << std::endl;
        }

        stability = bestMove == prevBest ? std::min(stability + 1, 4) : 0;
        prevBest = bestMove;

        if (limits.nodes && total_nodes() >= limits.nodes) break;
        if (limits.softNodes && total_nodes() >= limits.softNodes) break;
        if (useTime && !pondering.load()) {
            static const double scale[5] = {2.0, 1.4, 1.1, 0.9, 0.8};
            if (elapsed_ms() >= int64_t(softLimit * scale[stability])) break;
        }
        // A found mate won't get shorter by searching much deeper.
        if (std::abs(score) >= MATE_BOUND && depth >= 2 * (MATE - std::abs(score)) + 4 && !limits.infinite) break;
    }
}

void setup_time(const Position& pos) {
    useTime = false;
    const int64_t overhead = Search::MoveOverhead;
    if (limits.movetime >= 0) {
        useTime = true;
        softLimit = hardLimit = std::max<int64_t>(1, limits.movetime - overhead);
        return;
    }
    const int64_t time = pos.side == WHITE ? limits.wtime : limits.btime;
    const int64_t inc = pos.side == WHITE ? limits.winc : limits.binc;
    if (time < 0) return;

    useTime = true;
    const int mtg = limits.movestogo > 0 ? std::min(limits.movestogo, 40) : 25;
    const int64_t avail = std::max<int64_t>(1, time - overhead);
    softLimit = avail / mtg + inc * 3 / 4;
    hardLimit = std::min(softLimit * 4, avail * 7 / 10);
    hardLimit = std::max<int64_t>(hardLimit, 1);
    softLimit = std::min(softLimit, hardLimit);
}

void start_search(const Position& pos, const SearchLimits& lim, bool useHelpers) {
    limits = lim;
    stopFlag = false;
    pondering = lim.ponder;
    startTime = Clock::now();
    setup_time(pos);
    TT.new_search();

    for (auto& t : threads) {
        t->pos = pos;
        t->nodes = 0;
    }

    std::vector<std::thread> helpers;
    if (useHelpers)
        for (size_t i = 1; i < threads.size(); ++i)
            helpers.emplace_back([i] { threads[i]->iterative_deepening(); });

    threads[0]->iterative_deepening();

    while (!stopFlag.load() && (limits.infinite || pondering.load()))
        std::this_thread::sleep_for(std::chrono::milliseconds(1));

    stopFlag = true;
    for (auto& h : helpers) h.join();
}

}  // namespace

namespace Search {

void init() {
    for (int d = 1; d < 64; ++d)
        for (int m = 1; m < 64; ++m) LMR[d][m] = int(0.75 + std::log(d) * std::log(m) / 2.25);
    set_threads(1);
}

void set_threads(int n) {
    n = std::clamp(n, 1, 256);
    threads.clear();
    for (int i = 0; i < n; ++i) {
        threads.push_back(std::make_unique<Thread>());
        threads.back()->id = i;
    }
}

void clear() {
    TT.clear();
    for (auto& t : threads) t->clear();
}

void run(const Position& pos, const SearchLimits& lim) {
    start_search(pos, lim, true);

    Thread& main = *threads[0];
    std::string out = "bestmove " + move_to_uci(main.bestMove);
    if (main.ponderMove != NO_MOVE) out += " ponder " + move_to_uci(main.ponderMove);
    std::cout << out << std::endl;
}

void stop() {
    pondering = false;
    stopFlag = true;
}

void ponderhit() { pondering = false; }

uint64_t bench_search(const Position& pos, int depth) {
    SearchLimits lim;
    lim.depth = depth;
    bool prev = Silent;
    Silent = true;
    start_search(pos, lim, false);
    Silent = prev;
    return threads[0]->nodes.load();
}

Move datagen_search(const Position& pos, uint64_t softNodes, int& score) {
    SearchLimits lim;
    lim.softNodes = softNodes;
    lim.nodes = softNodes * 8;
    bool prev = Silent;
    Silent = true;
    start_search(pos, lim, false);
    Silent = prev;
    score = threads[0]->bestScore;
    return threads[0]->bestMove;
}

}  // namespace Search
