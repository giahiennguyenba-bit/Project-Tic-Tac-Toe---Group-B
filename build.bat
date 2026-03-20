@echo off
echo Compiling 5-Developer Chaos Tic Tac Toe with GCC and Raylib...

:: Make sure gcc is in your PATH and Raylib dev binaries are available.
:: If you haven't installed Raylib via MSYS2 or another method, this might fail.
:: Use `gcc main.c board/board.c logic/logic.c powerups/powerups.c ui/ui.c -o game.exe ...`

gcc main.c board/board.c logic/logic.c powerups/powerups.c ui/ui.c -o game.exe -Wall -std=c99 -I board -I logic -I powerups -I ui -lraylib -lgdi32 -lwinmm

if %errorlevel% neq 0 (
    echo Compilation Failed! Ensure Raylib is installed.
    pause
    exit /b %errorlevel%
)

echo Compilation Successful! Running game...
game.exe
pause
