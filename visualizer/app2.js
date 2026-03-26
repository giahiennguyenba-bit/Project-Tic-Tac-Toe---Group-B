/* =============================================
   Chaos Tic Tac Toe — Radial Win Check Visualizer
   app2.js — Optimized "Line-by-Line" Trace
   ============================================= */

const ROWS = 6, COLS = 7, WIN_LEN = 5;

// ─── State ───
let board = [], traceSteps = [], currentStep = -1, activeTab = 'logic_c';
let autoPlayTimer = null, isPlaying = false;
let lastPiece = 'X';
let lastMove = {r: -1, c: -1};

// ─── DOM refs ───
const $ = id => document.getElementById(id);
const gridEl = $('grid'), codeDisplay = $('code-display');
const pivotText = $('pivot-text'), stepCounter = $('step-counter');
const progressFill = $('progress-fill'), boardSubtitle = $('board-subtitle');
const speedSlider = $('speed-slider'), speedValue = $('speed-value');
const btnPlay = $('btn-play');

// ─── Source Code — Line-by-Line Optimization ───
const SOURCE = {
    logic_h: `#ifndef LOGIC_H\n#define LOGIC_H\n\n// Checks only from the last move at (r, c)\nint checkWin(int r, int c, char p);\n\n#endif // LOGIC_H`.split('\n'),

    logic_c: `int checkWin(int r, int c, char p) {\n    // 1. Horizontal Check (Full Row r)\n    int count = 0;\n    for (int j = 0; j < COLS; j++) {\n        if (board[r][j] == p) {\n            if (++count >= 5) return 1;\n        } else count = 0;\n    }\n\n    // 2. Vertical Check (Full Column c)\n    count = 0;\n    for (int i = 0; i < ROWS; i++) {\n        if (board[i][c] == p) {\n            if (++count >= 5) return 1;\n        } else count = 0;\n    }\n\n    // 3. Diagonal ↘ Check\n    count = 0;\n    // (Logic to scan full diagonal through r,c...)\n\n    // 4. Diagonal ↗ Check\n    count = 0;\n    // (Logic to scan full diagonal through r,c...)\n\n    return 0;\n}`.split('\n'),
};

// ─── Scenarios ───
const SCENARIOS = {
    horiz: { desc:'Almost Horiz at Row 3', pieces:[[3,0,'O'],[3,1,'X'],[3,2,'X'],[3,4,'X'],[3,5,'X']] },
    vert: { desc:'Almost Vert at Col 2', pieces:[[0,2,'O'],[1,2,'X'],[2,2,'X'],[4,2,'X'],[5,2,'X']] },
    'diag-down': { desc:'Almost Diag ↘', pieces:[[0,1,'X'],[1,2,'X'],[3,4,'X'],[4,5,'X']] },
    'diag-up': { desc:'Almost Diag ↗', pieces:[[5,0,'X'],[4,1,'X'],[2,3,'X'],[1,4,'X']] },
};

// =============================================
//   Board & Grid
// =============================================
function resetBoard() { board=[]; for(let r=0;r<ROWS;r++) board.push(new Array(COLS).fill(' ')); }
function buildGrid() {
    gridEl.innerHTML='';
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
        const cell=document.createElement('div');
        cell.className='cell'; cell.id=`cell-${r}-${c}`;
        cell.innerHTML=`<span class="cell-index">[${r}][${c}]</span><span class="cell-piece" id="piece-${r}-${c}"></span>`;
        cell.onclick = () => onCellClick(r, c);
        gridEl.appendChild(cell);
    }
}
function renderBoard() {
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) {
        const cell=$(`cell-${r}-${c}`), pieceSpan=$(`piece-${r}-${c}`);
        cell.className='cell';
        if(board[r][c]==='X'){pieceSpan.textContent='🐱';cell.classList.add('cell-cat');}
        else if(board[r][c]==='O'){pieceSpan.textContent='🐶';cell.classList.add('cell-dog');}
        else pieceSpan.textContent='';
        
        if(lastMove.r === r && lastMove.c === c) cell.classList.add('cell-check-active');
    }
}

// =============================================
//   Trace Builder
// =============================================
function addStep(steps,line,cells,cls,desc,pivot,extra={}) {
    steps.push({tab:activeTab,line,cells,cls,desc,pivot,...extra});
}

