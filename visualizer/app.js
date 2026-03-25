/* =============================================
   Chaos Tic Tac Toe — Win Condition Visualizer
   app.js v3 — Streak scanning + OOB scenarios
   ============================================= */

const ROWS = 6, COLS = 7, WIN_LEN = 5;

// ─── State ───
let board = [], traceSteps = [], currentStep = -1, activeTab = 'logic_c';
let autoPlayTimer = null, isPlaying = false;
let visitedCells = new Set();

// ─── DOM refs ───
const $ = id => document.getElementById(id);
const gridEl = $('grid'), codeDisplay = $('code-display');
const pivotText = $('pivot-text'), stepCounter = $('step-counter');
const progressFill = $('progress-fill'), boardSubtitle = $('board-subtitle');
const speedSlider = $('speed-slider'), speedValue = $('speed-value');
const ghostCol = $('ghost-col'), ghostRow = $('ghost-row');
const btnPlay = $('btn-play');
const crashCard = $('crash-info-card');

// ─── Source Code ───
const SOURCE = {
    main: `#include "board.h"\n#include "logic.h"\n#include "ui.h"\n#include <raylib.h>\n\nint main(void) {\n    initBoard();\n    InitUI();\n\n    while (!WindowShouldClose()) {\n        if (gameStatus == 0) {\n            if (HandleInput()) {\n                char lastPiece = (currentPlayer == 1) ? 'X' : 'O';\n                if (checkWin(lastPiece)) {\n                    gameStatus = 1;\n                }\n            }\n        }\n        DrawGame();\n    }\n    CloseUI();\n    return 0;\n}`.split('\n'),

    logic_h: `#ifndef LOGIC_H\n#define LOGIC_H\n\n// Checks if the given player piece\n// ('X' or 'O') has 5 in a row\n// Returns 1 if true, 0 otherwise\nint checkWin(char p);\n\nint isValidMove(int r, int c);\n\n#endif // LOGIC_H`.split('\n'),

    logic_c: `#include "logic.h"\n#include "board.h"\n\nint checkWin(char p) {\n    // 1. Horizontal Check (5 in a row)\n    for (int r = 0; r < ROWS; r++) {\n        for (int c = 0; c <= COLS - 5; c++) {\n            if (board[r][c] == p && board[r][c+1] == p &&\n                board[r][c+2] == p && board[r][c+3] == p && board[r][c+4] == p) {\n                return 1;\n            }\n        }\n    }\n\n    // 2. Vertical Check (5 in a row)\n    for (int c = 0; c < COLS; c++) {\n        for (int r = 0; r <= ROWS - 5; r++) {\n            if (board[r][c] == p && board[r+1][c] == p &&\n                board[r+2][c] == p && board[r+3][c] == p && board[r+4][c] == p) {\n                return 1;\n            }\n        }\n    }\n\n    // 3. Diagonal Check (Top-Left to Bottom-Right)\n    for (int r = 0; r <= ROWS - 5; r++) {\n        for (int c = 0; c <= COLS - 5; c++) {\n            if (board[r][c] == p && board[r+1][c+1] == p &&\n                board[r+2][c+2] == p && board[r+3][c+3] == p && board[r+4][c+4] == p) {\n                return 1;\n            }\n        }\n    }\n\n    // 4. Diagonal Check (Bottom-Left to Top-Right)\n    for (int r = 4; r < ROWS; r++) {\n        for (int c = 0; c <= COLS - 5; c++) {\n            if (board[r][c] == p && board[r-1][c+1] == p &&\n                board[r-2][c+2] == p && board[r-3][c+3] == p && board[r-4][c+4] == p) {\n                return 1;\n            }\n        }\n    }\n\n    return 0;\n}`.split('\n'),
};

// ─── Scenarios ───
const SCENARIOS = {
    horiz: { name:'Horizontal Win', desc:'5 Cats in a row — Row 3', pieces:[[3,1,'X'],[3,2,'X'],[3,3,'X'],[3,4,'X'],[3,5,'X'],[4,1,'O'],[4,2,'O'],[5,0,'O'],[5,1,'X'],[5,2,'O'],[5,3,'X'],[5,4,'O'],[5,5,'X'],[4,3,'O']] },
    vert: { name:'Vertical Win', desc:'5 Cats in column — Col 2', pieces:[[1,2,'X'],[2,2,'X'],[3,2,'X'],[4,2,'X'],[5,2,'X'],[5,0,'O'],[5,1,'O'],[4,0,'O'],[4,1,'O'],[3,0,'O'],[5,3,'O'],[5,4,'X']] },
    'diag-down': { name:'Diagonal (\\) Win', desc:'5 Cats diagonal ↘', pieces:[[0,1,'X'],[1,2,'X'],[2,3,'X'],[3,4,'X'],[4,5,'X'],[5,0,'O'],[5,1,'O'],[5,2,'O'],[5,3,'O'],[4,0,'O'],[4,1,'X'],[3,0,'O'],[5,4,'X'],[5,5,'O']] },
    'diag-up': { name:'Diagonal (/) Win', desc:'5 Cats diagonal ↗', pieces:[[5,0,'X'],[4,1,'X'],[3,2,'X'],[2,3,'X'],[1,4,'X'],[5,1,'O'],[5,2,'O'],[5,3,'O'],[5,4,'O'],[4,0,'O'],[4,2,'O'],[5,5,'X'],[5,6,'O']] },
    draw: { name:'Draw', desc:'Full board — no 5-in-a-row', pieces: (() => {
        const p=[], pat=[['X','O','X','O','X','O','X'],['X','O','X','O','X','O','X'],['O','X','O','X','O','X','O'],['O','X','O','X','O','X','O'],['X','O','X','O','X','O','X'],['X','O','X','O','X','O','X']];
        for(let r=0;r<6;r++) for(let c=0;c<7;c++) p.push([r,c,pat[r][c]]);
        return p;
    })() },
};

