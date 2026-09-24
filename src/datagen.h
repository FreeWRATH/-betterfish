#pragma once

#include <cstdint>
#include <string>

// Plays `games` self-play games at `nodes` per move and appends training
// positions to `path`.
void datagen(int games, uint64_t nodes, const std::string& path, uint64_t seed);