function generateLineTrace(r, c, p) {
    const S=[];
    activeTab = 'logic_c';
    addStep(S,1,[[r,c]],'highlight-exec',`checkWinAt(${r}, ${c}, '${p}')`,
        `Player clicked [${r}][${c}]. Starting high-speed line scans.`);

    // 1. Horizontal
    const rowCells = []; for(let j=0; j<COLS; j++) rowCells.push([r,j]);
    addStep(S,4,rowCells,'highlight-exec',`Scanning Full Row ${r}`, 
        `Checking every cell in row ${r} for 5-in-a-row...`, {lineCells:[...rowCells]});
    
    let horizCount = 0, horizWin = false, horizStreak=[];
    for(let j=0; j<COLS; j++) {
        if(board[r][j] === p) {
            horizCount++; horizStreak.push([r,j]);
            if(horizCount >= 5) horizWin = true;
        } else { horizCount = 0; horizStreak = []; }
    }
    if(horizWin) {
        addStep(S,6,horizStreak,'highlight-match',`WIN! Horizontal`, `Found 5-in-a-row in the row scan!`, {matchCells:horizStreak});
        return S;
    }

    // 2. Vertical
    const colCells = []; for(let i=0; i<ROWS; i++) colCells.push([i,c]);
    addStep(S,12,colCells,'highlight-exec',`Scanning Full Column ${c}`, 
        `Row finished. Now checking the entire column ${c}...`, {lineCells:[...colCells]});
    
    let vertCount = 0, vertWin = false, vertStreak=[];
    for(let i=0; i<ROWS; i++) {
        if(board[i][c] === p) {
            vertCount++; vertStreak.push([i,c]);
            if(vertCount >= 5) vertWin = true;
        } else { vertCount = 0; vertStreak = []; }
    }
    if(vertWin) {
        addStep(S,14,vertStreak,'highlight-match',`WIN! Vertical`, `Found 5-in-a-row in the column scan!`, {matchCells:vertStreak});
        return S;
    }

    // 3. Diagonal ↘
    const d1Cells = [];
    let sR=r, sC=c; while(sR>0 && sC>0){sR--;sC--;}
    while(sR<ROWS && sC<COLS){d1Cells.push([sR,sC]); sR++; sC++;}
    addStep(S,20,d1Cells,'highlight-exec',`Scanning Diagonal ↘`, 
        `Checking the full diagonal (↘) through [${r}][${c}]...`, {lineCells:[...d1Cells]});
    
    let d1Count=0, d1Win=false, d1Streak=[];
    for(let pair of d1Cells) {
        if(board[pair[0]][pair[1]] === p){ d1Count++; d1Streak.push(pair); if(d1Count>=5) d1Win=true; }
        else { d1Count=0; d1Streak=[]; }
    }
    if(d1Win) {
        addStep(S,20,d1Streak,'highlight-match',`WIN! Diagonal ↘`, `Found 5-in-a-row in diagonal!`, {matchCells:d1Streak});
        return S;
    }

    // 4. Diagonal ↗
    const d2Cells = [];
    sR=r; sC=c; while(sR<ROWS-1 && sC>0){sR++;sC--;}
    while(sR>=0 && sC<COLS){d2Cells.push([sR,sC]); sR--; sC++;}
    addStep(S,24,d2Cells,'highlight-exec',`Scanning Diagonal ↗`, 
        `Finally, checking the full diagonal (↗) through [${r}][${c}]...`, {lineCells:[...d2Cells]});

    let d2Count=0, d2Win=false, d2Streak=[];
    for(let pair of d2Cells) {
        if(board[pair[0]][pair[1]] === p){ d2Count++; d2Streak.push(pair); if(d2Count>=5) d2Win=true; }
        else { d2Count=0; d2Streak=[]; }
    }
    if(d2Win) {
        addStep(S,24,d2Streak,'highlight-match',`WIN! Diagonal ↗`, `Found 5-in-a-row in diagonal!`, {matchCells:d2Streak});
        return S;
    }

    addStep(S,27,[],'highlight-exec',`No win found.`, `Line scans complete. return 0.`);
    return S;
}