// ─── OOB crash info database ───
const CRASH_INFO = {
    'horiz-oob': {
        title: '① Horizontal Out-of-Bounds (Column Overflow)',
        what: `Bug: for(c = 0; c < COLS; c++)\n\nWhen c=3, checking c+4=7 overflows!\nboard[r][7] reads memory PAST the array.\nCOLS=7, valid indices: 0-6.\n\n→ Reads garbage from adjacent memory\n→ May crash (segfault) or return wrong result`,
        fix: `Correct: for(c = 0; c <= COLS - 5; c++)\n\nThis ensures c+4 never exceeds COLS-1.\nMax c = 7-5 = 2, so c+4 = 6 ✓\n\nThe bound COLS-5 guarantees all 5 cells\n(c, c+1, c+2, c+3, c+4) stay in range.`
    },
    'vert-oob': {
        title: '② Vertical Out-of-Bounds (Row Overflow)',
        what: `Bug: for(r = 0; r < ROWS; r++)\n\nWhen r=2, checking r+4=6 overflows!\nboard[6][c] is past the last row (ROWS=6).\nValid row indices: 0-5.\n\n→ Reads stack/heap memory after the array\n→ Undefined behavior in C`,
        fix: `Correct: for(r = 0; r <= ROWS - 5; r++)\n\nMax r = 6-5 = 1, so r+4 = 5 ✓\n\nThe loop stops early enough that r+4\nnever reaches ROWS. All 5 cells checked\n(r, r+1, r+2, r+3, r+4) stay valid.`
    },
    'diag-oob': {
        title: '③ Diagonal Out-of-Bounds (Double Overflow)',
        what: `Bug: for(r=0; r<ROWS; r++)\n     for(c=0; c<COLS; c++)\n\nDiagonal ↘ adds to BOTH r and c.\nAt r=3, c=4: checking r+4=7, c+4=8\nBOTH exceed their bounds!\n\n→ Double out-of-bounds: row AND column\n→ Accesses completely random memory`,
        fix: `Correct: for(r=0; r<=ROWS-5; r++)\n         for(c=0; c<=COLS-5; c++)\n\nBoth r and c are bounded so that\nr+4 <= ROWS-1 and c+4 <= COLS-1.\nMax r=1, max c=2 → r+4=5, c+4=6 ✓`
    },
    'neg-index': {
        title: '④ Negative Index (Row Underflow)',
        what: `Bug: for(r = 0; r < ROWS; r++)\n(for diagonal ↗ check)\n\nDiagonal ↗ subtracts from r: r-1, r-2...\nIf r=2: r-4 = -2 → NEGATIVE INDEX!\nboard[-2][c] accesses memory BEFORE array.\n\n→ Reads memory before the board array\n→ Segfault or data corruption`,
        fix: `Correct: for(r = 4; r < ROWS; r++)\n\nStarting r at 4 ensures r-4 = 0 (minimum).\nSo r-k is always >= 0 for k=0..4.\n\nThe minimum starting row equals WIN_LEN-1\nto guarantee all upward checks stay valid.`
    },
    'uninit': {
        title: '⑤ Uninitialized Board Access',
        what: `Bug: Calling checkWin() before initBoard()\n\nIf board[][] is not initialized, every cell\ncontains GARBAGE values (whatever was in\nmemory before).\n\nboard[r][c] might equal 'X' by coincidence!\n→ False positive: reports a "win" that\n  never happened\n→ Game logic completely breaks`,
        fix: `The code calls initBoard() in main()\nBEFORE any game logic runs.\n\ninitBoard() sets every cell to ' ' (space),\nensuring a clean starting state.\n\nvoid initBoard() {\n  for(r=0;r<ROWS;r++)\n    for(c=0;c<COLS;c++)\n      board[r][c] = ' ';\n}`
    }
};

// =============================================
//   Board
// =============================================
function resetBoard() { board=[]; for(let r=0;r<ROWS;r++) board.push(new Array(COLS).fill(' ')); }
function loadScenario(name) {
    resetBoard();
    const sc=SCENARIOS[name]; if(!sc) return;
    sc.pieces.forEach(([r,c,v])=>{ if(r>=0&&r<ROWS&&c>=0&&c<COLS) board[r][c]=v; });
    boardSubtitle.textContent = sc.desc;
}

