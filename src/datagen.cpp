// Self-play data generation for NNUE training.
//
// Output format, one position per line:
//   <fen> | <score in cp, White's view> | <result: 1.0 / 0.5 / 0.0 for White>

#include "datagen.h"

#include <chrono>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <memory>
#include <random>
#include <string>
#include <vector>

#include "position.h"
#include "search.h"
#include "tt.h"

namespace {

bool has_legal_move(Position& pos) {
    MoveList list;
    generate_moves(pos, list, GEN_ALL);
    for (int i = 0; i < list.size; ++i)
        if (pos.make(list.moves[i])) {
            pos.unmake(list.moves[i]);
            return true;
        }
    return false;
}

Move random_legal_move(Position& pos, std::mt19937_64& rng) {
    MoveList list;
    generate_moves(pos, list, GEN_ALL);
    std::vector<Move> legal;
    for (int i = 0; i < list.size; ++i)
        if (pos.make(list.moves[i])) {
            pos.unmake(list.moves[i]);
            legal.push_back(list.moves[i]);
        }
    if (legal.empty()) return NO_MOVE;
    return legal[rng() % legal.size()];
}

void play_move(Position& pos, Move m) {
    pos.make(m);
    pos.reset_accumulator();
    // Keep the undo stack bounded; history before a pawn move or capture
    // is irrelevant for repetitions.
    if (pos.gamePly > MAX_GAME_PLY - MAX_PLY - 8 && pos.halfmove == 0) pos.set_fen(pos.fen());
}

}  // namespace

void datagen(int games, uint64_t nodes, const std::string& path, uint64_t seed) {
    std::mt19937_64 rng(seed);
    std::ofstream out(path, std::ios::app);
    if (!out) {
        std::cout << "cannot open " << path << std::endl;
        return;
    }

    struct Record {
        std::string fen;
        int score;
    };

    const auto t0 = std::chrono::steady_clock::now();
    uint64_t positions = 0;

    for (int g = 0; g < games; ++g) {
        Search::clear();
        auto pos = std::make_unique<Position>();
        pos->set_fen(Position::StartFen);

        // Random opening: 8 or 9 uniformly random plies.
        const int randomPlies = 8 + int(rng() % 2);
        bool ok = true;
        for (int i = 0; i < randomPlies && ok; ++i) {
            Move m = random_legal_move(*pos, rng);
            if (m == NO_MOVE) ok = false;
            else play_move(*pos, m);
        }
        if (!ok || !has_legal_move(*pos)) {
            --g;
            continue;
        }
        int score;
        Search::datagen_search(*pos, nodes, score);
        if (std::abs(score) > 400) {
            --g;
            continue;
        }

        std::vector<Record> records;
        double result = 0.5;
        int winPlies = 0, drawPlies = 0, ply = 0;

        for (;;) {
            if (!has_legal_move(*pos)) {
                result = pos->in_check() ? (pos->side == WHITE ? 0.0 : 1.0) : 0.5;
                break;
            }
            if (pos->halfmove >= 100 || pos->is_repetition() || pos->insufficient_material()) {
                result = 0.5;
                break;
            }

            // Vary the node count slightly so games don't repeat.
            uint64_t n = nodes + rng() % (nodes / 4 + 1);
            Move m = Search::datagen_search(*pos, n, score);
            const int whiteScore = pos->side == WHITE ? score : -score;

            // Adjudication
            if (std::abs(score) >= 2000) {
                if (++winPlies >= 6) {
                    result = whiteScore > 0 ? 1.0 : 0.0;
                    break;
                }
            } else {
                winPlies = 0;
            }
            if (ply >= 80 && std::abs(score) <= 10) {
                if (++drawPlies >= 12) {
                    result = 0.5;
                    break;
                }
            } else {
                drawPlies = 0;
            }

            // Keep quiet positions only: the net evaluates positions at the
            // end of quiescence search, so tactical ones are noise.
            if (!pos->in_check() && !is_capture(m) && !is_promo(m) && std::abs(score) < MATE_BOUND)
                records.push_back({pos->fen(), whiteScore});

            play_move(*pos, m);
            ++ply;
            if (ply >= 400) break;
        }

        for (const auto& r : records) out << r.fen << " | " << r.score << " | " << result << "\n";
        positions += records.size();

        if ((g + 1) % 10 == 0) {
            out.flush();
            auto s = std::chrono::duration_cast<std::chrono::seconds>(std::chrono::steady_clock::now() - t0).count();
            std::cout << "games " << g + 1 << " positions " << positions << " pos/s "
                      << (s ? positions / s : positions) << std::endl;
        }
    }
    out.flush();
}
