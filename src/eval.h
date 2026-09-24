#pragma once

#include "position.h"

void init_eval();

// Static evaluation in centipawns from the side to move's point of view.
int evaluate(const Position& pos);

// Hand-crafted evaluation only (ignores NNUE).
int evaluate_hce(const Position& pos);