// =============================================
//   Grid
// =============================================
function buildGrid() {
    gridEl.innerHTML='';
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
        const cell=document.createElement('div');
        cell.className='cell'; cell.id=`cell-${r}-${c}`;
        cell.innerHTML=`<span class="cell-index">[${r}][${c}]</span><span class="cell-piece" id="piece-${r}-${c}"></span>`;
        gridEl.appendChild(cell);
    }
}

function renderBoard() {
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
        const cell=$(`cell-${r}-${c}`), piece=$(`piece-${r}-${c}`);
        cell.className='cell';
        if(board[r][c]==='X'){piece.textContent='🐱';cell.classList.add('cell-cat');}
        else if(board[r][c]==='O'){piece.textContent='🐶';cell.classList.add('cell-dog');}
        else piece.textContent='';
    }
}

function clearAllHighlights() {
    document.querySelectorAll('.cell').forEach(c=>{
        c.classList.remove('cell-highlight-scan','cell-highlight-match','cell-highlight-error','cell-highlight-check','cell-pulse','cell-visited','cell-oob-error','cell-streak','cell-streak-break');
    });
    ghostCol.classList.remove('visible'); ghostCol.innerHTML='';
    ghostRow.classList.remove('visible'); ghostRow.innerHTML='';
    visitedCells.clear();
    crashCard.style.display='none';
}

function highlightCell(r,c,cls) {
    const cell=$(`cell-${r}-${c}`);
    if(!cell)return;
    cell.classList.add(cls);
    cell.classList.remove('cell-pulse'); void cell.offsetWidth; cell.classList.add('cell-pulse');
}

// =============================================
//   Code Display
// =============================================
function renderCode(tab,highlightLine,hlCls) {
    const lines=SOURCE[tab]; if(!lines) return;
    let html='';
    lines.forEach((text,i)=>{
        const ln=i+1; let cls='code-line';
        if(highlightLine===ln) cls+=` ${hlCls||'highlight-exec'}`;
        html+=`<span class="${cls}"><span class="line-num">${ln}</span>${syntaxHL(escHtml(text))}</span>\n`;
    });
    codeDisplay.innerHTML=html;
    const hl=document.querySelector('.code-line.highlight-exec,.code-line.highlight-match,.code-line.highlight-error');
    if(hl) hl.scrollIntoView({block:'center',behavior:'smooth'});
}

function syntaxHL(t) {
    return t.replace(/\b(int|char|void|for|if|return|extern|const)\b/g,'<span class="kw">$1</span>')
        .replace(/\b(checkWin|isValidMove|initBoard|HandleInput|DrawGame|CloseUI|InitUI|WindowShouldClose)\b/g,'<span class="fn">$1</span>')
        .replace(/\b(ROWS|COLS)\b/g,'<span class="type">$1</span>')
        .replace(/\b(\d+)\b/g,'<span class="num">$1</span>')
        .replace(/(\/\/.*)/g,'<span class="cmt">$1</span>')
        .replace(/(&amp;&amp;|==|!=|&lt;=|&gt;=|&lt;|&gt;)/g,'<span class="op">$1</span>');
}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// =============================================
//   Trace Step Builder
// =============================================
function addStep(steps,line,cells,cls,desc,pivot,extra={}) {
    steps.push({tab:'logic_c',line,cells,cls,desc,pivot,...extra});
}

