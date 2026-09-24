#!/usr/bin/env python3
"""Relabel `datagen` positions with another UCI engine's evaluation.

    python3 tools/relabel.py in.txt out.txt --engine stockfish --depth 9

Each input line is "<fen> | <score> | <result>". The score is replaced by the
engine's evaluation at the given depth (White's point of view); the game
result is kept. Positions the engine scores as mate are dropped. Work is
spread over one engine process per CPU core. Needs only the standard library.
"""

import argparse
import multiprocessing as mp
import os
import subprocess
import sys
import time


def label_chunk(args):
    engine, depth, hash_mb, lines = args
    p = subprocess.Popen([engine], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, bufsize=1)

    def send(cmd):
        p.stdin.write(cmd + "\n")
        p.stdin.flush()

    send("uci")
    send(f"setoption name Hash value {hash_mb}")
    send("setoption name Threads value 1")
    send("isready")
    while p.stdout.readline().strip() != "readyok":
        pass

    out = []
    for line in lines:
        parts = line.split("|")
        if len(parts) != 3:
            continue
        fen, result = parts[0].strip(), parts[2].strip()
        send(f"position fen {fen}")
        send(f"go depth {depth}")
        score = None
        while True:
            l = p.stdout.readline()
            if not l:
                break
            if l.startswith("bestmove"):
                break
            if l.startswith("info") and " score " in l and "bound" not in l:
                tok = l.split()
                i = tok.index("score")
                # Keep the last reported score; a mate score drops the position.
                score = int(tok[i + 2]) if tok[i + 1] == "cp" else None
        if score is None:
            continue
        if " b " in fen:
            score = -score
        out.append(f"{fen} | {score} | {result}\n")
    send("quit")
    p.wait()
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--engine", default="stockfish")
    ap.add_argument("--depth", type=int, default=9)
    ap.add_argument("--hash", type=int, default=16)
    ap.add_argument("--procs", type=int, default=os.cpu_count())
    ap.add_argument("--chunk", type=int, default=2000)
    args = ap.parse_args()

    with open(args.input) as f:
        lines = [l for l in f if l.count("|") == 2]
    chunks = [lines[i:i + args.chunk] for i in range(0, len(lines), args.chunk)]
    t0 = time.time()
    done = 0
    with open(args.output, "w") as out, mp.Pool(args.procs) as pool:
        jobs = ((args.engine, args.depth, args.hash, c) for c in chunks)
        for res in pool.imap(label_chunk, jobs):
            out.writelines(res)
            done += 1
            if done % 10 == 0 or done == len(chunks):
                rate = done * args.chunk / max(time.time() - t0, 1e-9)
                print(f"{done}/{len(chunks)} chunks, {rate:.0f} pos/s", file=sys.stderr, flush=True)


if __name__ == "__main__":
    main()
