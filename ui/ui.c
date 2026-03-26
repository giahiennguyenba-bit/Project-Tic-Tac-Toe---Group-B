#include "ui.h"
#include "board.h"
#include "logic.h"
#include "powerups.h"
#include <raylib.h>

// Developer 4 (Dave): Raylib Rendering and Input

ActionMode currentMode = MODE_MOVE;
int currentPlayer = 1;
int gameStatus = 0; 

// Textures for pieces
static Texture2D catTex;
static Texture2D dogTex;

// Layout constants
const int CELL_SIZE = 80;
const int OFFSET_X = 50;
const int OFFSET_Y = 50;

void InitUI(void) {
    // 7 cols * 80 + margins, 6 rows * 80 + margins + bottom UI panel
    int screenWidth = (COLS * CELL_SIZE) + (OFFSET_X * 2);
    int screenHeight = (ROWS * CELL_SIZE) + (OFFSET_Y * 2) + 150; 
    
    InitWindow(screenWidth, screenHeight, "Chaos Tic Tac Toe - Raylib Edition");
    SetTargetFPS(60);

    // Load textures
    catTex = LoadTexture("cat.png");
    dogTex = LoadTexture("dog.png");
}

void CloseUI(void) {
    UnloadTexture(catTex);
    UnloadTexture(dogTex);
    CloseWindow();
}

void DrawGame(void) {
    BeginDrawing();
    ClearBackground(RAYWHITE);

    // Draw Board Background
    DrawRectangle(OFFSET_X - 5, OFFSET_Y - 5, (COLS * CELL_SIZE) + 10, (ROWS * CELL_SIZE) + 10, DARKGRAY);

    for (int r = 0; r < ROWS; r++) {
        for (int c = 0; c < COLS; c++) {
            int x = OFFSET_X + c * CELL_SIZE;
            int y = OFFSET_Y + r * CELL_SIZE;
            
            // Draw Cell
            Color cellColor = getStolen(r, c) ? (Color){ 0, 255, 255, 255 } : LIGHTGRAY;
            DrawRectangle(x, y, CELL_SIZE - 2, CELL_SIZE - 2, cellColor);
            
            // Draw Pieces
            char val = getCell(r, c);
            if (val == 'X') {
                // Draw Cat instead of blue circle
                DrawTexturePro(catTex, 
                    (Rectangle){ 0, 0, (float)catTex.width, (float)catTex.height },
                    (Rectangle){ (float)x + 5, (float)y + 5, (float)CELL_SIZE - 10, (float)CELL_SIZE - 10 },
                    (Vector2){ 0, 0 }, 0.0f, WHITE);
            } else if (val == 'O') {
                // Draw Dog instead of red circle
                DrawTexturePro(dogTex, 
                    (Rectangle){ 0, 0, (float)dogTex.width, (float)dogTex.height },
                    (Rectangle){ (float)x + 5, (float)y + 5, (float)CELL_SIZE - 10, (float)CELL_SIZE - 10 },
                    (Vector2){ 0, 0 }, 0.0f, WHITE);
            }
        }
    }

    // Draw UI Panel at the bottom
    int uiY = OFFSET_Y + (ROWS * CELL_SIZE) + 20;
    
    if (gameStatus == 0) {
        DrawText(TextFormat("Player %d's Turn (%s)", currentPlayer, (currentPlayer==1)?"Cat":"Dog"), 50, uiY, 20, BLACK);
        DrawText("Keys: [M] Move  [B] Bomb  [S] Steal", 50, uiY + 30, 20, DARKGRAY);
        
        // Show Inventories
        int b_count = (currentPlayer == 1) ? p1_bomb : p2_bomb;
        int s_count = (currentPlayer == 1) ? p1_steal : p2_steal;
        DrawText(TextFormat("Inventory - Bomb: %d, Steal: %d", b_count, s_count), 50, uiY + 60, 20, DARKGRAY);

        // Show Current Mode
        Color modeColor = BLACK;
        const char* modeText = "MOVE";
        if (currentMode == MODE_BOMB) { modeText = "BOMB"; modeColor = ORANGE; }
        else if (currentMode == MODE_STEAL) { modeText = "STEAL"; modeColor = PURPLE; }
        
        DrawText(TextFormat("ACTION: %s", modeText), 50, uiY + 90, 20, modeColor);
    } else {
        DrawText(TextFormat("PLAYER %d WINS!", currentPlayer), 50, uiY + 40, 40, GREEN);
        DrawText("Press [R] to Restart", 50, uiY + 90, 20, DARKGRAY);
    }

    EndDrawing();
}

int lastRow = -1, lastCol = -1;

int HandleInput(void) {
    if (gameStatus == 1) return 0; // Game over, no input on board

    // Mode Switching
    if (IsKeyPressed(KEY_M)) currentMode = MODE_MOVE;
    if (IsKeyPressed(KEY_B)) currentMode = MODE_BOMB;
    if (IsKeyPressed(KEY_S)) currentMode = MODE_STEAL;

    // Mouse click on grid
    if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT)) {
        Vector2 mousePoint = GetMousePosition();
        
        // Check if inside grid
        if (mousePoint.x >= OFFSET_X && mousePoint.x < OFFSET_X + COLS * CELL_SIZE &&
            mousePoint.y >= OFFSET_Y && mousePoint.y < OFFSET_Y + ROWS * CELL_SIZE) {
            
            int c = (mousePoint.x - OFFSET_X) / CELL_SIZE;
            int r = (mousePoint.y - OFFSET_Y) / CELL_SIZE;
            
            char piece = (currentPlayer == 1) ? 'X' : 'O';

            if (currentMode == MODE_MOVE) {
                if (isValidMove(r, c)) {
                    setCell(r, c, piece);
                    lastRow = r;
                    lastCol = c;
                    return 1; // Turn taken
                }
            } 
            else if (currentMode == MODE_BOMB) {
                if (useBomb(currentPlayer, r, c)) {
                    applyGravity(); // Pieces fall down!
                    currentMode = MODE_MOVE; // revert mode
                    lastRow = -1; // Reset since gravity moved pieces
                    lastCol = -1;
                    return 1;
                }
            } 
            else if (currentMode == MODE_STEAL) {
                if (useSteal(currentPlayer, r, c)) {
                    currentMode = MODE_MOVE;
                    lastRow = r; 
                    lastCol = c;
                    return 1;
                }
            }
        }
    }
    
    return 0; // Turn not taken
}
