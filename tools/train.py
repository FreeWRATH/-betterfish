#!/usr/bin/env python3
"""Train Betterfish's NNUE from `datagen` output.

    python3 tools/train.py data/*.txt --out nets/default.nnue --epochs 40

Architecture (must match src/nnue.h):
    768 inputs -> HL (shared weights, one accumulator per perspective)
    concat(side to move, other side) -> SCReLU -> 1 output

Input lines: "<fen> | <cp score, White's view> | <result for White>".
Requires numpy and torch.
"""

import argparse
import os
import struct
import time

import numpy as np
import torch
import torch.nn as nn

HL = 256
QA = 255
QB = 64
SCALE = 400
PAD = 768
MAX_PIECES = 32
PIECES = "PNBRQKpnbrqk"


def parse_line(line):
    fen, score, result = line.split("|")
    parts = fen.split()
    stm = 0 if parts[1] == "w" else 1
    white, black = [], []
    sq = 56
    for ch in parts[0]:
        if ch == "/":
            sq -= 16
        elif ch.isdigit():
            sq += int(ch)
        else:
            p = PIECES.index(ch)
            color, pt = p // 6, p % 6
            white.append((color * 6 + pt) * 64 + sq)
            black.append(((color ^ 1) * 6 + pt) * 64 + (sq ^ 56))
            sq += 1
    score = int(score)
    result = float(result)
    if stm == 1:
        score, result = -score, 1.0 - result
        white, black = black, white
    return white, black, score, result


def load(paths, cache):
    if cache and os.path.exists(cache):
        d = np.load(cache)
        return d["us"], d["them"], d["score"], d["result"]
    us, them, scores, results = [], [], [], []
    for path in paths:
        with open(path) as f:
            for line in f:
                if line.count("|") != 2:
                    continue
                a, b, s, r = parse_line(line)
                us.append(a + [PAD] * (MAX_PIECES - len(a)))
                them.append(b + [PAD] * (MAX_PIECES - len(b)))
                scores.append(s)
                results.append(r)
    us = np.array(us, dtype=np.int16)
    them = np.array(them, dtype=np.int16)
    scores = np.array(scores, dtype=np.float32)
    results = np.array(results, dtype=np.float32)
    if cache:
        np.savez(cache, us=us, them=them, score=scores, result=results)
    return us, them, scores, results


class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.ft = nn.EmbeddingBag(PAD + 1, HL, mode="sum", padding_idx=PAD)
        self.ft_bias = nn.Parameter(torch.zeros(HL))
        self.out = nn.Linear(2 * HL, 1)
        nn.init.normal_(self.ft.weight, std=0.1)
        with torch.no_grad():
            self.ft.weight[PAD].zero_()

    def forward(self, us, them):
        a = torch.clamp(self.ft(us) + self.ft_bias, 0, 1) ** 2
        b = torch.clamp(self.ft(them) + self.ft_bias, 0, 1) ** 2
        return self.out(torch.cat([a, b], dim=1)).squeeze(1)

    def clip(self):
        limit = 127 / QB
        with torch.no_grad():
            self.ft.weight.clamp_(-1.98, 1.98)
            self.out.weight.clamp_(-limit, limit)


def export(net, path):
    ftw = net.ft.weight.detach()[:PAD].numpy()  # [768, HL]
    ftb = net.ft_bias.detach().numpy()
    ow = net.out.weight.detach().numpy().reshape(-1)
    ob = float(net.out.bias.detach()[0])
    q = lambda x, s: np.clip(np.round(x * s), -32768, 32767).astype("<i2")
    with open(path, "wb") as f:
        f.write(q(ftw, QA).tobytes())
        f.write(q(ftb, QA).tobytes())
        f.write(q(ow, QB).tobytes())
        f.write(struct.pack("<h", int(np.clip(round(ob * QA * QB), -32768, 32767))))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("data", nargs="+")
    p.add_argument("--out", default="nets/default.nnue")
    p.add_argument("--cache", help="npz cache of the parsed data")
    p.add_argument("--epochs", type=int, default=40)
    p.add_argument("--batch", type=int, default=16384)
    p.add_argument("--lr", type=float, default=1e-3)
    p.add_argument("--wdl", type=float, default=0.3, help="weight of game result vs. search score")
    p.add_argument("--threads", type=int, default=os.cpu_count())
    args = p.parse_args()

    torch.set_num_threads(args.threads)
    torch.manual_seed(0)

    t0 = time.time()
    us, them, score, result = load(args.data, args.cache)
    n = len(score)
    print(f"loaded {n} positions in {time.time() - t0:.0f}s", flush=True)

    us = torch.from_numpy(us.astype(np.int64))
    them = torch.from_numpy(them.astype(np.int64))
    target = (1 - args.wdl) * torch.sigmoid(torch.from_numpy(score) / 400) + args.wdl * torch.from_numpy(result)

    perm = torch.randperm(n)
    nval = min(n // 50, 100000)
    val_idx, train_idx = perm[:nval], perm[nval:]

    net = Net()
    opt = torch.optim.Adam(net.parameters(), lr=args.lr)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=args.epochs, eta_min=args.lr * 0.02)

    def loss_on(idx):
        pred = torch.sigmoid(net(us[idx], them[idx]) * SCALE / 400)
        return torch.mean((pred - target[idx]) ** 2)

    for epoch in range(args.epochs):
        net.train()
        t1 = time.time()
        order = train_idx[torch.randperm(len(train_idx))]
        total = 0.0
        batches = 0
        for i in range(0, len(order), args.batch):
            idx = order[i:i + args.batch]
            opt.zero_grad()
            loss = loss_on(idx)
            loss.backward()
            opt.step()
            net.clip()
            total += loss.item()
            batches += 1
        sched.step()
        net.eval()
        with torch.no_grad():
            val = loss_on(val_idx).item()
        print(f"epoch {epoch + 1}/{args.epochs}  train {total / batches:.6f}  val {val:.6f}  "
              f"lr {sched.get_last_lr()[0]:.2e}  {time.time() - t1:.0f}s", flush=True)
        export(net, args.out)

    print(f"saved {args.out}")


if __name__ == "__main__":
    main()
