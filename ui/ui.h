#ifndef UI_H
#define UI_H

// UI Modes
typedef enum {
    MODE_MOVE = 0,
    MODE_BOMB,
    MODE_STEAL
} ActionMode;

// Expose these so main.c can read/write them
extern ActionMode currentMode;
extern int currentPlayer; // 1 or 2
extern int gameStatus;    // 0 = playing, 1 = game over, 2 = tie
extern int lastRow, lastCol; // Tracks the most recent move

void InitUI(void);
void CloseUI(void);

// Renders the board, pieces, and side panel
void DrawGame(void);

// Captures mouse clicks for placing pieces or using powerups
// Returns 1 if a piece was successfully placed/action used (changing turn), otherwise 0
int HandleInput(void);

#endif // UI_H
