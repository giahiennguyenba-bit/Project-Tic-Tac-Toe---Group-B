#include "board.h"
#include "logic.h"
#include "ui.h"
#include <raylib.h>

// Developer 5 (Eve): Main Integration

int main(void) {
  // 1. Initialize Board (Alice)
  initBoard();

  // 2. Initialize UI (Dave)
  InitUI();

  // Core Loop
  while (!WindowShouldClose()) {

    // Handle Input & State Changes
    if (gameStatus == 0) {
      // Wait for user to take a successful turn
      if (HandleInput()) {
        // Check Win Condition (Bob)
        char lastPiece = (currentPlayer == 1) ? 'X' : 'O';
        if (checkWin(lastRow, lastCol, lastPiece)) {
          gameStatus = 1; // Game Over
        } else {
          // Switch Player
          currentPlayer = (currentPlayer == 1) ? 2 : 1;
        }
      }
    } else {
      // Restart logic
      if (IsKeyPressed(KEY_R)) {
        initBoard();
        gameStatus = 0;
        currentPlayer = 1;
        currentMode = MODE_MOVE;
      }
    }

    // Draw Frame (Dave)
    DrawGame();
  }

  // Cleanup
  CloseUI();

  return 0;
}
