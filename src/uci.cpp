#include <algorithm>
#include <chrono>
#include <cstring>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

#include "datagen.h"
#include "eval.h"
#include "nnue.h"
#include "position.h"
#include "search.h"
#include "tt.h"

namespace {

const char* EngineName = "Betterfish 1.0";

uint64_t perft(Position& pos, int depth) {
    if (depth == 0) return 1;
    MoveList list;
    generate_moves(pos, list, GEN_ALL);
    uint64_t n = 0;
    for (int i = 0; i < list.size; ++i) {
        if (!pos.make(list.moves[i])) continue;
        n += depth == 1 ? 1 : perft(pos, depth - 1);
        pos.unmake(list.moves[i]);
    }
    return n;
}

void perft_divide(Position& pos, int depth) {
    auto t0 = std::chrono::steady_clock::now();
    MoveList list;
    generate_moves(pos, list, GEN_ALL);
    uint64_t total = 0;
    for (int i = 0; i < list.size; ++i) {
        if (!pos.make(list.moves[i])) continue;
        uint64_t n = depth <= 1 ? 1 : perft(pos, depth - 1);
        pos.unmake(list.moves[i]);
        std::cout << move_to_uci(list.moves[i]) << ": " << n << "\n";
        total += n;
    }
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - t0).count();
    std::cout << "\nNodes searched: " << total << "\nTime: " << ms << " ms\n" << std::endl;
}

struct PerftCase {
    const char* fen;
    int depth;
    uint64_t nodes;
};

const PerftCase PerftSuite[] = {
    {"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 5, 4865609},
    {"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", 4, 4085603},
    {"8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1", 5, 674624},
    {"r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1", 4, 422333},
    {"rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8", 4, 2103487},
    {"r4rk1/1pp1qppp/p1np1n2/2b1p1B1/2B1P1b1/P1NP1N2/1PP1QPPP/R4RK1 w - - 0 10", 4, 3894594},
};

// Walks the move tree and checks that the incrementally updated NNUE
// accumulator always equals a from-scratch refresh.
bool accumulator_check(Position& pos, int depth) {
    NNUE::Accumulator fresh;
    NNUE::refresh(fresh, pos.bb);
    if (std::memcmp(&fresh, &pos.accumulator(), sizeof(fresh)) != 0) return false;
    if (depth == 0) return true;
    MoveList list;
    generate_moves(pos, list, GEN_ALL);
    for (int i = 0; i < list.size; ++i) {
        if (!pos.make(list.moves[i])) continue;
        bool ok = accumulator_check(pos, depth - 1);
        pos.unmake(list.moves[i]);
        if (!ok) return false;
    }
    return true;
}

bool perft_test() {
    bool ok = true;
    Position pos;
    for (const auto& c : PerftSuite) {
        pos.set_fen(c.fen);
        uint64_t n = perft(pos, c.depth);
        bool pass = n == c.nodes;
        ok &= pass;
        std::cout << (pass ? "PASS " : "FAIL ") << c.fen << " depth " << c.depth << ": " << n << " (expected "
                  << c.nodes << ")" << std::endl;
    }
    // Use random weights so every feature contributes.
    NNUE::Net saved = NNUE::net;
    uint32_t r = 12345;
    for (auto& w : NNUE::net.ftW) w = int16_t(((r = r * 1103515245 + 12345) >> 16) % 201 - 100);
    for (const auto& c : PerftSuite) {
        pos.set_fen(c.fen);
        bool pass = accumulator_check(pos, 3);
        ok &= pass;
        std::cout << (pass ? "PASS " : "FAIL ") << "accumulator " << c.fen << std::endl;
    }
    NNUE::net = saved;
    std::cout << (ok ? "All perft tests passed" : "PERFT TESTS FAILED") << std::endl;
    return ok;
}

const char* BenchFens[] = {
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 10",
    "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 11",
    "4rrk1/pp1n3p/3q2pQ/2p1pb2/2PP4/2P3N1/P2B2PP/4RRK1 b - - 7 19",
    "rq3rk1/ppp2ppp/1bnpb3/3N2B1/3NP3/7P/PPPQ1PP1/2KR3R w - - 7 14",
    "r1bq1r1k/1pp1n1pp/1p1p4/4p2Q/4Pp2/1BNP4/PPP2PPP/3R1RK1 w - - 2 14",
    "r3r1k1/2p2ppp/p1p1bn2/8/1q2P3/2NPQN2/PPP3PP/R4RK1 b - - 2 15",
    "r1bbk1nr/pp3p1p/2n5/1N4p1/2Np1B2/8/PPP2PPP/2KR1B1R w kq - 0 13",
    "r1bq1rk1/ppp1nppp/4n3/3p3Q/3P4/1BP1B3/PP1N2PP/R4RK1 w - - 1 16",
    "4r1k1/r1q2ppp/ppp2n2/4P3/5Rb1/1N1BQ3/PPP3PP/R5K1 w - - 1 17",
    "2rqkb1r/ppp2p2/2npb1p1/1N1Nn2p/2P1PP2/8/PP2B1PP/R1BQK2R b KQ - 0 11",
    "r1bq1r1k/b1p1npp1/p2p3p/1p6/3PP3/1B2NN2/PP3PPP/R2Q1RK1 w - - 1 16",
    "3r1rk1/p5pp/bpp1pp2/8/q1PP1P2/b3P3/P2NQRPP/1R2B1K1 b - - 6 22",
    "r1q2rk1/2p1bppp/2Pp4/p6b/Q1PNp3/4B3/PP1R1PPP/2K4R w - - 2 18",
    "4k2r/1pb2ppp/1p2p3/1R1p4/3P4/2r1PN2/P4PPP/1R4K1 b - - 3 22",
    "3q2k1/pb3p1p/4pbp1/2r5/PpN2N2/1P2P2P/5PP1/Q2R2K1 b - - 4 26",
    "6k1/6p1/6Pp/ppp5/3pn2P/1P3K2/1PP2P2/3N4 b - - 0 1",
    "3b4/5kp1/1p1p1p1p/pP1PpP1P/P1P1P3/3KN3/8/8 w - - 0 1",
    "2K5/p7/7P/5pR1/8/5k2/r7/8 w - - 0 1",
    "8/6pk/1p6/8/PP3p1p/5P2/4KP1q/3Q4 w - - 0 1",
};

void bench(int depth) {
    Search::clear();
    Position pos;
    uint64_t total = 0;
    auto t0 = std::chrono::steady_clock::now();
    for (const char* fen : BenchFens) {
        pos.set_fen(fen);
        total += Search::bench_search(pos, depth);
    }
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - t0).count();
    std::cout << "\n===========================\nTotal time (ms) : " << ms << "\nNodes searched  : " << total
              << "\nNodes/second    : " << (ms ? total * 1000 / ms : total) << std::endl;
    Search::clear();
}

