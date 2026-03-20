#include "board.h"
#include <stdio.h>

// Developer 1 (Alice): Core Grid Management & Gravity Mechanics

char board[ROWS][COLS];
int is_stolen[ROWS][COLS];

void initBoard(void) {
    for (int i = 0; i < ROWS; i++) {
        for (int j = 0; j < COLS; j++) {
            board[i][j] = ' ';
            is_stolen[i][j] = 0;
        }
    }
}

char getCell(int r, int c) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        return board[r][c];
    }
    return ' '; // Out of bounds safety
}

int getStolen(int r, int c) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        return is_stolen[r][c];
    }
    return 0;
}

void setCell(int r, int c, char val) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        board[r][c] = val;
        // If we set to empty, also clear stolen status
        if (val == ' ') {
            is_stolen[r][c] = 0;
        }
    }
}

void setStolen(int r, int c, int val) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        is_stolen[r][c] = val;
    }
}

void applyGravity(void) {
    // Candy-crush like gravity: iterate column by column
    for (int col = 0; col < COLS; col++) {
        // Start from the bottom row
        for (int row = ROWS - 1; row >= 0; row--) {
            // Find an empty spot
            if (board[row][col] == ' ') {
                // Look for the nearest piece above it to fall down
                for (int above = row - 1; above >= 0; above--) {
                    if (board[above][col] != ' ') {
                        // Drop it down
                        board[row][col] = board[above][col];
                        is_stolen[row][col] = is_stolen[above][col];
                        board[above][col] = ' '; // clear old position
                        is_stolen[above][col] = 0;
                        break; // Move to the next spot to fill
                    }
                }
            }
        }
    }
}
