#ifndef BOARD_H
#define BOARD_H

#define ROWS 6
#define COLS 7

// Global grid
extern char board[ROWS][COLS];
extern int is_stolen[ROWS][COLS]; // Tracks if a cell has been stolen

// Initializes the 6x7 board with empty spaces
void initBoard(void);

// Retrieves the value at row r, col c
char getCell(int r, int c);
int getStolen(int r, int c);

// Sets the value at row r, col c
void setCell(int r, int c, char val);
void setStolen(int r, int c, int val);

// Applies candy-crush style gravity to the board
// Any empty spots (' ') will be filled by non-empty pieces falling from above
void applyGravity(void);

#endif // BOARD_H
