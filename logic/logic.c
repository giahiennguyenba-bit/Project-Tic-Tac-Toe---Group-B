#include "logic.h"
#include "board.h"

// Developer 2 (Bob): Core Game Rules and Win Conditions

int checkWin(int r, int c, char p) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 0;

    // 1. Horizontal Check (Full Row r)
    int count = 0;
    for (int j = 0; j < COLS; j++) {
        if (board[r][j] == p) {
            if (++count >= 5) return 1;
        } else count = 0;
    }

    // 2. Vertical Check (Full Column c)
    count = 0;
    for (int i = 0; i < ROWS; i++) {
        if (board[i][c] == p) {
            if (++count >= 5) return 1;
        } else count = 0;
    }

    // 3. Diagonal Check (Top-Left to Bottom-Right)
    // Find the starting point of the diagonal passing through (r, c)
    count = 0;
    int startR = r, startC = c;
    while (startR > 0 && startC > 0) { startR--; startC--; }
    while (startR < ROWS && startC < COLS) {
        if (board[startR][startC] == p) {
            if (++count >= 5) return 1;
        } else count = 0;
        startR++; startC++;
    }

    // 4. Diagonal Check (Bottom-Left to Top-Right)
    count = 0;
    startR = r; startC = c;
    while (startR < ROWS - 1 && startC > 0) { startR++; startC--; }
    while (startR >= 0 && startC < COLS) {
        if (board[startR][startC] == p) {
            if (++count >= 5) return 1;
        } else count = 0;
        startR--; startC++;
    }

    return 0;
}

int isValidMove(int r, int c) {
    // A move is valid if the spot is entirely empty
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        if (board[r][c] == ' ') {
            return 1;
        }
    }
    return 0;
}
