import { useEffect, useRef, useState } from 'react';

type RGB = [number, number, number];

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  onPaddle: boolean;
  straightFrames: number;
  trail: { x: number; y: number }[];
  trailMax: number;
  prevX: number;
  prevY: number;
};

type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: RGB;
  strength: number;
  hitFlash: number;
};

type Powerup = {
  x: number;
  y: number;
  type: PowerupType;
  vy: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: RGB;
};

type Popup = {
  x: number;
  y: number;
  dy: number;
  life: number;
  txt: string;
};

type PowerupType = 'expand' | 'shrink' | 'slow' | 'fast' | 'multi_ball';

type GameState = {
  score: number;
  lives: number;
  level: number;
  paddleX: number;
  paddleY: number;
  paddleWidth: number;
  paddleSpeed: number;
  paddleBoostSpeed: number;
  balls: Ball[];
  bricks: Brick[];
  powerups: Powerup[];
  powerupMessage: string | null;
  powerupTimer: number;
  powerupColor: RGB;
  powerupTimers: Record<PowerupType, number>;
  powerupMax: Record<PowerupType, number>;
  brickTop: number;
  popups: Popup[];
  shake: number;
  paused: boolean;
  resuming: boolean;
  resumeUntil: number;
  timersFrozen: boolean;
  multiballTriggeredFrame: boolean;
  globalMaxBallSpeed: number;
  bannerTimer: number;
  gameOver: boolean;
  rng: number;
};

const WIDTH = 800;
const HEIGHT = 720;
const PADDLE_BOTTOM_MARGIN = 22;
const TARGET_MIN_GAP = 420;
const ROWS = 5;

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const RED: RGB = [255, 0, 0];
const GREEN: RGB = [0, 255, 0];
const BLUE: RGB = [0, 0, 255];
const YELLOW: RGB = [255, 255, 0];
const ORANGE: RGB = [255, 165, 0];
const PURPLE: RGB = [128, 0, 128];
const BROWN: RGB = [150, 75, 0];
const GREY: RGB = [50, 50, 50];
const CYAN: RGB = [0, 200, 200];

const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 18;
const BALL_SIZE = 14;
const BRICK_WIDTH = 80;
const BRICK_HEIGHT = 28;
const POWERUP_SIZE = 22;
const TOP_PLAY_Y = 10;

const BASE_BALL_SPEED = 5;
const BASE_PADDLE_SPEED = 7;
const BOOST_PADDLE_SPEED = 10;
const MAX_BALL_SPEED = 10;
const MIN_HORZ_SPEED = 0.6;
const MIN_VERT_SPEED = 2.0;

const POWERUP_DURATION: Record<PowerupType, number> = {
  expand: 900,
  shrink: 900,
  slow: 450,
  fast: 450,
  multi_ball: 0,
};

const POWERUP_CHANCE = 0.35;
const COLORS = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, BROWN];
const POWERUP_TYPES: PowerupType[] = ['expand', 'shrink', 'slow', 'fast', 'multi_ball'];

