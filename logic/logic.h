#ifndef LOGIC_H
#define LOGIC_H

// Checks if the given player piece ('X' or 'O') has 5 in a row
// Returns 1 if player p wins, checking only from the last move at (r, c)
int checkWin(int r, int c, char p);

// Checks if placing a piece at row r, col c is valid
// Returns 1 if valid, 0 otherwise
int isValidMove(int r, int c);

#endif // LOGIC_H
