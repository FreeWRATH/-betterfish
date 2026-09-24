#!/usr/bin/env python3
"""Play a match between two UCI engines and estimate the Elo difference.

Example (vs. Stockfish limited to 2000 Elo, 10s + 0.1s per game):

    python3 tools/match.py ./betterfish /usr/games/stockfish \
        --games 40 --tc 10+0.1 --opp-option UCI_LimitStrength=true \
        --opp-option UCI_Elo=2000

Requires python-chess (`pip install chess`).
"""

import argparse
import concurrent.futures
import math
import random
import time

import chess
import chess.engine

OPENINGS = [
    "e2e4 e7e5 g1f3 b8c6 f1b5",
    "e2e4 e7e5 g1f3 b8c6 f1c4",
    "e2e4 c7c5 g1f3 d7d6 d2d4",
    "e2e4 c7c5 b1c3 b8c6 g2g3",
    "e2e4 e7e6 d2d4 d7d5 b1c3",
    "e2e4 c7c6 d2d4 d7d5 e4e5",
    "e2e4 d7d5 e4d5 d8d5 b1c3",
    "d2d4 d7d5 c2c4 e7e6 b1c3",
    "d2d4 d7d5 c2c4 c7c6 g1f3",
    "d2d4 g8f6 c2c4 g7g6 b1c3",
    "d2d4 g8f6 c2c4 e7e6 g1f3 b7b6",
    "d2d4 f7f5 g2g3 g8f6 f1g2",
    "c2c4 e7e5 b1c3 g8f6 g2g3",
    "g1f3 d7d5 g2g3 g8f6 f1g2",
    "e2e4 g7g6 d2d4 f8g7 b1c3",
    "d2d4 g8f6 g1f3 e7e6 c1g5",
]


def parse_options(opts):
    out = {}
    for o in opts or []:
        k, v = o.split("=", 1)
        if v.lower() in ("true", "false"):
            out[k] = v.lower() == "true"
        else:
            try:
                out[k] = int(v)
            except ValueError:
                out[k] = v
    return out


def play_game(args, opening, engine_white):
    """Returns score from the first engine's perspective (1, 0.5, 0)."""
    base, inc = (float(x) for x in args.tc.split("+"))
    e1 = chess.engine.SimpleEngine.popen_uci(args.engine)
    e2 = chess.engine.SimpleEngine.popen_uci(args.opponent)
    try:
        e1.configure(parse_options(args.option))
        e2.configure(parse_options(args.opp_option))
        board = chess.Board()
        for uci in opening.split():
            board.push_uci(uci)
        clocks = {chess.WHITE: base, chess.BLACK: base}
        players = {chess.WHITE: e1 if engine_white else e2, chess.BLACK: e2 if engine_white else e1}
        winner = None
        while not board.is_game_over(claim_draw=True):
            limit = chess.engine.Limit(
                white_clock=clocks[chess.WHITE], black_clock=clocks[chess.BLACK], white_inc=inc, black_inc=inc
            )
            side = board.turn
            t0 = time.monotonic()
            result = players[side].play(board, limit)
            clocks[side] -= time.monotonic() - t0
            if clocks[side] < 0:
                winner = not side  # lost on time
                print(f"  time forfeit by {'white' if side else 'black'}", flush=True)
                break
            clocks[side] += inc
            board.push(result.move)
        if winner is None:
            outcome = board.outcome(claim_draw=True)
            winner = outcome.winner
    finally:
        e1.quit()
        e2.quit()
    if winner is None:
        return 0.5, board
    return (1.0 if winner == (chess.WHITE if engine_white else chess.BLACK) else 0.0), board


RESULT_NAMES = {1.0: "win", 0.5: "draw", 0.0: "loss"}


def elo(score):
    score = min(max(score, 1e-3), 1 - 1e-3)
    return -400 * math.log10(1 / score - 1)


def elo_error(w, d, l):
    """95% confidence half-width of the Elo estimate (trinomial model)."""
    n = w + d + l
    s = (w + 0.5 * d) / n
    var = (w * (1 - s) ** 2 + d * (0.5 - s) ** 2 + l * s ** 2) / n
    margin = 1.96 * math.sqrt(var / n)
    return (elo(min(s + margin, 0.999)) - elo(max(s - margin, 0.001))) / 2


def load_openings(path):
    if path:
        with open(path) as f:
            return [line.strip() for line in f if line.strip()]
    return OPENINGS


def main():
    p = argparse.ArgumentParser()
    p.add_argument("engine")
    p.add_argument("opponent")
    p.add_argument("--games", type=int, default=20)
    p.add_argument("--tc", default="10+0.1", help="seconds+increment")
    p.add_argument("--concurrency", type=int, default=2)
    p.add_argument("--option", action="append", help="Name=value for the first engine")
    p.add_argument("--opp-option", action="append", help="Name=value for the opponent")
    p.add_argument("--openings", help="file with one opening (UCI moves) per line; "
                   "each is played twice with colors reversed")
    p.add_argument("--seed", type=int, default=1)
    args = p.parse_args()

    openings = load_openings(args.openings)
    random.Random(args.seed).shuffle(openings)
    jobs = []
    for i in range(args.games):
        opening = openings[(i // 2) % len(openings)]
        jobs.append((opening, i % 2 == 0))

    w = d = l = 0
    with concurrent.futures.ThreadPoolExecutor(args.concurrency) as ex:
        futures = [ex.submit(play_game, args, o, white) for o, white in jobs]
        for f in concurrent.futures.as_completed(futures):
            s, board = f.result()
            if s == 1:
                w += 1
            elif s == 0:
                l += 1
            else:
                d += 1
            n = w + d + l
            sc = (w + 0.5 * d) / n
            print(f"Game {n}/{args.games}: {RESULT_NAMES[s]:5} ({len(board.move_stack)} plies)  "
                  f"+{w} ={d} -{l}  score {sc:.3f}  elo {elo(sc):+.0f} +/- {elo_error(w, d, l):.0f}", flush=True)


if __name__ == "__main__":
    main()