// =============================================
//   Win Trace — Streak-Based Scanning
//   Green glow builds on matching pieces,
//   clears when a different piece is found.
// =============================================
function generateWinTrace(player) {
    const p=player, S=[];
    addStep(S,4,[],'highlight-exec',`checkWin('${p}') called`,`Checking if '${p}' has 5 in a row`);

    // --- Horizontal ---
    addStep(S,5,[],'highlight-exec','→ Horizontal Check','Starting horizontal scan...');
    for(let r=0;r<ROWS;r++) {
        let streak=[];
        for(let c=0;c<=COLS-WIN_LEN;c++) {
            let allMatch=true;
            streak=[];
            for(let k=0;k<WIN_LEN;k++) {
                const cc=c+k, val=board[r][cc], match=(val===p);
                streak.push([r,cc]);
                if(match) {
                    addStep(S,8,[[r,cc]],'highlight-exec',
                        `[${r}][${cc}] = '${val}' == '${p}'? ✓ YES`,
                        `Anchor [${r}][${c}] → cell ${k+1}/5: ✓ MATCH`,
                        {scanHighlight:[r,cc], streakCells:[...streak], streakPlayer:p});
                } else {
                    addStep(S,8,[[r,cc]],'highlight-error',
                        `[${r}][${cc}] = '${val===(' ')?'empty':val}' ≠ '${p}' ✗ BREAK`,
                        `Anchor [${r}][${c}] → cell ${k+1}/5: ✗ MISMATCH\n${val===' '?'Empty cell':'Different player ('+val+')'} — streak broken!`,
                        {scanHighlight:[r,cc], streakCells:[], streakBreak:[r,cc]});
                    allMatch=false; break;
                }
            }
            if(allMatch) {
                addStep(S,10,streak,'highlight-match','★ 5 IN A ROW! WIN!',
                    `🎉 return 1 — Horizontal win at Row ${r}!`,
                    {matchCells:[...streak], streakCells:[...streak]});
                return S;
            }
        }
        // End of row - clear streak
        if(r<ROWS-1) addStep(S,6,[],'highlight-exec',`Row ${r} done — no win`,`Moving to row ${r+1}...`,{streakCells:[]});
    }

    // --- Vertical ---
    addStep(S,15,[],'highlight-exec','→ Vertical Check','Starting vertical scan...');
    for(let c=0;c<COLS;c++) {
        for(let r=0;r<=ROWS-WIN_LEN;r++) {
            let streak=[], allMatch=true;
            for(let k=0;k<WIN_LEN;k++) {
                const rr=r+k, val=board[rr][c], match=(val===p);
                streak.push([rr,c]);
                if(match) {
                    addStep(S,18,[[rr,c]],'highlight-exec',
                        `[${rr}][${c}] = '${val}' ✓`,
                        `Anchor [${r}][${c}] ↓ cell ${k+1}/5: ✓ MATCH`,
                        {scanHighlight:[rr,c], streakCells:[...streak], streakPlayer:p});
                } else {
                    addStep(S,18,[[rr,c]],'highlight-error',
                        `[${rr}][${c}] = '${val===' '?'empty':val}' ✗ BREAK`,
                        `Anchor [${r}][${c}] ↓ cell ${k+1}/5: ✗ MISMATCH`,
                        {scanHighlight:[rr,c], streakCells:[], streakBreak:[rr,c]});
                    allMatch=false; break;
                }
            }
            if(allMatch) {
                addStep(S,20,streak,'highlight-match','★ WIN! Column '+c,
                    `🎉 return 1 — Vertical win!`,{matchCells:[...streak],streakCells:[...streak]});
                return S;
            }
        }
    }

    // --- Diagonal ↘ ---
    addStep(S,25,[],'highlight-exec','→ Diagonal (\\) Check','Starting diagonal ↘ scan...');
    for(let r=0;r<=ROWS-WIN_LEN;r++) for(let c=0;c<=COLS-WIN_LEN;c++) {
        let streak=[], allMatch=true;
        for(let k=0;k<WIN_LEN;k++) {
            const rr=r+k,cc=c+k, val=board[rr][cc], match=(val===p);
            streak.push([rr,cc]);
            if(match) {
                addStep(S,28,[[rr,cc]],'highlight-exec',`[${rr}][${cc}] ✓`,
                    `Diag ↘ anchor [${r}][${c}] cell ${k+1}/5: ✓`,
                    {scanHighlight:[rr,cc],streakCells:[...streak],streakPlayer:p});
            } else {
                addStep(S,28,[[rr,cc]],'highlight-error',`[${rr}][${cc}] ✗`,
                    `Diag ↘ anchor [${r}][${c}] cell ${k+1}/5: ✗ BREAK`,
                    {scanHighlight:[rr,cc],streakCells:[],streakBreak:[rr,cc]});
                allMatch=false; break;
            }
        }
        if(allMatch) {
            addStep(S,30,streak,'highlight-match','★ WIN! Diag ↘',`🎉 Diagonal win!`,
                {matchCells:[...streak],streakCells:[...streak]});
            return S;
        }
    }

    // --- Diagonal ↗ ---
    addStep(S,35,[],'highlight-exec','→ Diagonal (/) Check','Starting diagonal ↗ scan...');
    for(let r=4;r<ROWS;r++) for(let c=0;c<=COLS-WIN_LEN;c++) {
        let streak=[], allMatch=true;
        for(let k=0;k<WIN_LEN;k++) {
            const rr=r-k,cc=c+k, val=board[rr][cc], match=(val===p);
            streak.push([rr,cc]);
            if(match) {
                addStep(S,38,[[rr,cc]],'highlight-exec',`[${rr}][${cc}] ✓`,
                    `Diag ↗ anchor [${r}][${c}] cell ${k+1}/5: ✓`,
                    {scanHighlight:[rr,cc],streakCells:[...streak],streakPlayer:p});
            } else {
                addStep(S,38,[[rr,cc]],'highlight-error',`[${rr}][${cc}] ✗`,
                    `Diag ↗ anchor [${r}][${c}] cell ${k+1}/5: ✗ BREAK`,
                    {scanHighlight:[rr,cc],streakCells:[],streakBreak:[rr,cc]});
                allMatch=false; break;
            }
        }
        if(allMatch) {
            addStep(S,40,streak,'highlight-match','★ WIN! Diag ↗',`🎉 Diagonal win!`,
                {matchCells:[...streak],streakCells:[...streak]});
            return S;
        }
    }

    addStep(S,45,[],'highlight-exec','No 5-in-a-row found.','return 0 — No winner.',{streakCells:[]});
    return S;
}

