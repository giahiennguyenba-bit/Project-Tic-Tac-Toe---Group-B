#include "logic.h"
#include "board.h"

// Developer 2 (Bob): Core Game Rules and Win Conditions

int checkWin(char p) {
    // 1. Horizontal Check (5 in a row)
    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c <= COLS - 5; c++) {
            if (board[r][c] == p && board[r][c+1] == p && 
                board[r][c+2] == p && board[r][c+3] == p && board[r][c+4] == p) {
                return 1;
            }
        }
    }

    // 2. Vertical Check (5 in a row)
    for (int c = 0; c < COLS; c++) {
        for (int r = 0; r <= ROWS - 5; r++) {
            if (board[r][c] == p && board[r+1][c] == p && 
                board[r+2][c] == p && board[r+3][c] == p && board[r+4][c] == p) {
                return 1;
            }
        }
    }

    // 3. Diagonal Check (Top-Left to Bottom-Right)
    for (int r = 0; r <= ROWS - 5; r++) {
        for (int c = 0; c <= COLS - 5; c++) {
            if (board[r][c] == p && board[r+1][c+1] == p && 
                board[r+2][c+2] == p && board[r+3][c+3] == p && board[r+4][c+4] == p) {
                return 1;
            }
        }
    }

    // 4. Diagonal Check (Bottom-Left to Top-Right)
    for (int r = 4; r < ROWS; r++) {
        for (int c = 0; c <= COLS - 5; c++) {
            if (board[r][c] == p && board[r-1][c+1] == p && 
                board[r-2][c+2] == p && board[r-3][c+3] == p && board[r-4][c+4] == p) {
                return 1;
            }
        }
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
