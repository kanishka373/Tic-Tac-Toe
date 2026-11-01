const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const $ = (id) => document.getElementById(id);
const score = { X: 0, O: 0, D: 0 };
let board, turn, over;
let soundOn = true;

function beep(freq, dur = 0.12) {
  if (!soundOn) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  gain.gain.value = 0.1;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
  osc.onended = () => ctx.close();
}

// 9 cells JS se bana lo
for (let i = 0; i < 9; i++) {
  const c = document.createElement('button');
  c.className = 'cell';
  c.onclick = () => click(i);
  $('board').appendChild(c);
}
const cells = $('board').children;

const winner = (b) => LINES.find(([a, x, y]) => b[a] && b[a] === b[x] && b[a] === b[y]);


function start() {
  board = Array(9).fill('');
  turn = 'X';
  over = false;
  [...cells].forEach((c) => { c.textContent = ''; c.className = 'cell'; });
  $('status').textContent = "X's turn";
}

function play(i) {
  board[i] = turn;
  cells[i].textContent = turn;
  cells[i].classList.add(turn);
  beep(turn === 'X' ? 520 : 380);

  const line = winner(board);
  if (line || board.every(Boolean)) {
    over = true;
    if (line) {
      line.forEach((j) => cells[j].classList.add('win'));
      score[turn]++;
    } else {
      score.D++;
    }
    for (const k in score) $('s' + k).textContent = score[k];
    $('status').textContent = line ? `${turn} wins! 🎉` : "It's a draw 🤝";
    beep(line ? 800 : 250, 0.3);
    return;
  }

  turn = turn === 'X' ? 'O' : 'X';
  $('status').textContent = `${turn}'s turn`;
}

function click(i) {
  const cpu = $('mode').value !== '2p';
  if (over || board[i] || (cpu && turn === 'O')) return;
  play(i);
  if (cpu) setTimeout(() => { if (!over && turn === 'O') play(cpuMove()); }, 400);
}

// ---------- computer ----------
function cpuMove() {
  const empty = board.map((v, i) => (v ? null : i)).filter((i) => i !== null);
  if ($('mode').value === 'easy') return empty[Math.floor(Math.random() * empty.length)];

  let best = -Infinity, move;
  for (const i of empty) {
    board[i] = 'O';
    const s = minimax(false, 0);
    board[i] = '';
    if (s > best) { best = s; move = i; }
  }
  return move;
}

function minimax(isO, d) {
  if (winner(board)) return isO ? d - 10 : 10 - d;
  if (board.every(Boolean)) return 0;

  let best = isO ? -Infinity : Infinity;
  board.forEach((v, i) => {
    if (v) return;
    board[i] = isO ? 'O' : 'X';
    const s = minimax(!isO, d + 1);
    board[i] = '';
    best = isO ? Math.max(best, s) : Math.min(best, s);
  });
  return best;
}

// ---------- events ----------
$('mute').onclick = () => {
  soundOn = !soundOn;
  $('mute').textContent = soundOn ? '🔊' : '🔇';
};
$('restart').onclick = start;
$('mode').onchange = () => {
  for (const k in score) { score[k] = 0; $('s' + k).textContent = 0; }
  start();
};

start();