// =============================================
//   Scan Trace (with streak visualization)
// =============================================
function generateScanTrace(direction) {
    const S=[];
    if(direction==='horizontal') {
        addStep(S,5,[],'highlight-exec','Full Board Scan — Horizontal','Scanning every row left→right...');
        for(let r=0;r<ROWS;r++) {
            let streak=[], streakPlayer=' ';
            for(let c=0;c<COLS;c++) {
                const val=board[r][c];
                if(val!==' ' && val===streakPlayer) {
                    streak.push([r,c]);
                    addStep(S,6,[[r,c]],'highlight-exec',
                        `[${r}][${c}] = ${val==='X'?'🐱':'🐶'} — streak: ${streak.length}`,
                        `Row ${r}: ${val} streak grows to ${streak.length}`,
                        {scanHighlight:[r,c],streakCells:[...streak],streakPlayer:val});
                } else if(val!==' ') {
                    streak=[[r,c]]; streakPlayer=val;
                    addStep(S,6,[[r,c]],'highlight-exec',
                        `[${r}][${c}] = ${val==='X'?'🐱':'🐶'} — new streak!`,
                        `Row ${r}: Different player — reset streak to ${val}`,
                        {scanHighlight:[r,c],streakCells:[...streak],streakPlayer:val,streakBreak:(streak.length===1?null:undefined)});
                } else {
                    streak=[]; streakPlayer=' ';
                    addStep(S,6,[[r,c]],'highlight-exec',
                        `[${r}][${c}] = empty — streak reset`,
                        `Row ${r}: Empty cell — streak cleared`,
                        {scanHighlight:[r,c],streakCells:[]});
                }
            }
            addStep(S,6,[],'highlight-exec',`Row ${r} complete`,`No 5-in-a-row in row ${r}`,{streakCells:[]});
        }
    } else if(direction==='vertical') {
        addStep(S,15,[],'highlight-exec','Full Board Scan — Vertical','Scanning every column top→bottom...');
        for(let c=0;c<COLS;c++) {
            let streak=[], streakPlayer=' ';
            for(let r=0;r<ROWS;r++) {
                const val=board[r][c];
                if(val!==' ' && val===streakPlayer) {
                    streak.push([r,c]);
                    addStep(S,16,[[r,c]],'highlight-exec',`[${r}][${c}] = ${val==='X'?'🐱':'🐶'} streak:${streak.length}`,
                        `Col ${c}: ${val} streak: ${streak.length}`,{scanHighlight:[r,c],streakCells:[...streak],streakPlayer:val});
                } else if(val!==' ') {
                    streak=[[r,c]]; streakPlayer=val;
                    addStep(S,16,[[r,c]],'highlight-exec',`[${r}][${c}] = ${val==='X'?'🐱':'🐶'} new streak`,
                        `Col ${c}: New ${val} streak`,{scanHighlight:[r,c],streakCells:[...streak],streakPlayer:val});
                } else {
                    streak=[]; streakPlayer=' ';
                    addStep(S,16,[[r,c]],'highlight-exec',`[${r}][${c}] empty`,`Col ${c}: Empty — streak reset`,
                        {scanHighlight:[r,c],streakCells:[]});
                }
            }
            addStep(S,16,[],'highlight-exec',`Col ${c} complete`,`No 5-in-a-row in column ${c}`,{streakCells:[]});
        }
    } else if(direction==='diag-down') {
        addStep(S,25,[],'highlight-exec','Scan — Diagonal (\\)','Scanning diagonals ↘...');
        for(let r=0;r<=ROWS-WIN_LEN;r++) for(let c=0;c<=COLS-WIN_LEN;c++) for(let k=0;k<WIN_LEN;k++) {
            const rr=r+k,cc=c+k;
            addStep(S,27,[[rr,cc]],'highlight-exec',`↘ [${r}][${c}] → [${rr}][${cc}]`,
                `Diagonal from [${r}][${c}], step ${k+1}`,{scanHighlight:[rr,cc]});
        }
    } else if(direction==='diag-up') {
        addStep(S,35,[],'highlight-exec','Scan — Diagonal (/)','Scanning diagonals ↗...');
        for(let r=4;r<ROWS;r++) for(let c=0;c<=COLS-WIN_LEN;c++) for(let k=0;k<WIN_LEN;k++) {
            const rr=r-k,cc=c+k;
            addStep(S,37,[[rr,cc]],'highlight-exec',`↗ [${r}][${c}] → [${rr}][${cc}]`,
                `Diagonal from [${r}][${c}], step ${k+1}`,{scanHighlight:[rr,cc]});
        }
    } else if(direction==='check-draw') {
        addStep(S,4,[],'highlight-exec','Checking for Draw','Scanning every cell for empty...');
        let hasEmpty=false;
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
            const e=board[r][c]===' '; if(e) hasEmpty=true;
            addStep(S,4,[[r,c]],e?'highlight-error':'highlight-match',
                `[${r}][${c}] ${e?'EMPTY ✗':board[r][c]+' ✓'}`,
                e?'⚠ Empty cell — NOT a draw yet':'✓ Occupied',{scanHighlight:[r,c]});
        }
        addStep(S,45,[],hasEmpty?'highlight-error':'highlight-match',
            hasEmpty?'Not drawn yet':'★ DRAW!',hasEmpty?'Empty cells remain':'🤝 Board full — draw!');
    }
    addStep(S,45,[],'highlight-exec','Scan complete.','Full scan finished.',{streakCells:[]});
    return S;
}