void parse_position(Position& pos, std::istringstream& is) {
    std::string token, fen;
    is >> token;
    if (token == "startpos") {
        fen = Position::StartFen;
        is >> token;  // "moves", if present
    } else if (token == "fen") {
        while (is >> token && token != "moves") fen += token + " ";
    } else {
        return;
    }
    if (!pos.set_fen(fen)) {
        std::cout << "info string invalid fen" << std::endl;
        pos.set_fen(Position::StartFen);
        return;
    }
    while (is >> token) {
        Move m = pos.parse_uci_move(token);
        if (m == NO_MOVE || !pos.make(m)) {
            std::cout << "info string illegal move " << token << std::endl;
            break;
        }
        // The accumulator stack only has room for a search's worth of plies.
        pos.reset_accumulator();
        // Keep the undo stack from overflowing in very long games; the
        // history needed for repetition detection is bounded by halfmove.
        if (pos.gamePly > MAX_GAME_PLY - MAX_PLY - 8 && pos.halfmove == 0) {
            std::string f = pos.fen();
            pos.set_fen(f);
        }
    }
}

SearchLimits parse_go(std::istringstream& is) {
    SearchLimits lim;
    std::string token;
    while (is >> token) {
        if (token == "wtime") is >> lim.wtime;
        else if (token == "btime") is >> lim.btime;
        else if (token == "winc") is >> lim.winc;
        else if (token == "binc") is >> lim.binc;
        else if (token == "movestogo") is >> lim.movestogo;
        else if (token == "depth") is >> lim.depth;
        else if (token == "nodes") is >> lim.nodes;
        else if (token == "movetime") is >> lim.movetime;
        else if (token == "infinite") lim.infinite = true;
        else if (token == "ponder") lim.ponder = true;
    }
    lim.depth = std::clamp(lim.depth, 1, MAX_PLY - 1);
    return lim;
}

}  // namespace

