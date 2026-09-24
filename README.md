# Betterfish

A chess engine written from scratch in C++17. It speaks the UCI protocol, so it
works in any chess GUI (Cute Chess, Arena, BanksiaGUI, En Croissant, …) and can
play on Lichess via [lichess-bot](https://github.com/lichess-bot-devs/lichess-bot).

It does **not** beat Stockfish. Stockfish's strength comes from a neural-network
evaluation trained on billions of positions and from over a decade of changes,
each validated by tens of thousands of games on a distributed testing
framework. Betterfish uses the same classical building blocks as Stockfish,
with a hand-written evaluation.

## Building

```sh
make            # builds ./betterfish with -march=native
make test       # perft move-generation suite
make bench      # fixed-depth search benchmark
```

For a portable binary, use `make ARCH=x86-64-v2` (or another `-march` value).

## Features

**Board and move generation**
- Bitboards with magic-bitboard sliding attacks
- Pseudo-legal generation with legality checked on make; verified by perft
  (`betterfish perfttest`)
- Zobrist hashing, repetition and fifty-move detection

**Search**
- Iterative deepening with aspiration windows
- Principal variation search (PVS) with fail-soft alpha-beta
- Lock-free shared transposition table (4-entry buckets, XOR-verified)
- Lazy SMP multithreading (`Threads` option)
- Null-move pruning, reverse futility pruning, razoring
- Late move reductions and late move pruning
- Futility, history and SEE pruning
- Internal iterative reduction, check extensions, mate distance pruning
- Move ordering: TT move, MVV-LVA plus SEE for captures, killers, counter moves,
  butterfly history and continuation history
- Quiescence search with SEE and delta pruning
- Time management based on best-move stability, with pondering support

**Evaluation**
- Tapered middlegame/endgame evaluation using the PeSTO piece-square tables
- Passed, isolated and doubled pawns
- Mobility, bishop pair, rooks on open and semi-open files
- King attack pressure
- Scaling for drawish endgames and insufficient material, and a fade toward a
  draw as the fifty-move counter grows

## UCI options

| Option          | Default | Description                         |
|-----------------|---------|-------------------------------------|
| `Hash`          | 64      | Transposition table size in MB      |
| `Threads`       | 1       | Search threads (Lazy SMP)           |
| `Move Overhead` | 30      | Milliseconds reserved per move      |
| `Ponder`        | false   | Allow `go ponder` / `ponderhit`     |
| `Clear Hash`    | button  | Clear the transposition table       |

## Extra commands

| Command         | Description                                           |
|-----------------|-------------------------------------------------------|
| `d`             | Print the board, FEN and hash key                     |
| `eval`          | Print the static evaluation                           |
| `perft N`       | Count leaf nodes to depth N, split by root move       |
| `perfttest`     | Run the built-in perft suite                          |
| `bench [depth]` | Search a fixed set of positions and report nodes/sec  |

Commands can also be passed on the command line, e.g. `./betterfish bench 13`.

## Testing strength

`tools/match.py` plays a match between two UCI engines and reports an Elo
estimate. It needs `pip install chess`. To play against Stockfish with its
strength limiter:

```sh
python3 tools/match.py ./betterfish stockfish --games 40 --tc 10+0.1 \
    --opp-option UCI_LimitStrength=true --opp-option UCI_Elo=2600
```

Any change to the search or evaluation should be checked this way, ideally
over hundreds of games. A handful of games cannot measure small Elo
differences.

## Credits

The piece-square tables are from Ronald Friederich's PeSTO / RofChade.