// =============================================
//   OOB Trace Generation (5 scenarios)
// =============================================
function generateOOBTrace(errorType) {
    const S=[];
    if(errorType==='horiz-oob') {
        addStep(S,5,[],'highlight-exec','⚠ BUGGY: Horizontal OOB','Bug: c < COLS instead of c <= COLS - 5');
        addStep(S,7,[],'highlight-error','🐛 for(c=0; c<COLS; c++)  ← BUG!',
            '⚠ Should be c <= COLS-5\nBuggy: c goes up to 6');
        addStep(S,8,[[0,3]],'highlight-exec','Anchor [0][3] — will access c+4=7',
            'Pivot: [0][3] → board[0][7] exceeds COLS!',{scanHighlight:[0,3]});
        addStep(S,8,[[0,4],[0,5],[0,6]],'highlight-error',
            '💥 board[0][7], board[0][8], board[0][9] — OOB!',
            '💥 MEMORY ACCESS VIOLATION!\nIndices 7,8,9 ≥ COLS(7)\n→ Reading past array boundary!',
            {oobCells:[[0,4],[0,5],[0,6]],showGhost:'col',ghostCells:[[0,7],[0,8],[0,9]]});
    } else if(errorType==='vert-oob') {
        addStep(S,15,[],'highlight-exec','⚠ BUGGY: Vertical OOB','Bug: r < ROWS instead of r <= ROWS-5');
        addStep(S,17,[],'highlight-error','🐛 for(r=0; r<ROWS; r++)  ← BUG!',
            '⚠ Should be r <= ROWS-5\nBuggy: r goes up to 5');
        addStep(S,18,[[3,0]],'highlight-exec','Anchor [3][0] — will access r+4=7',
            'Pivot: [3][0] → board[7][0] exceeds ROWS!',{scanHighlight:[3,0]});
        addStep(S,18,[[3,0],[4,0],[5,0]],'highlight-error',
            '💥 board[6][0], board[7][0] — OOB!',
            '💥 MEMORY ACCESS VIOLATION!\nRow 6,7 don\'t exist (ROWS=6)\n→ Reading adjacent stack memory!',
            {oobCells:[[4,0],[5,0]],showGhost:'row',ghostCells:[[6,0],[7,0]]});
    } else if(errorType==='diag-oob') {
        addStep(S,25,[],'highlight-exec','⚠ BUGGY: Diagonal OOB','Wrong bounds for r and c');
        addStep(S,27,[],'highlight-error','🐛 for(r=0;r<ROWS;r++) for(c=0;c<COLS;c++)  ← BUG!',
            '⚠ Valid: r<=1,c<=2\nBuggy: r<=5,c<=6');
        addStep(S,28,[[3,4]],'highlight-exec','Anchor [3][4] → diagonal to [7][8]',
            'BOTH row and col overflow!',{scanHighlight:[3,4]});
        addStep(S,28,[[4,5]],'highlight-error','💥 DOUBLE OOB at [7][8]!',
            '💥 CRASH!\n[5][6],[6][7],[7][8] all OOB\n→ Random memory access!',
            {oobCells:[[4,5]],showGhost:'both',ghostCells:[[5,6],[6,7],[7,8]]});
    } else if(errorType==='neg-index') {
        addStep(S,35,[],'highlight-exec','⚠ BUGGY: Negative Row Index','Bug: r starts at 0 for diagonal ↗');
        addStep(S,37,[],'highlight-error','🐛 for(r=0; r<ROWS; r++)  ← BUG!',
            '⚠ Diagonal ↗ subtracts from r!\nShould start at r=4, not r=0');
        addStep(S,38,[[2,0]],'highlight-exec','Anchor [2][0] — r-4 = -2!',
            'board[-2][4] → NEGATIVE INDEX!\nReads memory BEFORE the array!',{scanHighlight:[2,0]});
        addStep(S,38,[[1,1],[0,2]],'highlight-error','💥 board[-1][3], board[-2][4] — NEGATIVE!',
            '💥 MEMORY UNDERFLOW!\nNegative array indices in C\nread memory before the array start.\n→ Segfault or data corruption!',
            {oobCells:[[0,2],[1,1]],showGhost:'row',ghostCells:[]});
    } else if(errorType==='uninit') {
        addStep(S,4,[],'highlight-exec','⚠ BUGGY: Uninitialized Board','checkWin() called before initBoard()');
        addStep(S,8,[],'highlight-error','🐛 Board contains GARBAGE values!',
            '⚠ Without initBoard(), array has\nrandom data from memory.');
        // Show random garbage on board
        for(let r=0;r<2;r++) for(let c=0;c<COLS;c++) {
            const garbage=['X','O',' ','?','@','#'][Math.floor(Math.random()*6)];
            addStep(S,8,[[r,c]],'highlight-error',
                `[${r}][${c}] = '${garbage}' ← GARBAGE`,
                `Cell contains random value '${garbage}'\nfrom uninitialized memory`,
                {scanHighlight:[r,c],oobCells:[[r,c]]});
        }
        addStep(S,10,[],'highlight-error','💥 FALSE WIN! Garbage matched!',
            '💥 Random garbage may spell "XXXXX"!\ncheckWin returns 1 incorrectly.\n→ Game declares winner when nobody won!');
    }
    return S;
}

