#include "nnue.h"

#include <algorithm>
#include <cstring>
#include <fstream>
#include <vector>

#include "bitboard.h"

#ifdef EVALFILE
// Embed the default network into the binary.
asm(".section .rodata\n"
    ".balign 64\n"
    ".global betterfish_net_data\n"
    "betterfish_net_data:\n"
    ".incbin \"" EVALFILE "\"\n"
    ".global betterfish_net_end\n"
    "betterfish_net_end:\n"
    ".byte 0\n"
    ".previous\n");
extern "C" const unsigned char betterfish_net_data[];
extern "C" const unsigned char betterfish_net_end[];
#endif

namespace NNUE {

Net net;
bool Loaded = false;
bool Enabled = true;

namespace {

constexpr size_t NetBytes = sizeof(int16_t) * (Inputs * HL + HL + 2 * HL + 1);

bool load_bytes(const unsigned char* data, size_t size) {
    if (size < NetBytes) return false;
    const int16_t* p = reinterpret_cast<const int16_t*>(data);
    std::memcpy(net.ftW, p, sizeof(net.ftW));
    p += Inputs * HL;
    std::memcpy(net.ftB, p, sizeof(net.ftB));
    p += HL;
    std::memcpy(net.outW, p, sizeof(net.outW));
    p += 2 * HL;
    net.outB = *p;
    Loaded = true;
    return true;
}

}  // namespace

bool load_embedded() {
#ifdef EVALFILE
    return load_bytes(betterfish_net_data, size_t(betterfish_net_end - betterfish_net_data));
#else
    return false;
#endif
}

bool load_file(const std::string& path) {
    std::ifstream f(path, std::ios::binary);
    if (!f) return false;
    std::vector<unsigned char> buf((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
    return load_bytes(buf.data(), buf.size());
}

void refresh(Accumulator& a, const U64 bb[12]) {
    for (int p = 0; p < 2; ++p) std::memcpy(a.v[p], net.ftB, sizeof(net.ftB));
    for (int piece = 0; piece < 12; ++piece) {
        U64 b = bb[piece];
        while (b) add(a, piece, pop_lsb(b));
    }
}

int evaluate(const Accumulator& a, int stm) {
    const int16_t* us = a.v[stm];
    const int16_t* them = a.v[stm ^ 1];
    int32_t sum = 0;
    for (int i = 0; i < HL; ++i) {
        int32_t v = std::clamp<int32_t>(us[i], 0, QA);
        sum += (v * net.outW[i]) * v;
    }
    for (int i = 0; i < HL; ++i) {
        int32_t v = std::clamp<int32_t>(them[i], 0, QA);
        sum += (v * net.outW[HL + i]) * v;
    }
    return (sum / QA + net.outB) * Scale / (QA * QB);
}

}  // namespace NNUE