int main(int argc, char** argv) {
    init_bitboards();
    init_zobrist();
    init_eval();
    TT.resize(64);
    Search::init();
    NNUE::load_embedded();

    auto pos = std::make_unique<Position>();
    pos->set_fen(Position::StartFen);
    std::thread searchThread;

    auto wait_search = [&] {
        if (searchThread.joinable()) searchThread.join();
    };
    auto stop_search = [&] {
        Search::stop();
        wait_search();
    };

    // Allow one-shot commands from the command line, e.g. `betterfish bench`.
    std::string argLine;
    for (int i = 1; i < argc; ++i) argLine += std::string(argv[i]) + (i + 1 < argc ? " " : "");

    std::string line;
    bool oneShot = argc > 1;
    while (oneShot || std::getline(std::cin, line)) {
        if (oneShot) line = argLine;
        std::istringstream is(line);
        std::string cmd;
        is >> cmd;

        if (cmd == "uci") {
            std::cout << "id name " << EngineName << "\nid author Betterfish developers\n"
                      << "option name Hash type spin default 64 min 1 max 65536\n"
                      << "option name Threads type spin default 1 min 1 max 256\n"
                      << "option name Move Overhead type spin default 30 min 0 max 5000\n"
                      << "option name Ponder type check default false\n"
                      << "option name Clear Hash type button\n"
                      << "option name Use NNUE type check default true\n"
                      << "option name EvalFile type string default <embedded>\n"
                      << "uciok" << std::endl;
        } else if (cmd == "isready") {
            std::cout << "readyok" << std::endl;
        } else if (cmd == "ucinewgame") {
            stop_search();
            Search::clear();
        } else if (cmd == "setoption") {
            stop_search();
            std::string token, name, value;
            is >> token;  // "name"
            while (is >> token && token != "value") name += (name.empty() ? "" : " ") + token;
            std::getline(is >> std::ws, value);
            if (name == "Hash") TT.resize(std::stoul(value));
            else if (name == "Threads") Search::set_threads(std::stoi(value));
            else if (name == "Move Overhead") Search::MoveOverhead = std::stoi(value);
            else if (name == "Clear Hash") Search::clear();
            else if (name == "Use NNUE") NNUE::Enabled = value == "true";
            else if (name == "EvalFile") {
                bool ok = value == "<embedded>" ? NNUE::load_embedded() : NNUE::load_file(value);
                std::cout << "info string " << (ok ? "loaded" : "failed to load") << " network " << value
                          << std::endl;
            }
            pos->reset_accumulator();
        } else if (cmd == "position") {
            stop_search();
            parse_position(*pos, is);
        } else if (cmd == "go") {
            stop_search();
            SearchLimits lim = parse_go(is);
            searchThread = std::thread([snapshot = std::make_shared<Position>(*pos), lim] {
                Search::run(*snapshot, lim);
            });
        } else if (cmd == "stop") {
            stop_search();
        } else if (cmd == "ponderhit") {
            Search::ponderhit();
        } else if (cmd == "quit") {
            stop_search();
            break;
        } else if (cmd == "d") {
            std::cout << pos->pretty() << std::endl;
        } else if (cmd == "eval") {
            std::cout << "Static eval (side to move): " << evaluate(*pos) << " cp"
                      << (NNUE::Loaded && NNUE::Enabled ? " (NNUE)" : " (classical)")
                      << "\nClassical eval: " << evaluate_hce(*pos) << " cp" << std::endl;
        } else if (cmd == "datagen") {
            // datagen <games> <nodes> <file> [seed]
            int games = 100;
            uint64_t nodes = 5000, seed = uint64_t(std::chrono::steady_clock::now().time_since_epoch().count());
            std::string file = "data.txt";
            is >> games >> nodes >> file >> seed;
            TT.resize(16);
            datagen(games, nodes, file, seed);
        } else if (cmd == "perft") {
            int depth = 1;
            is >> depth;
            perft_divide(*pos, depth);
        } else if (cmd == "perfttest") {
            bool ok = perft_test();
            if (oneShot) return ok ? 0 : 1;
        } else if (cmd == "bench") {
            int depth = 12;
            is >> depth;
            bench(depth);
        } else if (!cmd.empty()) {
            std::cout << "Unknown command: " << line << std::endl;
        }

        if (oneShot) {
            wait_search();
            break;
        }
    }
    wait_search();
    return 0;
}