// =============================================
//   Step Rendering (synced left + right)
// =============================================
function renderStep(idx) {
    if(idx<0||idx>=traceSteps.length)return;
    currentStep=idx;
    const step=traceSteps[idx];

    activeTab=step.tab||'logic_c';
    document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===activeTab));

    // LEFT: Code highlight
    renderCode(activeTab,step.line,step.cls);

    // RIGHT: Clear dynamic highlights
    document.querySelectorAll('.cell').forEach(c=>{
        c.classList.remove('cell-highlight-scan','cell-highlight-match','cell-highlight-error',
            'cell-highlight-check','cell-pulse','cell-oob-error','cell-streak','cell-streak-break');
    });
    ghostCol.classList.remove('visible');ghostCol.innerHTML='';
    ghostRow.classList.remove('visible');ghostRow.innerHTML='';

    // Visited trail
    visitedCells.forEach(key=>{ const c=$(key); if(c) c.classList.add('cell-visited'); });

    // GREEN STREAK — persistent matching cells
    if(step.streakCells && step.streakCells.length>0) {
        step.streakCells.forEach(([r,c])=>{
            const cell=$(`cell-${r}-${c}`);
            if(cell) cell.classList.add('cell-streak');
        });
    }

    // Streak break — brief red flash on mismatch
    if(step.streakBreak) {
        const [r,c]=step.streakBreak;
        const cell=$(`cell-${r}-${c}`);
        if(cell) cell.classList.add('cell-streak-break');
    }

    // Current scan cell (yellow glow)
    if(step.scanHighlight) {
        const [r,c]=step.scanHighlight;
        visitedCells.add(`cell-${r}-${c}`);
        highlightCell(r,c,'cell-highlight-scan');
    }

    // WIN highlight (green glow)
    if(step.matchCells && step.matchCells.length>0) {
        step.matchCells.forEach(([r,c])=>highlightCell(r,c,'cell-highlight-match'));
    }

    // Anchor/check cells
    if(step.cells && step.cells.length>0 && !step.scanHighlight) {
        step.cells.forEach(([r,c])=>highlightCell(r,c,'cell-highlight-check'));
    }

    // OOB exclamation
    if(step.oobCells) {
        step.oobCells.forEach(([r,c])=>{
            const cell=$(`cell-${r}-${c}`);
            if(cell) cell.classList.add('cell-oob-error');
        });
    }

    // Ghost cells
    if(step.showGhost) showGhostCells(step.showGhost,step.ghostCells);

    pivotText.textContent=step.pivot||'';
    stepCounter.textContent=`Step ${idx+1} of ${traceSteps.length}`;
    progressFill.style.width=`${((idx+1)/traceSteps.length)*100}%`;
    updateBtns();
}

function showGhostCells(type,cells) {
    if(!cells||cells.length===0) return;
    if(type==='col'||type==='both') {
        ghostCol.classList.add('visible');ghostCol.innerHTML='';
        cells.filter(([r,c])=>c>=COLS).forEach(([r,c])=>{
            const g=document.createElement('div');
            g.className='ghost-cell oob-active';
            g.innerHTML=`<span class="cell-index">[${r}][${c}]</span><span class="oob-label">⚠</span><span class="oob-sublabel">OOB</span>`;
            ghostCol.appendChild(g);
        });
    }
    if(type==='row'||type==='both') {
        ghostRow.classList.add('visible');ghostRow.innerHTML='';
        cells.filter(([r,c])=>r>=ROWS).forEach(([r,c])=>{
            const g=document.createElement('div');
            g.className='ghost-cell oob-active';
            g.innerHTML=`<span class="cell-index">[${r}][${c}]</span><span class="oob-label">⚠</span><span class="oob-sublabel">OOB</span>`;
            ghostRow.appendChild(g);
        });
    }
}

function updateBtns() {
    $('btn-first').disabled=currentStep<=0;
    $('btn-prev').disabled=currentStep<=0;
    $('btn-next').disabled=currentStep>=traceSteps.length-1;
    $('btn-last').disabled=currentStep>=traceSteps.length-1;
}

