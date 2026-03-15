export const ARKANOID_CODE = `import pygame
import sys
import random
import math

# =========================
# Window & layout settings
# =========================
WIDTH, HEIGHT = 800, 720          # window size
PADDLE_BOTTOM_MARGIN = 22         # distance from paddle to window bottom
TARGET_MIN_GAP = 420              # min gap: bottom brick row -> paddle
ROWS = 5

# Initialize Pygame
pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Ultimate Arkanoid — Glow Edition")
clock = pygame.time.Clock()

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED   = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE  = (0, 0, 255)
YELLOW= (255, 255, 0)
ORANGE= (255, 165, 0)
PURPLE = (128, 0, 128)
BROWN = (150, 75, 0)
GREY  = (50, 50, 50)
CYAN = (0, 200, 200)

# Game constants
PADDLE_WIDTH, PADDLE_HEIGHT = 120, 18
BALL_SIZE = 14
BRICK_WIDTH, BRICK_HEIGHT = 80, 28
POWERUP_SIZE = 22
TOP_PLAY_Y = 10  # soft ceiling just under HUD (HUD is 0..50)

# Speeds
BASE_BALL_SPEED = 7               # faster early game
BASE_PADDLE_SPEED = 8
BOOST_PADDLE_SPEED = 12
MAX_BALL_SPEED = 10
# Runtime max speed (can be raised by powerups)
GLOBAL_MAX_BALL_SPEED = MAX_BALL_SPEED
MIN_HORZ_SPEED = 0.6  # avoid perfectly vertical traps
# Speeds (add these)
MIN_VERT_SPEED = 2.0            # ensure the ball always has some vertical speed
MAX_PADDLE_DEFLECT_DEG = 65     # max deflection from straight up on paddle hits

#PowerUp Timer
POWERUP_DURATION = {
    'expand': 900,
    'shrink': 900,
    'slow':   450,
    'fast':   450,
    'multi_ball': 0,   # not timed
}

# Drops
POWERUP_CHANCE = 0.35             # more powerups to speed up level 1

COLORS = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, BROWN]
POWERUP_TYPES = ['expand', 'shrink', 'slow', 'fast', 'multi_ball']

font = pygame.font.Font(None, 36)
small_font = pygame.font.Font(None, 24)

# ===== Visual surfaces (precomputed) =====
# Gradient background cache
BG_SURF = pygame.Surface((WIDTH, HEIGHT))
for y in range(HEIGHT):
    # vertical gradient: dark -> slightly lighter
    t = y / HEIGHT
    r = int(12 + 18 * t)
    g = int(12 + 24 * t)
    b = int(20 + 40 * t)
    pygame.draw.line(BG_SURF, (r, g, b), (0, y), (WIDTH, y))

# ===== Helpers =====

def clamp_speed(ball, max_speed=None):
    if max_speed is None:
        max_speed = GLOBAL_MAX_BALL_SPEED
    v2 = ball['dx']**2 + ball['dy']**2
    if v2 > max_speed**2:
        s = max_speed / (v2 ** 0.5)
        ball['dx'] *= s
        ball['dy'] *= s

def ensure_min_horizontal(ball, min_h=MIN_HORZ_SPEED):
    speed = (ball['dx']**2 + ball['dy']**2) ** 0.5
    if speed == 0:
        ball['dx'] = min_h * random.choice([-1, 1])
        ball['dy'] = -BASE_BALL_SPEED
        return
    if abs(ball['dx']) < min_h:
        sign = -1 if ball['dx'] < 0 else (1 if ball['dx'] > 0 else random.choice([-1, 1]))
        new_dx = min(min_h, speed * 0.9) * sign
        rem = max(speed**2 - new_dx**2, 1.0)
        new_dy = math.copysign(rem ** 0.5, ball['dy'] if ball['dy'] != 0 else -1)
        ball['dx'], ball['dy'] = new_dx, new_dy

def ensure_min_vertical(ball, min_v=MIN_VERT_SPEED):
    speed = (ball['dx']**2 + ball['dy']**2) ** 0.5
    if speed == 0:
        ball['dx'] = MIN_HORZ_SPEED * random.choice([-1, 1])
        ball['dy'] = -min_v
        return
    if abs(ball['dy']) < min_v and speed > min_v:
        sign = -1 if ball['dy'] < 0 else 1 if ball['dy'] > 0 else -1
        new_dy = sign * min_v
        new_dx_mag = max(speed**2 - min_v**2, 0.0) ** 0.5
        ball['dx'] = math.copysign(new_dx_mag, ball['dx'] if ball['dx'] != 0 else random.choice([-1, 1]))
        ball['dy'] = new_dy

def post_separate(ball, axis, amount=1.0):
    if axis == 'x':
        ball['x'] += amount if ball['dx'] > 0 else -amount
    elif axis == 'y':
        ball['y'] += amount if ball['dy'] > 0 else -amount

# ===== Entities =====

def reset_ball():
    return {
        'x': 0,
        'y': 0,
        'dx': BASE_BALL_SPEED * random.choice((1, -1)),
        'dy': -BASE_BALL_SPEED,
        'on_paddle': True,
        'straight_frames': 0,
        'trail': [],
        'trail_max': 10,
        'prev_x': 0,
        'prev_y': 0,
    }

def compute_brick_top(height, paddle_y, min_gap, rows, row_h):
    bricks_h = rows * row_h
    min_top = TOP_PLAY_Y + 8
    ideal_top = paddle_y - min_gap - bricks_h
    return max(min_top, int(ideal_top))

# ---- Bricks: patterns & creation ----
def should_place_brick(pattern, row, col, cols):
    if pattern == 'full':
        return True
    if pattern == 'checker':
        return ((row + col) % 2) == 0
    if pattern == 'center_gap':
        return not (cols//3 < col < 2*cols//3)
    if pattern == 'random':
        return random.random() >= 0.2
    return True

def create_bricks(brick_top, pattern='full', level=1):
    bricks = []
    cols = max(1, WIDTH // BRICK_WIDTH)
    actual_width = WIDTH / cols
    for row in range(ROWS):
        y = brick_top + row * BRICK_HEIGHT
        for col in range(cols):
            if not should_place_brick(pattern, row, col, cols):
                continue
            x = int(col * actual_width)
            w = int((col + 1) * actual_width) - x
            rect = pygame.Rect(x, y, w - 1, BRICK_HEIGHT - 2)
            strength = max(1, ROWS - row - max(0, level - 2))
            bricks.append({'rect': rect, 'color': COLORS[row % len(COLORS)],
                           'strength': strength, 'hit_flash': 0})
    return bricks

# particles for brick explosions
PARTICLES = []

def spawn_particles(rect, base_color, count=12):
    for _ in range(count):
        angle = random.uniform(0, math.tau)
        speed = random.uniform(1.5, 4.0)
        vx, vy = math.cos(angle)*speed, math.sin(angle)*speed
        px = rect.x + random.uniform(0, rect.w)
        py = rect.y + random.uniform(0, rect.h)
        color = tuple(min(255, max(0, c + random.randint(-20, 20))) for c in base_color)
        PARTICLES.append({'x': px, 'y': py, 'vx': vx, 'vy': vy, 'life': random.randint(22, 40), 'color': color})

# powerups

def create_powerup(x, y):
    t = random.choice(POWERUP_TYPES)
    return {'rect': pygame.Rect(x, y, POWERUP_SIZE, POWERUP_SIZE), 'type': t, 'vy': 2.1, 'spin': random.uniform(-0.1, 0.1)}

# ===== Game-state transforms =====

def apply_powerup(t, gs):
    if t == 'expand':
        gs['powerup_timers']['shrink'] = 0
        gs['PADDLE_WIDTH'] = min(gs['PADDLE_WIDTH'] + 24, 220)
        gs['powerup_timers']['expand'] = POWERUP_DURATION['expand']
        gs['powerup_message'] = "Paddle Expanded!"
        gs['powerup_color'] = GREEN

    elif t == 'shrink':
        gs['powerup_timers']['expand'] = 0
        gs['PADDLE_WIDTH'] = max(gs['PADDLE_WIDTH'] - 24, 70)
        gs['powerup_timers']['shrink'] = POWERUP_DURATION['shrink']
        gs['powerup_message'] = "Paddle Shrunk!"
        gs['powerup_color'] = RED

    elif t == 'slow':
        gs['paddle_speed'] = max(gs['paddle_speed'] - 1, 3)
        for b in gs['balls']:
            new_dy = max(abs(b['dy']) - 1, 3)
            b['dy'] = -new_dy if b['dy'] < 0 else new_dy
            ensure_min_horizontal(b)
            clamp_speed(b)
        gs['powerup_timers']['slow'] = POWERUP_DURATION['slow']
        gs['powerup_message'] = "Ball Slowed!"
        gs['powerup_color'] = ORANGE

    elif t == 'fast':
        gs['powerup_timers']['slow'] = 0
        global GLOBAL_MAX_BALL_SPEED
        GLOBAL_MAX_BALL_SPEED = 13
        for b in gs['balls']:
            b['dx'] *= 1.25
            b['dy'] *= 1.25
            ensure_min_horizontal(b)
            ensure_min_vertical(b)
            clamp_speed(b)
        gs['powerup_timers']['fast'] = POWERUP_DURATION['fast']
        gs['powerup_message'] = "Ball Fast!"
        gs['powerup_color'] = CYAN

    elif t == 'multi_ball':
        # ★ mark that multiball happened this frame
        gs['multiball_triggered_frame'] = True
        base = BASE_BALL_SPEED
        gs['shake'] = max(gs['shake'], 8)
        for a in [-0.6, 0.0, 0.6]:
            nb = reset_ball()
            nb['on_paddle'] = False
            nb['x'] = gs['paddle_x'] + gs['PADDLE_WIDTH'] // 2
            nb['y'] = gs['paddle_y'] - BALL_SIZE//2
            nb['dx'] = base * (1.2 * a) + random.choice([-1, 1]) * 3
            nb['dy'] = -base - 1
            ensure_min_horizontal(nb)
            clamp_speed(nb)
            gs['balls'].append(nb)
        gs['powerup_message'] = "Multi-Ball!"
        gs['powerup_color'] = PURPLE

    gs['powerup_timer'] = 180

def revert_powerup(t, gs):
    if t in ('expand', 'shrink'):
        if gs['powerup_timers']['expand'] == 0 and gs['powerup_timers']['shrink'] == 0:
            gs['PADDLE_WIDTH'] = PADDLE_WIDTH
    elif t == 'slow':
        gs['paddle_speed'] = BASE_PADDLE_SPEED
        for b in gs['balls']:
            b['dy'] = BASE_BALL_SPEED * (-1 if b['dy'] < 0 else 1)
            ensure_min_horizontal(b)
            clamp_speed(b)
    elif t == 'fast':
        global GLOBAL_MAX_BALL_SPEED
        GLOBAL_MAX_BALL_SPEED = MAX_BALL_SPEED
        for b in gs['balls']:
            clamp_speed(b)

# ===== Drawing (offset-aware for screen shake) =====

def draw_hud(gs):
    pygame.draw.rect(screen, GREY, (0, 0, WIDTH, 50))
    pygame.draw.line(screen, WHITE, (0, 50), (WIDTH, 50), 2)
    screen.blit(font.render(f"Score: {gs['score']}", True, WHITE), (10, 8))
    lvl = font.render(f"Level {gs['level']}", True, WHITE)
    screen.blit(lvl, (WIDTH // 2 - lvl.get_width() // 2, 8))
    for i in range(gs['lives']):
        pygame.draw.circle(screen, WHITE, (WIDTH - 20 - i*20, 25), 6)

def draw_powerup_timers(gs):
    x, y = 10, 54
    bar_h, bar_w, spacing = 6, 80, 90
    timers_frozen = gs.get('timers_frozen', False)

    for i, (ptype, timer) in enumerate(gs['powerup_timers'].items()):
        if timer <= 0:
            continue

        bx = x + i * spacing

        # label
        label_col = (120, 150, 180) if timers_frozen else WHITE
        screen.blit(small_font.render(ptype.replace("_", " ").title(), True, label_col), (bx, y))

        # bar bg
        pygame.draw.rect(screen, (70, 70, 70), (bx, y + 16, bar_w, bar_h), border_radius=4)

        # progress
        denom = max(1, gs['powerup_max'].get(ptype, timer))
        fill_w = int((timer / denom) * bar_w)
        fill_w = max(0, min(bar_w, fill_w))

        fill_col = (120, 150, 180) if timers_frozen else YELLOW
        pygame.draw.rect(screen, fill_col, (bx, y + 16, fill_w, bar_h), border_radius=4)


def draw_brick(brick, ox=0, oy=0):
    r = brick['rect'].move(ox, oy)
    pygame.draw.rect(screen, brick['color'], r, border_radius=6)
    gloss = pygame.Rect(r.x+3, r.y+3, r.w-6, r.h//3)
    s = pygame.Surface(gloss.size, pygame.SRCALPHA)
    s.fill((255, 255, 255, 40))
    screen.blit(s, gloss.topleft)
    if brick['hit_flash'] > 0:
        overlay = pygame.Surface((r.w, r.h), pygame.SRCALPHA)
        a = min(120, brick['hit_flash'] * 10)
        overlay.fill((255, 255, 255, a))
        screen.blit(overlay, r.topleft)

def draw_paddle(gs, rect, ox=0, oy=0):
    r = rect.move(ox, oy)
    color = (180, 220, 255) if gs['powerup_timers']['expand']>0 else (255, 180, 180) if gs['powerup_timers']['shrink']>0 else (230, 230, 230)
    pygame.draw.rect(screen, color, r, border_radius=10)
    highlight = pygame.Rect(r.x+6, r.y+3, r.w-12, 4)
    pygame.draw.rect(screen, (255,255,255), highlight, border_radius=6)

def draw_ball(ball, ox=0, oy=0):
    cx, cy = int(ball['x'] + ox), int(ball['y'] + oy)
    for i, (tx, ty) in enumerate(ball['trail']):
        alpha = int(180 * (i+1) / max(1, len(ball['trail'])))
        s = pygame.Surface((BALL_SIZE, BALL_SIZE), pygame.SRCALPHA)
        pygame.draw.circle(s, (255, 255, 255, alpha//3), (BALL_SIZE//2, BALL_SIZE//2), BALL_SIZE//2)
        screen.blit(s, (int(tx + ox), int(ty + oy)))
    for radius, a in [(BALL_SIZE*1.5, 50), (BALL_SIZE*2, 26), (BALL_SIZE*2.5, 12)]:
        surf = pygame.Surface((radius*2, radius*2), pygame.SRCALPHA)
        pygame.draw.circle(surf, (120, 200, 255, a), (radius, radius), radius)
        screen.blit(surf, (cx - radius, cy - radius))
    pygame.draw.circle(screen, WHITE, (cx, cy), BALL_SIZE//2)

def draw_powerup_icon(p, ox=0, oy=0):
    r = p['rect'].move(ox, oy)
    center = (r.centerx, r.centery)
    pygame.draw.circle(screen, (30,30,30), center, r.w//2)
    pygame.draw.circle(screen, (80,80,80), center, r.w//2, 2)
    if p['type'] in ('expand', 'shrink'):
        pygame.draw.circle(screen, YELLOW, center, 5)
        pygame.draw.circle(screen, BLACK, center, 5, 2)
        pygame.draw.line(screen, BLACK, (center[0]-3, center[1]), (center[0]+3, center[1]), 2)
    elif p['type'] == 'slow':
        pygame.draw.circle(screen, ORANGE, center, 6, 2)
        pygame.draw.line(screen, ORANGE, center, (center[0], center[1]-4), 2)
        pygame.draw.line(screen, ORANGE, center, (center[0]+3, center[1]), 2)
    elif p['type'] == 'multi_ball':
        pygame.draw.circle(screen, PURPLE, (center[0]-3, center[1]-2), 3)
        pygame.draw.circle(screen, PURPLE, (center[0]+3, center[1]-2), 3)
        pygame.draw.circle(screen, PURPLE, (center[0], center[1]+3), 3)
    elif p['type'] == 'fast':
        x, y = center
        pygame.draw.polygon(screen, CYAN, [
            (x, y-6), (x-3, y), (x, y), (x-2, y+6), (x+4, y-2), (x+1, y-2)
        ])

def draw_particles(ox=0, oy=0):
    for prt in PARTICLES:
        s = pygame.Surface((4,4), pygame.SRCALPHA)
        a = max(20, int(255 * (prt['life']/40)))
        pygame.draw.rect(s, (*prt['color'], a), (0,0,4,4))
        screen.blit(s, (prt['x'] + ox, prt['y'] + oy))

# ===== Init & Loop =====

def init_game_state():
    paddle_y = HEIGHT - PADDLE_HEIGHT - PADDLE_BOTTOM_MARGIN
    brick_top = compute_brick_top(HEIGHT, paddle_y, TARGET_MIN_GAP, ROWS, BRICK_HEIGHT)
    ball = reset_ball()

    random.seed(1 * 9999)
    bricks = create_bricks(brick_top, pattern='full', level=1)
    for br in bricks:
        br['strength'] = 1

    return {
        'score': 0,
        'lives': 3,
        'level': 1,
        'paddle_x': WIDTH // 2 - PADDLE_WIDTH // 2,
        'paddle_y': paddle_y,
        'PADDLE_WIDTH': PADDLE_WIDTH,
        'paddle_speed': BASE_PADDLE_SPEED,
        'paddle_boost_speed': BOOST_PADDLE_SPEED,
        'balls': [ball],
        'bricks': bricks,
        'powerups': [],
        'powerup_message': None,
        'powerup_timer': 0,
        'powerup_timers': {ptype: 0 for ptype in POWERUP_TYPES},
        'powerup_color': WHITE,
        'brick_top': brick_top,
        'popups': [],
        'shake': 0,
        'paused': False,
        'resuming': False,
        'resume_until': 0,
        'banner_timer': 60,
        'prev_paddle_x': WIDTH // 2 - PADDLE_WIDTH // 2,
        # ★ new flags for timer freeze logic
        'timers_frozen': False,
        'multiball_triggered_frame': False,
        'powerup_timers': {ptype: 0 for ptype in POWERUP_TYPES},
        'powerup_max': {k: (v if v > 0 else 1) for k, v in POWERUP_DURATION.items()},  # ← NEW
    }

def level_pattern(level):
    patterns = ['full', 'checker', 'center_gap', 'random']
    return patterns[(level - 1) % len(patterns)]

def add_popup(gs, x, y, txt='+10'):
    gs['popups'].append({'x': x, 'y': y, 'dy': -0.6, 'life': 45, 'txt': txt})

def update_popups(gs, ox=0, oy=0):
    for p in gs['popups'][:]:
        p['y'] += p['dy']; p['life'] -= 1
        alpha = int(255 * p['life'] / 45)
        surf = small_font.render(p['txt'], True, WHITE)
        surf.set_alpha(alpha)
        screen.blit(surf, (p['x'] + ox - surf.get_width()//2, p['y'] + oy))
        if p['life'] <= 0: gs['popups'].remove(p)

def game_loop(gs):
    running = True
    while running:
        # ★ reset transient multiball flag each frame
        gs['multiball_triggered_frame'] = False

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if not gs['paused'] and not gs['resuming']:
                        gs['paused'] = True
                    elif gs['paused']:
                        gs['paused'] = False
                        gs['resuming'] = True
                        gs['resume_until'] = pygame.time.get_ticks() + 3000  # 3 seconds
                elif event.key == pygame.K_SPACE:
                    # Only launch when not paused AND not counting down
                    if not gs['paused'] and not gs['resuming']:
                        any_released = False
                        for b in gs['balls']:
                            if b['on_paddle']:
                                b['on_paddle'] = False
                                any_released = True
                        if any_released:
                            gs['timers_frozen'] = False  # ★ unfreeze on actual launch

        if gs['paused']:
            overlay = pygame.Surface((WIDTH, HEIGHT)); overlay.set_alpha(160); overlay.fill((0, 0, 0))
            screen.blit(BG_SURF, (0, 0))
            screen.blit(overlay, (0, 0))
            msg = font.render("PAUSED — Press ESC to Resume", True, WHITE)
            screen.blit(msg, (WIDTH//2 - msg.get_width()//2, HEIGHT//2 - 20))
            pygame.display.flip()
            clock.tick(15)
            continue

        # compute paddle velocity
        prev_px = gs.get('prev_paddle_x', gs['paddle_x'])
        keys = pygame.key.get_pressed()
        boosting = keys[pygame.K_LSHIFT] or keys[pygame.K_RSHIFT] or keys[pygame.K_SPACE]
        if keys[pygame.K_LEFT]:
            gs['paddle_x'] -= gs['paddle_boost_speed'] if boosting else gs['paddle_speed']
        if keys[pygame.K_RIGHT]:
            gs['paddle_x'] += gs['paddle_boost_speed'] if boosting else gs['paddle_speed']
        gs['paddle_x'] = max(0, min(WIDTH - gs['PADDLE_WIDTH'], gs['paddle_x']))
        paddle_vx = gs['paddle_x'] - prev_px
        gs['prev_paddle_x'] = gs['paddle_x']

        # === Resuming countdown ===
        if gs['resuming']:
            remaining = max(0, gs['resume_until'] - pygame.time.get_ticks())
            if remaining == 0:
                gs['resuming'] = False
            ox = 0; oy = 0
            screen.blit(BG_SURF, (ox, oy))
            draw_particles(ox, oy)

            paddle_rect = pygame.Rect(gs['paddle_x'], gs['paddle_y'], gs['PADDLE_WIDTH'], PADDLE_HEIGHT)
            draw_paddle(gs, paddle_rect, ox, oy)
            for b in gs['balls']:
                draw_ball(b, ox, oy)
            for br in gs['bricks']:
                draw_brick(br, ox, oy)
            for p in gs['powerups']:
                draw_powerup_icon(p, ox, oy)
            update_popups(gs, ox, oy)

            draw_hud(gs)
            draw_powerup_timers(gs)

            overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
            overlay.fill((0,0,0,140))
            screen.blit(overlay, (0,0))

            secs = max(1, (remaining + 999) // 1000)
            txt = font.render(str(secs), True, WHITE)
            screen.blit(txt, (WIDTH//2 - txt.get_width()//2, HEIGHT//2 - txt.get_height()//2))

            pygame.display.flip()
            clock.tick(60)
            continue

        paddle_rect = pygame.Rect(gs['paddle_x'], gs['paddle_y'], gs['PADDLE_WIDTH'], PADDLE_HEIGHT)

        # update particles
        for prt in PARTICLES[:]:
            prt['x'] += prt['vx']
            prt['y'] += prt['vy']
            prt['vy'] += 0.08
            prt['life'] -= 1
            if prt['life'] <= 0:
                PARTICLES.remove(prt)

        # ===== Balls =====
        for ball in gs['balls'][:]:
            if ball['on_paddle']:
                ball['x'] = gs['paddle_x'] + gs['PADDLE_WIDTH'] // 2
                ball['y'] = gs['paddle_y'] - BALL_SIZE//2
                ball['straight_frames'] = 0
                ball['trail'].clear()
                continue

            ball['prev_x'], ball['prev_y'] = ball['x'], ball['y']

            if abs(ball['dx']) < (MIN_HORZ_SPEED * 0.8) and abs(ball['dy']) > 3.5:
                ball['straight_frames'] += 1
            else:
                ball['straight_frames'] = 0
            if ball['straight_frames'] > 45:
                ball['dx'] += random.choice([-1, 1]) * random.uniform(1.2, 1.8)
                ensure_min_horizontal(ball, MIN_HORZ_SPEED + 0.2)
                clamp_speed(ball)
                ball['straight_frames'] = 0

            ball['trail'].append((ball['prev_x']-BALL_SIZE//2, ball['prev_y']-BALL_SIZE//2))
            if len(ball['trail']) > ball['trail_max']:
                ball['trail'].pop(0)

            # X
            ball['x'] += ball['dx']
            if ball['x'] - BALL_SIZE//2 <= 0 or ball['x'] + BALL_SIZE//2 >= WIDTH:
                ball['dx'] *= -1
                ball['x'] = max(BALL_SIZE//2, min(WIDTH - BALL_SIZE//2, ball['x']))
                ensure_min_horizontal(ball); clamp_speed(ball); post_separate(ball, 'x', 1.0)

            ball_rect = pygame.Rect(int(ball['x'] - BALL_SIZE//2), int(ball['y'] - BALL_SIZE//2), BALL_SIZE, BALL_SIZE)
            for brick in gs['bricks'][:]:
                if brick['rect'].colliderect(ball_rect):
                    ball['dx'] *= -1
                    if ball['x'] > brick['rect'].centerx:
                        ball['x'] = brick['rect'].right + BALL_SIZE//2
                    else:
                        ball['x'] = brick['rect'].left - BALL_SIZE//2
                    damage_brick(gs, brick, ball)
                    ensure_min_horizontal(ball); clamp_speed(ball); break

            # Y
            ball['y'] += ball['dy']
            if ball['y'] - BALL_SIZE//2 <= TOP_PLAY_Y:
                ball['y'] = TOP_PLAY_Y + BALL_SIZE//2
                ball['dy'] *= -1
                ensure_min_horizontal(ball); clamp_speed(ball); post_separate(ball, 'y', 1.0)

            ball_rect = pygame.Rect(int(ball['x'] - BALL_SIZE//2), int(ball['y'] - BALL_SIZE//2), BALL_SIZE, BALL_SIZE)

            if ball_rect.colliderect(paddle_rect) and ball['dy'] > 0:
                ball['y'] = paddle_rect.top - BALL_SIZE//2
                ball['dy'] *= -1
                hit_pos = ball['x'] - (gs['paddle_x'] + gs['PADDLE_WIDTH'] / 2)
                ball['dx'] += hit_pos / 90.0
                ball['dx'] += paddle_vx * 0.15
                ensure_min_horizontal(ball); clamp_speed(ball); post_separate(ball, 'y', 1.0)

            collided_y = False
            for brick in gs['bricks'][:]:
                if brick['rect'].colliderect(ball_rect):
                    ball['dy'] *= -1
                    if ball['y'] > brick['rect'].centery:
                        ball['y'] = brick['rect'].bottom + BALL_SIZE//2
                    else:
                        ball['y'] = brick['rect'].top - BALL_SIZE//2
                    damage_brick(gs, brick, ball)
                    ensure_min_horizontal(ball); clamp_speed(ball)
                    collided_y = True
                    break
            if collided_y:
                ball_rect = pygame.Rect(int(ball['x'] - BALL_SIZE//2), int(ball['y'] - BALL_SIZE//2), BALL_SIZE, BALL_SIZE)

            # Ball lost
            if ball['y'] - BALL_SIZE//2 >= HEIGHT:
                gs['balls'].remove(ball)
                if not gs['balls']:
                    gs['lives'] -= 1
                    gs['shake'] = max(gs['shake'], 10)
                    if gs['lives'] > 0:
                        gs['balls'] = [reset_ball()]
                        # ★ freeze timers unless multiball happened this frame
                        gs['timers_frozen'] = not gs.get('multiball_triggered_frame', False)
                    else:
                        return True

        # Powerups
        for p in gs['powerups'][:]:
            p['rect'].y += p['vy']
            if p['rect'].colliderect(paddle_rect):
                apply_powerup(p['type'], gs)
                gs['powerups'].remove(p)
            elif p['rect'].y > HEIGHT:
                gs['powerups'].remove(p)

        # Timers (respect freeze)
        if not gs.get('timers_frozen', False):
            for t in POWERUP_TYPES:
                if gs['powerup_timers'][t] > 0:
                    gs['powerup_timers'][t] -= 1
                    if gs['powerup_timers'][t] == 0:
                        revert_powerup(t, gs)

        # New level
        if not gs['bricks']:
            gs['level'] += 1
            gs['PADDLE_WIDTH'] = PADDLE_WIDTH
            gs['paddle_speed'] = BASE_PADDLE_SPEED
            gs['powerups'].clear()
            for t in POWERUP_TYPES: gs['powerup_timers'][t] = 0
            gs['balls'] = [reset_ball()]
            gs['brick_top'] = compute_brick_top(HEIGHT, gs['paddle_y'], TARGET_MIN_GAP, ROWS, BRICK_HEIGHT)
            random.seed(gs['level'] * 9999)
            pat = level_pattern(gs['level'])
            gs['bricks'] = create_bricks(gs['brick_top'], pattern=pat, level=gs['level'])
            gs['banner_timer'] = 60

        # ===== Render =====
        ox = random.randint(-gs['shake'], gs['shake']) if gs['shake'] > 0 else 0
        oy = random.randint(-gs['shake'], gs['shake']) if gs['shake'] > 0 else 0
        if gs['shake'] > 0: gs['shake'] = max(0, gs['shake'] - 1)

        screen.blit(BG_SURF, (ox, oy))
        draw_particles(ox, oy)

        draw_paddle(gs, paddle_rect, ox, oy)
        for b in gs['balls']:
            draw_ball(b, ox, oy)

        for br in gs['bricks']:
            if br['hit_flash'] > 0: br['hit_flash'] -= 1
            draw_brick(br, ox, oy)

        for p in gs['powerups']:
            draw_powerup_icon(p, ox, oy)

        update_popups(gs, ox, oy)

        draw_hud(gs)
        draw_powerup_timers(gs)

        if gs['powerup_message'] and gs['powerup_timer'] > 0:
            alpha = int((gs['powerup_timer'] / 180) * 255)
            msg = small_font.render(gs['powerup_message'], True, gs['powerup_color'])
            msg.set_alpha(alpha)
            screen.blit(msg, (WIDTH // 2 - msg.get_width() // 2, 78))
            gs['powerup_timer'] -= 1
            if gs['powerup_timer'] == 0:
                gs['powerup_message'] = None

        if gs['banner_timer'] > 0:
            txt = font.render(f"Level {gs['level']}", True, WHITE)
            banner = pygame.Surface((txt.get_width()+24, txt.get_height()+16), pygame.SRCALPHA)
            banner.fill((0,0,0,140))
            banner.blit(txt, (12,8))
            screen.blit(banner, (WIDTH//2 - banner.get_width()//2, HEIGHT//2 - banner.get_height()//2))
            gs['banner_timer'] -= 1

        pygame.display.flip()
        clock.tick(60)

def damage_brick(gs, brick, ball):
    brick['strength'] -= 1
    brick['hit_flash'] = 6
    if brick['strength'] <= 0:
        gs['bricks'].remove(brick)
        gs['score'] += 10
        add_popup(gs, brick['rect'].centerx, brick['rect'].centery, '+10')
        spawn_particles(brick['rect'], brick['color'], count=14)
        gs['shake'] = max(gs['shake'], 3)
        if random.random() < POWERUP_CHANCE:
            gs['powerups'].append(create_powerup(brick['rect'].centerx-POWERUP_SIZE//2, brick['rect'].centery-POWERUP_SIZE//2))
    else:
        c = brick['color']
        mix = 0.2 * (ROWS - brick['strength'])
        brick['color'] = (int(c[0]*(1-mix)+120*mix), int(c[1]*(1-mix)+120*mix), int(c[2]*(1-mix)+120*mix))
    ensure_min_horizontal(ball); clamp_speed(ball)

def draw_game_over(score, level):
    overlay = pygame.Surface((WIDTH, HEIGHT)); overlay.set_alpha(180); overlay.fill((0, 0, 0))
    screen.blit(overlay, (0, 0))
    texts = [
        font.render("Game Over", True, WHITE),
        font.render(f"Score: {score}", True, WHITE),
        font.render(f"Level: {level}", True, WHITE),
        font.render("Press R to Replay or Q to Quit", True, WHITE)
    ]
    for i, t in enumerate(texts):
        screen.blit(t, (WIDTH // 2 - t.get_width() // 2, HEIGHT // 2 - 100 + i * 50))
    pygame.display.flip()

def show_game_over_screen(score, level):
    draw_game_over(score, level)
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r: return True
                if event.key == pygame.K_q: return False

# ===== Entry =====
playing = True
while playing:
    game_state = init_game_state()
    game_over = game_loop(game_state)
    if game_over:
        playing = show_game_over_screen(game_state['score'], game_state['level'])

pygame.quit()
sys.exit()
`;
