EXE      ?= betterfish
CXX      ?= g++
ARCH     ?= native
CXXFLAGS ?= -O3 -std=c++17 -Wall -Wextra -march=$(ARCH) -flto -DNDEBUG
LDFLAGS  ?= -pthread -flto

SRCS := $(wildcard src/*.cpp)
OBJS := $(SRCS:.cpp=.o)

.PHONY: all clean test bench

all: $(EXE)

$(EXE): $(OBJS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)

src/%.o: src/%.cpp src/*.h
	$(CXX) $(CXXFLAGS) -c -o $@ $<

test: $(EXE)
	./$(EXE) perfttest

bench: $(EXE)
	./$(EXE) bench

clean:
	rm -f $(EXE) $(OBJS)
