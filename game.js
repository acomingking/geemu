(() => {
  const COLS = 20;
  const ROWS = 20;
  const CELL = 20; // px

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const messageEl = document.getElementById('message');
  const restartBtn = document.getElementById('restart');

  const DIR = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] };
  const KEY_MAP = {
    ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
    w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
    W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT',
  };
  const OPPOSITE = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };

  let snake, dir, nextDir, food, score, best, gameState, intervalId;

  best = Number(localStorage.getItem('geemu_best') || 0);
  bestEl.textContent = best;

  function init() {
    snake = [
      { x: 10, y: 10 },
      { x: 9,  y: 10 },
      { x: 8,  y: 10 },
    ];
    dir = 'RIGHT';
    nextDir = 'RIGHT';
    score = 0;
    scoreEl.textContent = 0;
    gameState = 'waiting'; // waiting | running | over
    messageEl.textContent = 'Press any arrow key to start!';
    restartBtn.style.display = 'none';
    placeFood();
    draw();
  }

  function placeFood() {
    const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
    let x, y;
    do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * ROWS);
    } while (occupied.has(`${x},${y}`));
    food = { x, y };
  }

  function step() {
    dir = nextDir;
    const head = snake[0];
    const [dx, dy] = DIR[dir];
    const next = { x: head.x + dx, y: head.y + dy };

    // Wall collision
    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      return gameOver();
    }
    // Self collision
    if (snake.some(s => s.x === next.x && s.y === next.y)) {
      return gameOver();
    }

    snake.unshift(next);

    if (next.x === food.x && next.y === food.y) {
      score++;
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem('geemu_best', best);
      }
      placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver() {
    clearInterval(intervalId);
    gameState = 'over';
    messageEl.textContent = '💀 Game Over!';
    restartBtn.style.display = 'inline-block';
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid dots (subtle)
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.fillRect(c * CELL + CELL / 2 - 1, r * CELL + CELL / 2 - 1, 2, 2);
      }
    }

    // Food
    ctx.fillStyle = '#f0a500';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2 - 2, 0, Math.PI * 2
    );
    ctx.fill();

    // Snake
    snake.forEach((seg, i) => {
      const brightness = i === 0 ? 1 : Math.max(0.4, 1 - i / snake.length);
      ctx.fillStyle = `rgba(99, 230, 130, ${brightness})`;
      ctx.beginPath();
      const r = i === 0 ? CELL / 2 - 1 : CELL / 2 - 3;
      ctx.arc(
        seg.x * CELL + CELL / 2,
        seg.y * CELL + CELL / 2,
        r, 0, Math.PI * 2
      );
      ctx.fill();
    });

    // Eyes on head
    if (snake.length > 0) {
      const head = snake[0];
      const [dx, dy] = DIR[dir];
      const cx = head.x * CELL + CELL / 2;
      const cy = head.y * CELL + CELL / 2;
      const eyeOffset = 3;
      const eyePositions = dir === 'UP' || dir === 'DOWN'
        ? [[-eyeOffset, dy * 3], [eyeOffset, dy * 3]]
        : [[dx * 3, -eyeOffset], [dx * 3, eyeOffset]];
      ctx.fillStyle = '#1a1a2e';
      eyePositions.forEach(([ox, oy]) => {
        ctx.beginPath();
        ctx.arc(cx + ox, cy + oy, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function startGame() {
    if (gameState !== 'waiting') return;
    gameState = 'running';
    messageEl.textContent = '';
    intervalId = setInterval(step, 120);
  }

  document.addEventListener('keydown', e => {
    const mapped = KEY_MAP[e.key];
    if (!mapped) return;
    e.preventDefault();
    if (gameState === 'waiting') {
      nextDir = mapped;
      dir = mapped;
      startGame();
    } else if (gameState === 'running' && mapped !== OPPOSITE[dir]) {
      nextDir = mapped;
    }
  });

  restartBtn.addEventListener('click', init);

  init();
})();
