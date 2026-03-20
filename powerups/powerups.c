#include "powerups.h"
#include "board.h"

// Developer 3 (Charlie): Power-ups and Abilities

// Initialize inventories (1 = available, 0 = used)
int p1_bomb = 1, p1_steal = 1;
int p2_bomb = 1, p2_steal = 1;

int useBomb(int player, int r, int c) {
    int* current_bomb = (player == 1) ? &p1_bomb : &p2_bomb;
    
    // Check if player has bomb
    if (*current_bomb == 0) return 0;

    // Check bounds roughly for the center
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 0;

    // Explode a 3x3 area starting around (r, c)
    for (int i = r - 1; i <= r + 1; i++) {
        for (int j = c - 1; j <= c + 1; j++) {
            if (i >= 0 && i < ROWS && j >= 0 && j < COLS) {
                // Remove everything, creating empty space for gravity
                board[i][j] = ' ';
            }
        }
    }

    // Spend bomb
    *current_bomb = 0;
    return 1;
}

int useSteal(int player, int r, int c) {
    int* current_steal = (player == 1) ? &p1_steal : &p2_steal;

    // Check if player has steal
    if (*current_steal == 0) return 0;

    // Bounds check
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return 0;

    char opponentPiece = (player == 1) ? 'O' : 'X';
    
    // Only steal if it's actually the opponent's piece AND not already stolen
    if (board[r][c] == opponentPiece && getStolen(r, c) == 0) {
        board[r][c] = (player == 1) ? 'X' : 'O';
        setStolen(r, c, 1);  // Mark as stolen
        *current_steal = 0; // Spend steal
        return 1; 
    }

    return 0; // Target wasn't opponent piece
}