// =============================================
//   Auto-Play
// =============================================
function getSpeed(){return 1100-(parseInt(speedSlider.value)*100);}

function startAutoPlay() {
    if(traceSteps.length===0) return;
    isPlaying=true;
    btnPlay.textContent='⏸ Pause'; btnPlay.classList.add('playing');
    autoPlayTick();
}

function stopAutoPlay() {
    isPlaying=false;
    btnPlay.textContent='▶ Play'; btnPlay.classList.remove('playing');
    if(autoPlayTimer){clearTimeout(autoPlayTimer);autoPlayTimer=null;}
}

function autoPlayTick() {
    if(!isPlaying)return;
    if(currentStep>=traceSteps.length-1){stopAutoPlay();return;}
    renderStep(currentStep+1);
    autoPlayTimer=setTimeout(autoPlayTick,getSpeed());
}

function toggleAutoPlay(){if(isPlaying)stopAutoPlay();else startAutoPlay();}

// =============================================
//   Crash Info Card
// =============================================
function showCrashInfo(errorType) {
    const info=CRASH_INFO[errorType];
    if(!info){crashCard.style.display='none';return;}
    $('crash-title').textContent=info.title;
    $('crash-what').textContent=info.what;
    $('crash-fix').textContent=info.fix;
    crashCard.style.display='block';
}

function hideCrashInfo(){crashCard.style.display='none';}

// =============================================
//   Start Trace
// =============================================
function startTrace(steps) {
    stopAutoPlay();visitedCells.clear();clearAllHighlights();
    traceSteps=steps; currentStep=-1;
    renderStep(0);
}

// =============================================
//   Event Setup
// =============================================
function init() {
    resetBoard();buildGrid();renderBoard();
    renderCode('logic_c',-1);updateBtns();

    speedSlider.addEventListener('input',()=>{speedValue.textContent=speedSlider.value+'x';});

    $('btn-first').addEventListener('click',()=>{stopAutoPlay();renderStep(0);});
    $('btn-prev').addEventListener('click',()=>{stopAutoPlay();renderStep(currentStep-1);});
    $('btn-next').addEventListener('click',()=>{stopAutoPlay();renderStep(currentStep+1);});
    $('btn-last').addEventListener('click',()=>{stopAutoPlay();renderStep(traceSteps.length-1);});
    btnPlay.addEventListener('click',toggleAutoPlay);

    // Scenarios
    document.querySelectorAll('.btn-scenario').forEach(btn=>{
        btn.addEventListener('click',()=>{
            hideCrashInfo();
            loadScenario(btn.dataset.scenario);renderBoard();
            startTrace(generateWinTrace('X'));
        });
    });

    // Scans
    document.querySelectorAll('.btn-scan').forEach(btn=>{
        btn.addEventListener('click',()=>{
            hideCrashInfo();
            startTrace(generateScanTrace(btn.dataset.scan));
        });
    });

    // Error sim
    $('btn-error').addEventListener('click',()=>{
        const errType=$('error-select').value;
        loadScenario('horiz');renderBoard();
        showCrashInfo(errType);
        startTrace(generateOOBTrace(errType));
    });

    // Toggle Fix Panel
    $('btn-show-fix').addEventListener('click',()=>{
        if(crashCard.style.display==='block') {
            hideCrashInfo();
        } else {
            const errType=$('error-select').value;
            showCrashInfo(errType);
        }
    });

    // Reset
    $('btn-reset').addEventListener('click',()=>{
        stopAutoPlay();resetBoard();renderBoard();clearAllHighlights();
        traceSteps=[];currentStep=-1;
        renderCode('logic_c',-1);
        pivotText.textContent='Select a scenario to begin visualization.';
        stepCounter.textContent='Step 0 of 0';progressFill.style.width='0%';
        boardSubtitle.textContent='Select a scenario below';updateBtns();
        hideCrashInfo();
    });

    // Tabs
    document.querySelectorAll('.tab').forEach(tab=>{
        tab.addEventListener('click',()=>{
            activeTab=tab.dataset.tab;
            document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===tab));
            const hl=(traceSteps.length>0&&currentStep>=0&&traceSteps[currentStep].tab===activeTab)?traceSteps[currentStep].line:-1;
            renderCode(activeTab,hl,hl>0?traceSteps[currentStep].cls:'');
        });
    });

    // Keyboard
    document.addEventListener('keydown',e=>{
        if(e.key==='ArrowRight'||e.key==='n'){e.preventDefault();if(currentStep<traceSteps.length-1)renderStep(currentStep+1);}
        else if(e.key==='ArrowLeft'||e.key==='p'){e.preventDefault();if(currentStep>0)renderStep(currentStep-1);}
        else if(e.key==='Home'){e.preventDefault();renderStep(0);}
        else if(e.key==='End'){e.preventDefault();renderStep(traceSteps.length-1);}
        else if(e.key===' '){e.preventDefault();toggleAutoPlay();}
    });
}

document.addEventListener('DOMContentLoaded',init);