// =============================================
//   Rendering
// =============================================
function renderStep(idx) {
    if(idx<0||idx>=traceSteps.length)return;
    currentStep=idx;
    const step=traceSteps[idx];

    activeTab = step.tab || 'logic_c';
    renderCode(activeTab, step.line, step.cls);

    // Clear dynamic highlights
    document.querySelectorAll('.cell').forEach(c=>{
        c.classList.remove('cell-highlight-scan','cell-highlight-match','cell-highlight-error',
            'cell-highlight-check','cell-pulse','cell-streak');
    });

    // Highlight entire lines
    if(step.lineCells) {
        step.lineCells.forEach(([r,c]) => {
            const el = $(`cell-${r}-${c}`);
            if(el) el.classList.add('cell-highlight-check');
        });
    }

    if(step.matchCells) {
        step.matchCells.forEach(([r,c]) => {
            const el = $(`cell-${r}-${c}`);
            if(el) el.classList.add('cell-highlight-match');
        });
    }

    pivotText.textContent=step.pivot||'';
    stepCounter.textContent=`Step ${idx+1} of ${traceSteps.length}`;
    progressFill.style.width=`${((idx+1)/traceSteps.length)*100}%`;
    updateBtns();
}

// Same helper functions as before...
function onCellClick(r, c) {
    if (autoPlayTimer) stopAutoPlay();
    lastMove = {r, c};
    board[r][c] = lastPiece;
    renderBoard();
    startTrace(generateLineTrace(r, c, lastPiece));
}
function renderCode(tab,highlightLine,hlCls) {
    const lines=SOURCE[tab]; if(!lines) return;
    let html='';
    lines.forEach((text,i)=>{
        const ln=i+1; let cls='code-line';
        if(highlightLine===ln) cls+=` ${hlCls||'highlight-exec'}`;
        html+=`<span class="${cls}"><span class="line-num">${ln}</span>${syntaxHL(escHtml(text))}</span>\n`;
    });
    codeDisplay.innerHTML=html;
}
function syntaxHL(t) {
    return t.replace(/\b(int|char|void|for|if|return|extern|const|while)\b/g,'<span class="kw">$1</span>')
        .replace(/\b(checkWin|inBounds)\b/g,'<span class="fn">$1</span>')
        .replace(/\b(ROWS|COLS)\b/g,'<span class="type">$1</span>')
        .replace(/\b(\d+)\b/g,'<span class="num">$1</span>');
}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function startTrace(steps) { traceSteps=steps; currentStep=-1; renderStep(0); }
function stopAutoPlay() { isPlaying=false; btnPlay.textContent='▶ Play'; if(autoPlayTimer){clearTimeout(autoPlayTimer);autoPlayTimer=null;} }
function updateBtns() { $('btn-first').disabled=currentStep<=0; $('btn-prev').disabled=currentStep<=0; $('btn-next').disabled=currentStep>=traceSteps.length-1; $('btn-last').disabled=currentStep>=traceSteps.length-1; }

function init() {
    resetBoard(); buildGrid(); renderBoard();
    renderCode('logic_c', -1);
    speedSlider.oninput = () => { $( 'speed-value' ).textContent = speedSlider.value+'x'; };
    $('btn-reset').onclick = () => { resetBoard(); lastMove={r:-1,c:-1}; renderBoard(); startTrace([]); pivotText.textContent="Click any cell to test."; };
    document.querySelectorAll('.btn-scenario').forEach(btn => {
        btn.onclick = () => {
            resetBoard();
            const sc = SCENARIOS[btn.dataset.scenario];
            sc.pieces.forEach(([r,c,v])=>board[r][c]=v);
            renderBoard();
            boardSubtitle.textContent = sc.desc;
        };
    });
    $('btn-next').onclick = () => renderStep(currentStep+1);
    $('btn-prev').onclick = () => renderStep(currentStep-1);
    $('btn-first').onclick = () => renderStep(0);
    $('btn-last').onclick = () => renderStep(traceSteps.length-1);
    btnPlay.onclick = () => {
        if(isPlaying) stopAutoPlay();
        else {
            isPlaying=true; btnPlay.textContent='⏸ Pause';
            const tick = () => {
                if(!isPlaying) return;
                if(currentStep >= traceSteps.length-1){ stopAutoPlay(); return; }
                renderStep(currentStep+1);
                autoPlayTimer = setTimeout(tick, 1100 - speedSlider.value * 100);
            };
            tick();
        }
    };
}
document.addEventListener('DOMContentLoaded',init);
