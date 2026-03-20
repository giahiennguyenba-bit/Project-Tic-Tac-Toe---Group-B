#ifndef POWERUPS_H
#define POWERUPS_H

// Power-up inventories
extern int p1_bomb;
extern int p1_steal;
extern int p2_bomb;
extern int p2_steal;

// Triggers a 3x3 explosion at (r, c).
// Removes any pieces in the 3x3 area. Returns 1 if successful, 0 if failed.
int useBomb(int player, int r, int c);

// Attempts to steal an opponent's piece at (r, c).
// Converts it into the player's piece. Returns 1 if successful, 0 if failed.
int useSteal(int player, int r, int c);

#endif // POWERUPS_H