const toRgb = (color: RGB, alpha?: number) => {
  const [r, g, b] = color;
  if (typeof alpha === 'number') {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
};

const randFloat = (state: GameState) => {
  state.rng = (state.rng * 1664525 + 1013904223) >>> 0;
  return state.rng / 4294967296;
};

const randChoice = (state: GameState, values: number[]) => {
  const idx = Math.floor(randFloat(state) * values.length);
  return values[Math.max(0, Math.min(values.length - 1, idx))];
};

const clampSpeed = (ball: Ball, maxSpeed: number) => {
  const v2 = ball.dx * ball.dx + ball.dy * ball.dy;
  if (v2 > maxSpeed * maxSpeed) {
    const s = maxSpeed / Math.sqrt(v2);
    ball.dx *= s;
    ball.dy *= s;
  }
};

const ensureMinHorizontal = (ball: Ball, state: GameState, minH = MIN_HORZ_SPEED) => {
  const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
  if (speed === 0) {
    ball.dx = minH * randChoice(state, [-1, 1]);
    ball.dy = -BASE_BALL_SPEED;
    return;
  }
  if (Math.abs(ball.dx) < minH) {
    const sign = ball.dx < 0 ? -1 : ball.dx > 0 ? 1 : randChoice(state, [-1, 1]);
    const newDx = Math.min(minH, speed * 0.9) * sign;
    const rem = Math.max(speed * speed - newDx * newDx, 1.0);
    const newDy = Math.sign(ball.dy || -1) * Math.sqrt(rem);
    ball.dx = newDx;
    ball.dy = newDy;
  }
};

const ensureMinVertical = (ball: Ball, state: GameState, minV = MIN_VERT_SPEED) => {
  const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
  if (speed === 0) {
    ball.dx = MIN_HORZ_SPEED * randChoice(state, [-1, 1]);
    ball.dy = -minV;
    return;
  }
  if (Math.abs(ball.dy) < minV && speed > minV) {
    const sign = ball.dy < 0 ? -1 : ball.dy > 0 ? 1 : -1;
    const newDy = sign * minV;
    const newDxMag = Math.sqrt(Math.max(speed * speed - minV * minV, 0));
    ball.dx = Math.sign(ball.dx || randChoice(state, [-1, 1])) * newDxMag;
    ball.dy = newDy;
  }
};

const postSeparate = (ball: Ball, axis: 'x' | 'y', amount = 1.0) => {
  if (axis === 'x') {
    ball.x += ball.dx > 0 ? amount : -amount;
  } else {
    ball.y += ball.dy > 0 ? amount : -amount;
  }
};

const resetBall = (state: GameState): Ball => ({
  x: 0,
  y: 0,
  dx: BASE_BALL_SPEED * randChoice(state, [1, -1]),
  dy: -BASE_BALL_SPEED,
  onPaddle: true,
  straightFrames: 0,
  trail: [],
  trailMax: 10,
  prevX: 0,
  prevY: 0,
});

const computeBrickTop = (paddleY: number) => {
  const bricksH = ROWS * BRICK_HEIGHT;
  const minTop = TOP_PLAY_Y + 8;
  const idealTop = paddleY - TARGET_MIN_GAP - bricksH;
  return Math.max(minTop, Math.floor(idealTop));
};

const shouldPlaceBrick = (pattern: string, row: number, col: number, cols: number, state: GameState) => {
  if (pattern === 'full') return true;
  if (pattern === 'checker') return (row + col) % 2 === 0;
  if (pattern === 'center_gap') return !(Math.floor(cols / 3) < col && col < Math.floor((2 * cols) / 3));
  if (pattern === 'random') return randFloat(state) >= 0.2;
  return true;
};

const createBricks = (brickTop: number, pattern: string, level: number, state: GameState) => {
  const bricks: Brick[] = [];
  const cols = Math.max(1, Math.floor(WIDTH / BRICK_WIDTH));
  const actualWidth = WIDTH / cols;
  for (let row = 0; row < ROWS; row += 1) {
    const y = brickTop + row * BRICK_HEIGHT;
    for (let col = 0; col < cols; col += 1) {
      if (!shouldPlaceBrick(pattern, row, col, cols, state)) continue;
      const x = Math.floor(col * actualWidth);
      const w = Math.floor((col + 1) * actualWidth) - x;
      const strength = Math.max(1, ROWS - row - Math.max(0, level - 2));
      bricks.push({
        x,
        y,
        w: w - 1,
        h: BRICK_HEIGHT - 2,
        color: COLORS[row % COLORS.length],
        strength,
        hitFlash: 0,
      });
    }
  }
  return bricks;
};

const initState = (): GameState => {
  const paddleY = HEIGHT - PADDLE_HEIGHT - PADDLE_BOTTOM_MARGIN;
  const brickTop = computeBrickTop(paddleY);
  const baseState: GameState = {
    score: 0,
    lives: 3,
    level: 1,
    paddleX: WIDTH / 2 - PADDLE_WIDTH / 2,
    paddleY,
    paddleWidth: PADDLE_WIDTH,
    paddleSpeed: BASE_PADDLE_SPEED,
    paddleBoostSpeed: BOOST_PADDLE_SPEED,
    balls: [],
    bricks: [],
    powerups: [],
    powerupMessage: null,
    powerupTimer: 0,
    powerupColor: WHITE,
    powerupTimers: { expand: 0, shrink: 0, slow: 0, fast: 0, multi_ball: 0 },
    powerupMax: { ...POWERUP_DURATION, multi_ball: 1 },
    brickTop,
    popups: [],
    shake: 0,
    paused: false,
    resuming: false,
    resumeUntil: 0,
    timersFrozen: false,
    multiballTriggeredFrame: false,
    globalMaxBallSpeed: MAX_BALL_SPEED,
    bannerTimer: 60,
    gameOver: false,
    rng: 1 * 9999,
  };
  baseState.balls = [resetBall(baseState)];
  baseState.bricks = createBricks(brickTop, 'full', 1, baseState).map((brick) => ({
    ...brick,
    strength: 1,
  }));
  return baseState;
};

const levelPattern = (level: number) => {
  const patterns = ['full', 'checker', 'center_gap', 'random'];
  return patterns[(level - 1) % patterns.length];
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

const ArkanoidDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(initState());
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const keysRef = useRef({ left: false, right: false, shift: false });
  const [isRunning, setIsRunning] = useState(false);

  const launchBall = () => {
    const state = stateRef.current;
    if (!state.paused && !state.resuming && !state.gameOver) {
      let released = false;
      state.balls.forEach((ball) => {
        if (ball.onPaddle) {
          ball.onPaddle = false;
          released = true;
        }
      });
      if (released) state.timersFrozen = false;
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const state = stateRef.current;
      if (event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === 'ArrowLeft') keysRef.current.left = true;
      if (event.key === 'ArrowRight') keysRef.current.right = true;
      if (event.key === 'Shift') keysRef.current.shift = true;

      if (event.key === ' ') {
        launchBall();
      }

      if (event.key === 'Escape') {
        if (!state.paused && !state.resuming && !state.gameOver) {
          state.paused = true;
        } else if (state.paused) {
          state.paused = false;
          state.resuming = true;
          state.resumeUntil = performance.now() + 3000;
        }
      }

      if (state.gameOver && event.key.toLowerCase() === 'r') {
        stateRef.current = initState();
      }
      if (state.gameOver && event.key.toLowerCase() === 'q') {
        setIsRunning(false);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === 'ArrowLeft') keysRef.current.left = false;
      if (event.key === 'ArrowRight') keysRef.current.right = false;
      if (event.key === 'Shift') keysRef.current.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetGame = () => {
    stateRef.current = initState();
    particlesRef.current = [];
  };

  const renderOnce = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    requestAnimationFrame(() => {
      step();
    });
  };

  const applyPowerup = (state: GameState, type: PowerupType) => {
    if (type === 'expand') {
      state.powerupTimers.shrink = 0;
      state.paddleWidth = Math.min(state.paddleWidth + 24, 220);
      state.powerupTimers.expand = POWERUP_DURATION.expand;
      state.powerupMessage = 'Paddle Expanded!';
      state.powerupColor = GREEN;
    } else if (type === 'shrink') {
      state.powerupTimers.expand = 0;
      state.paddleWidth = Math.max(state.paddleWidth - 24, 70);
      state.powerupTimers.shrink = POWERUP_DURATION.shrink;
      state.powerupMessage = 'Paddle Shrunk!';
      state.powerupColor = RED;
    } else if (type === 'slow') {
      state.paddleSpeed = Math.max(state.paddleSpeed - 1, 3);
      state.balls.forEach((ball) => {
        const newDy = Math.max(Math.abs(ball.dy) - 1, 3);
        ball.dy = ball.dy < 0 ? -newDy : newDy;
        ensureMinHorizontal(ball, state);
        clampSpeed(ball, state.globalMaxBallSpeed);
      });
      state.powerupTimers.slow = POWERUP_DURATION.slow;
      state.powerupMessage = 'Ball Slowed!';
      state.powerupColor = ORANGE;
    } else if (type === 'fast') {
      state.powerupTimers.slow = 0;
      state.globalMaxBallSpeed = 13;
      state.balls.forEach((ball) => {
        ball.dx *= 1.25;
        ball.dy *= 1.25;
        ensureMinHorizontal(ball, state);
        ensureMinVertical(ball, state);
        clampSpeed(ball, state.globalMaxBallSpeed);
      });
      state.powerupTimers.fast = POWERUP_DURATION.fast;
      state.powerupMessage = 'Ball Fast!';
      state.powerupColor = CYAN;
    } else if (type === 'multi_ball') {
      state.multiballTriggeredFrame = true;
      const base = BASE_BALL_SPEED;
      state.shake = Math.max(state.shake, 8);
      [-0.6, 0.0, 0.6].forEach((a) => {
        const nb = resetBall(state);
        nb.onPaddle = false;
        nb.x = state.paddleX + state.paddleWidth / 2;
        nb.y = state.paddleY - BALL_SIZE / 2;
        nb.dx = base * (1.2 * a) + randChoice(state, [-1, 1]) * 3;
        nb.dy = -base - 1;
        ensureMinHorizontal(nb, state);
        clampSpeed(nb, state.globalMaxBallSpeed);
        state.balls.push(nb);
      });
      state.powerupMessage = 'Multi-Ball!';
      state.powerupColor = PURPLE;
    }

    state.powerupTimer = 180;
  };

  const revertPowerup = (state: GameState, type: PowerupType) => {
    if (type === 'expand' || type === 'shrink') {
      if (state.powerupTimers.expand === 0 && state.powerupTimers.shrink === 0) {
        state.paddleWidth = PADDLE_WIDTH;
      }
    } else if (type === 'slow') {
      state.paddleSpeed = BASE_PADDLE_SPEED;
      state.balls.forEach((ball) => {
        ball.dy = BASE_BALL_SPEED * (ball.dy < 0 ? -1 : 1);
        ensureMinHorizontal(ball, state);
        clampSpeed(ball, state.globalMaxBallSpeed);
      });
    } else if (type === 'fast') {
      state.globalMaxBallSpeed = MAX_BALL_SPEED;
      state.balls.forEach((ball) => clampSpeed(ball, state.globalMaxBallSpeed));
    }
  };

  const addPopup = (state: GameState, x: number, y: number, txt = '+10') => {
    state.popups.push({ x, y, dy: -0.6, life: 45, txt });
  };

  const damageBrick = (state: GameState, brick: Brick, ball: Ball) => {
    brick.strength -= 1;
    brick.hitFlash = 6;
    if (brick.strength <= 0) {
      state.bricks = state.bricks.filter((b) => b !== brick);
      state.score += 10;
      addPopup(state, brick.x + brick.w / 2, brick.y + brick.h / 2, '+10');
      const particles = particlesRef.current;
      for (let i = 0; i < 14; i += 1) {
        const angle = randFloat(state) * Math.PI * 2;
        const speed = 1.5 + randFloat(state) * 2.5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const px = brick.x + randFloat(state) * brick.w;
        const py = brick.y + randFloat(state) * brick.h;
        const color = brick.color.map((c) => Math.min(255, Math.max(0, c + Math.floor(randFloat(state) * 40 - 20)))) as RGB;
        particles.push({ x: px, y: py, vx, vy, life: 22 + Math.floor(randFloat(state) * 18), color });
      }
      state.shake = Math.max(state.shake, 3);
      if (randFloat(state) < POWERUP_CHANCE) {
        const type = POWERUP_TYPES[Math.floor(randFloat(state) * POWERUP_TYPES.length)];
        state.powerups.push({
          x: brick.x + brick.w / 2 - POWERUP_SIZE / 2,
          y: brick.y + brick.h / 2 - POWERUP_SIZE / 2,
          type,
          vy: 2.1,
        });
      }
    } else {
      const mix = 0.2 * (ROWS - brick.strength);
      brick.color = [
        Math.floor(brick.color[0] * (1 - mix) + 120 * mix),
        Math.floor(brick.color[1] * (1 - mix) + 120 * mix),
        Math.floor(brick.color[2] * (1 - mix) + 120 * mix),
      ];
    }
    ensureMinHorizontal(ball, state);
    clampSpeed(ball, state.globalMaxBallSpeed);
  };

  const updatePopups = (state: GameState, ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    state.popups = state.popups.filter((popup) => popup.life > 0);
    state.popups.forEach((popup) => {
      popup.y += popup.dy;
      popup.life -= 1;
      const alpha = Math.max(0, Math.min(1, popup.life / 45));
      ctx.fillStyle = toRgb(WHITE, alpha);
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(popup.txt, popup.x + ox, popup.y + oy);
      ctx.textAlign = 'left';
    });
  };

  const drawHUD = (state: GameState, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = toRgb(GREY);
    ctx.fillRect(0, 0, WIDTH, 50);
    ctx.strokeStyle = toRgb(WHITE);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 50);
    ctx.lineTo(WIDTH, 50);
    ctx.stroke();

    ctx.fillStyle = toRgb(WHITE);
    ctx.font = '24px system-ui';
    ctx.fillText(`Score: ${state.score}`, 10, 32);
    ctx.font = '22px system-ui';
    const lvlText = `Level ${state.level}`;
    const lvlWidth = ctx.measureText(lvlText).width;
    ctx.fillText(lvlText, WIDTH / 2 - lvlWidth / 2, 32);

    for (let i = 0; i < state.lives; i += 1) {
      ctx.beginPath();
      ctx.arc(WIDTH - 20 - i * 20, 25, 6, 0, Math.PI * 2);
      ctx.fillStyle = toRgb(WHITE);
      ctx.fill();
    }
  };

  const drawPowerupTimers = (state: GameState, ctx: CanvasRenderingContext2D) => {
    const x = 10;
    const y = 54;
    const barH = 6;
    const barW = 80;
    const spacing = 90;
    const timersFrozen = state.timersFrozen;

    POWERUP_TYPES.forEach((ptype, index) => {
      const timer = state.powerupTimers[ptype];
      if (timer <= 0) return;
      const bx = x + index * spacing;
      ctx.font = '12px system-ui';
      ctx.fillStyle = toRgb(timersFrozen ? [120, 150, 180] : WHITE);
      ctx.fillText(ptype.replace('_', ' ').toUpperCase(), bx, y + 10);

      ctx.fillStyle = toRgb([70, 70, 70]);
      ctx.fillRect(bx, y + 16, barW, barH);
      const denom = Math.max(1, state.powerupMax[ptype]);
      const fillW = Math.max(0, Math.min(barW, Math.floor((timer / denom) * barW)));
      ctx.fillStyle = toRgb(timersFrozen ? [120, 150, 180] : YELLOW);
      ctx.fillRect(bx, y + 16, fillW, barH);
    });
  };

  const drawBrick = (brick: Brick, ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    ctx.fillStyle = toRgb(brick.color);
    drawRoundedRect(ctx, brick.x + ox, brick.y + oy, brick.w, brick.h, 6);
    ctx.fill();
    ctx.fillStyle = toRgb(WHITE, 0.2);
    ctx.fillRect(brick.x + ox + 3, brick.y + oy + 3, brick.w - 6, brick.h / 3);
    if (brick.hitFlash > 0) {
      ctx.fillStyle = toRgb(WHITE, Math.min(0.5, brick.hitFlash * 0.08));
      ctx.fillRect(brick.x + ox, brick.y + oy, brick.w, brick.h);
    }
  };

  const drawPaddle = (state: GameState, ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    let color: RGB = [230, 230, 230];
    if (state.powerupTimers.expand > 0) color = [180, 220, 255];
    if (state.powerupTimers.shrink > 0) color = [255, 180, 180];
    ctx.fillStyle = toRgb(color);
    drawRoundedRect(ctx, state.paddleX + ox, state.paddleY + oy, state.paddleWidth, PADDLE_HEIGHT, 10);
    ctx.fill();
    ctx.fillStyle = toRgb(WHITE);
    drawRoundedRect(ctx, state.paddleX + ox + 6, state.paddleY + oy + 3, state.paddleWidth - 12, 4, 6);
    ctx.fill();
  };

  const drawBall = (ball: Ball, ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    ball.trail.forEach((pos, i) => {
      const alpha = Math.max(0, Math.min(1, (i + 1) / Math.max(1, ball.trail.length)));
      ctx.fillStyle = toRgb(WHITE, alpha * 0.3);
      ctx.beginPath();
      ctx.arc(pos.x + ox, pos.y + oy, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    const glowLayers = [BALL_SIZE * 1.5, BALL_SIZE * 2, BALL_SIZE * 2.5];
    const glowAlpha = [0.2, 0.1, 0.05];
    glowLayers.forEach((radius, idx) => {
      ctx.fillStyle = toRgb([120, 200, 255], glowAlpha[idx]);
      ctx.beginPath();
      ctx.arc(ball.x + ox, ball.y + oy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = toRgb(WHITE);
    ctx.beginPath();
    ctx.arc(ball.x + ox, ball.y + oy, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPowerup = (powerup: Powerup, ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const cx = powerup.x + POWERUP_SIZE / 2 + ox;
    const cy = powerup.y + POWERUP_SIZE / 2 + oy;
    ctx.fillStyle = toRgb([30, 30, 30]);
    ctx.beginPath();
    ctx.arc(cx, cy, POWERUP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = toRgb([80, 80, 80]);
    ctx.lineWidth = 2;
    ctx.stroke();

    if (powerup.type === 'expand' || powerup.type === 'shrink') {
      ctx.fillStyle = toRgb(YELLOW);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = toRgb(BLACK);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = toRgb(BLACK);
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy);
      ctx.lineTo(cx + 3, cy);
      ctx.stroke();
    } else if (powerup.type === 'slow') {
      ctx.strokeStyle = toRgb(ORANGE);
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, cy - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 3, cy);
      ctx.stroke();
    } else if (powerup.type === 'multi_ball') {
      ctx.fillStyle = toRgb(PURPLE);
      [[-3, -2], [3, -2], [0, 3]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx, cy + dy, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (powerup.type === 'fast') {
      ctx.fillStyle = toRgb(CYAN);
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx - 3, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - 2, cy + 6);
      ctx.lineTo(cx + 4, cy - 2);
      ctx.lineTo(cx + 1, cy - 2);
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, ox: number, oy: number) => {
    const particles = particlesRef.current;
    particles.forEach((particle) => {
      const alpha = Math.max(0.2, Math.min(1, particle.life / 40));
      ctx.fillStyle = toRgb(particle.color, alpha);
      ctx.fillRect(particle.x + ox, particle.y + oy, 4, 4);
    });
  };

  const updateParticles = () => {
    const particles = particlesRef.current;
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.08;
      particle.life -= 1;
    });
    particlesRef.current = particles.filter((particle) => particle.life > 0);
  };

  const step = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;
    state.multiballTriggeredFrame = false;

    if (state.paused) {
      ctx.fillStyle = toRgb([0, 0, 0]);
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = toRgb(WHITE);
      ctx.font = '28px system-ui';
      ctx.fillText('PAUSED — Press ESC to Resume', WIDTH / 2 - 220, HEIGHT / 2);
      if (isRunning) rafRef.current = requestAnimationFrame(step);
      return;
    }

    if (state.resuming) {
      const remaining = Math.max(0, state.resumeUntil - performance.now());
      if (remaining === 0) state.resuming = false;
      const secs = Math.max(1, Math.ceil(remaining / 1000));
      ctx.fillStyle = toRgb([0, 0, 0]);
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = toRgb(WHITE);
      ctx.font = '48px system-ui';
      ctx.fillText(String(secs), WIDTH / 2 - 12, HEIGHT / 2);
      if (isRunning) rafRef.current = requestAnimationFrame(step);
      return;
    }

    const prevPaddleX = state.paddleX;
    const boosting = keysRef.current.shift;
    if (keysRef.current.left) {
      state.paddleX -= boosting ? state.paddleBoostSpeed : state.paddleSpeed;
    }
    if (keysRef.current.right) {
      state.paddleX += boosting ? state.paddleBoostSpeed : state.paddleSpeed;
    }
    state.paddleX = Math.max(0, Math.min(WIDTH - state.paddleWidth, state.paddleX));
    const paddleVx = state.paddleX - prevPaddleX;

    updateParticles();

    state.balls.slice().forEach((ball) => {
      if (ball.onPaddle) {
        ball.x = state.paddleX + state.paddleWidth / 2;
        ball.y = state.paddleY - BALL_SIZE / 2;
        ball.straightFrames = 0;
        ball.trail = [];
        return;
      }

      ball.prevX = ball.x;
      ball.prevY = ball.y;

      if (Math.abs(ball.dx) < MIN_HORZ_SPEED * 0.8 && Math.abs(ball.dy) > 3.5) {
        ball.straightFrames += 1;
      } else {
        ball.straightFrames = 0;
      }
      if (ball.straightFrames > 45) {
        ball.dx += randChoice(state, [-1, 1]) * (1.2 + randFloat(state) * 0.6);
        ensureMinHorizontal(ball, state, MIN_HORZ_SPEED + 0.2);
        clampSpeed(ball, state.globalMaxBallSpeed);
        ball.straightFrames = 0;
      }

      ball.trail.push({ x: ball.prevX, y: ball.prevY });
      if (ball.trail.length > ball.trailMax) ball.trail.shift();

      ball.x += ball.dx;
      if (ball.x - BALL_SIZE / 2 <= 0 || ball.x + BALL_SIZE / 2 >= WIDTH) {
        ball.dx *= -1;
        ball.x = Math.max(BALL_SIZE / 2, Math.min(WIDTH - BALL_SIZE / 2, ball.x));
        ensureMinHorizontal(ball, state);
        clampSpeed(ball, state.globalMaxBallSpeed);
        postSeparate(ball, 'x', 1.0);
      }

      const ballRectX = {
        x: ball.x - BALL_SIZE / 2,
        y: ball.y - BALL_SIZE / 2,
        w: BALL_SIZE,
        h: BALL_SIZE,
      };

      for (const brick of state.bricks) {
        if (
          ballRectX.x < brick.x + brick.w &&
          ballRectX.x + ballRectX.w > brick.x &&
          ballRectX.y < brick.y + brick.h &&
          ballRectX.y + ballRectX.h > brick.y
        ) {
          ball.dx *= -1;
          if (ball.x > brick.x + brick.w / 2) {
            ball.x = brick.x + brick.w + BALL_SIZE / 2;
          } else {
            ball.x = brick.x - BALL_SIZE / 2;
          }
          damageBrick(state, brick, ball);
          ensureMinHorizontal(ball, state);
          clampSpeed(ball, state.globalMaxBallSpeed);
          break;
        }
      }

      ball.y += ball.dy;
      if (ball.y - BALL_SIZE / 2 <= TOP_PLAY_Y) {
        ball.y = TOP_PLAY_Y + BALL_SIZE / 2;
        ball.dy *= -1;
        ensureMinHorizontal(ball, state);
        clampSpeed(ball, state.globalMaxBallSpeed);
        postSeparate(ball, 'y', 1.0);
      }

      const ballRectY = {
        x: ball.x - BALL_SIZE / 2,
        y: ball.y - BALL_SIZE / 2,
        w: BALL_SIZE,
        h: BALL_SIZE,
      };

      const paddleRect = {
        x: state.paddleX,
        y: state.paddleY,
        w: state.paddleWidth,
        h: PADDLE_HEIGHT,
      };

      if (
        ballRectY.x < paddleRect.x + paddleRect.w &&
        ballRectY.x + ballRectY.w > paddleRect.x &&
        ballRectY.y < paddleRect.y + paddleRect.h &&
        ballRectY.y + ballRectY.h > paddleRect.y &&
        ball.dy > 0
      ) {
        ball.y = paddleRect.y - BALL_SIZE / 2;
        ball.dy *= -1;
        const hitPos = ball.x - (state.paddleX + state.paddleWidth / 2);
        ball.dx += hitPos / 90.0;
        ball.dx += paddleVx * 0.15;
        ensureMinHorizontal(ball, state);
        clampSpeed(ball, state.globalMaxBallSpeed);
        postSeparate(ball, 'y', 1.0);
      }

      let collidedY = false;
      for (const brick of state.bricks) {
        if (
          ballRectY.x < brick.x + brick.w &&
          ballRectY.x + ballRectY.w > brick.x &&
          ballRectY.y < brick.y + brick.h &&
          ballRectY.y + ballRectY.h > brick.y
        ) {
          ball.dy *= -1;
          if (ball.y > brick.y + brick.h / 2) {
            ball.y = brick.y + brick.h + BALL_SIZE / 2;
          } else {
            ball.y = brick.y - BALL_SIZE / 2;
          }
          damageBrick(state, brick, ball);
          ensureMinHorizontal(ball, state);
          clampSpeed(ball, state.globalMaxBallSpeed);
          collidedY = true;
          break;
        }
      }

      if (collidedY) {
        // no-op, recalculated in next frame
      }

      if (ball.y - BALL_SIZE / 2 >= HEIGHT) {
        state.balls = state.balls.filter((b) => b !== ball);
        if (state.balls.length === 0) {
          state.lives -= 1;
          state.shake = Math.max(state.shake, 10);
          if (state.lives > 0) {
            state.balls = [resetBall(state)];
            state.timersFrozen = !state.multiballTriggeredFrame;
          } else {
            state.gameOver = true;
          }
        }
      }
    });

    state.powerups = state.powerups.filter((powerup) => powerup.y <= HEIGHT + POWERUP_SIZE);
    state.powerups.forEach((powerup) => {
      powerup.y += powerup.vy;
      if (
        powerup.x < state.paddleX + state.paddleWidth &&
        powerup.x + POWERUP_SIZE > state.paddleX &&
        powerup.y < state.paddleY + PADDLE_HEIGHT &&
        powerup.y + POWERUP_SIZE > state.paddleY
      ) {
        applyPowerup(state, powerup.type);
        state.powerups = state.powerups.filter((p) => p !== powerup);
      }
    });

    if (!state.timersFrozen) {
      POWERUP_TYPES.forEach((ptype) => {
        if (state.powerupTimers[ptype] > 0) {
          state.powerupTimers[ptype] -= 1;
          if (state.powerupTimers[ptype] === 0) {
            revertPowerup(state, ptype);
          }
        }
      });
    }

    if (state.bricks.length === 0) {
      state.level += 1;
      state.paddleWidth = PADDLE_WIDTH;
      state.paddleSpeed = BASE_PADDLE_SPEED;
      state.powerups = [];
      POWERUP_TYPES.forEach((ptype) => {
        state.powerupTimers[ptype] = 0;
      });
      state.balls = [resetBall(state)];
      state.brickTop = computeBrickTop(state.paddleY);
      state.rng = state.level * 9999;
      const pattern = levelPattern(state.level);
      state.bricks = createBricks(state.brickTop, pattern, state.level, state);
      state.bannerTimer = 60;
    }

    const ox = state.shake > 0 ? Math.floor(randFloat(state) * (state.shake * 2 + 1) - state.shake) : 0;
    const oy = state.shake > 0 ? Math.floor(randFloat(state) * (state.shake * 2 + 1) - state.shake) : 0;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - 1);

    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, 'rgb(12, 12, 20)');
    gradient.addColorStop(1, 'rgb(30, 36, 60)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawParticles(ctx, ox, oy);
    drawPaddle(state, ctx, ox, oy);
    state.balls.forEach((ball) => drawBall(ball, ctx, ox, oy));

    state.bricks.forEach((brick) => {
      if (brick.hitFlash > 0) brick.hitFlash -= 1;
      drawBrick(brick, ctx, ox, oy);
    });

    state.powerups.forEach((powerup) => drawPowerup(powerup, ctx, ox, oy));

    updatePopups(state, ctx, ox, oy);

    drawHUD(state, ctx);
    drawPowerupTimers(state, ctx);

    if (state.powerupMessage && state.powerupTimer > 0) {
      const alpha = Math.min(1, state.powerupTimer / 180);
      ctx.fillStyle = toRgb(state.powerupColor, alpha);
      ctx.font = '18px system-ui';
      const msgWidth = ctx.measureText(state.powerupMessage).width;
      ctx.fillText(state.powerupMessage, WIDTH / 2 - msgWidth / 2, 78);
      state.powerupTimer -= 1;
      if (state.powerupTimer === 0) state.powerupMessage = null;
    }

    if (state.bannerTimer > 0) {
      ctx.fillStyle = toRgb([0, 0, 0], 0.55);
      const text = `Level ${state.level}`;
      ctx.font = '24px system-ui';
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(WIDTH / 2 - textWidth / 2 - 12, HEIGHT / 2 - 28, textWidth + 24, 40);
      ctx.fillStyle = toRgb(WHITE);
      ctx.fillText(text, WIDTH / 2 - textWidth / 2, HEIGHT / 2);
      state.bannerTimer -= 1;
    }

    if (state.gameOver) {
      ctx.fillStyle = toRgb([0, 0, 0], 0.7);
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = toRgb(WHITE);
      ctx.font = '32px system-ui';
      ctx.fillText('Game Over', WIDTH / 2 - 90, HEIGHT / 2 - 80);
      ctx.font = '20px system-ui';
      ctx.fillText(`Score: ${state.score}`, WIDTH / 2 - 60, HEIGHT / 2 - 30);
      ctx.fillText(`Level: ${state.level}`, WIDTH / 2 - 58, HEIGHT / 2);
      ctx.fillText('Press R to Replay or Q to Quit', WIDTH / 2 - 160, HEIGHT / 2 + 40);
    }

    if (isRunning) {
      rafRef.current = requestAnimationFrame(step);
    }
  };

  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(step);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning]);

  return (
    <div className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm lg:h-[640px] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-700">Play the demo</p>
          <p className="text-xs text-slate-500">Arrow keys to move. Space to launch. Shift for boost. ESC pauses.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={(event) => {
              setIsRunning((prev) => !prev);
              event.currentTarget.blur();
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
          >
            {isRunning ? 'Pause Demo' : 'Run Demo'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetGame();
              setIsRunning(false);
              renderOnce();
            }}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:border-slate-400 transition"
          >
            Reset
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex-1">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          tabIndex={0}
          onClick={() => {
            launchBall();
            canvasRef.current?.focus();
          }}
          className="w-full h-full block focus:outline-none"
        />
      </div>
    </div>
  );
};

export default ArkanoidDemo;
