import {
  BALL_RADIUS,
  DT,
  G,
  OUT_OF_BOUNDS_MARGIN,
  RESTITUTION,
  REST_SPEED,
  REST_TIME,
  SOFTENING,
  SURFACE_FRICTION,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./constants";
import type { Ball, World } from "./world";

/** What happened to the ball during one step. */
export type StepOutcome = "flying" | "rest" | "holed" | "out";

/** Gravitational acceleration at (x, y) from every attractor. */
export function gravityAt(world: World, x: number, y: number): { ax: number; ay: number } {
  let ax = 0;
  let ay = 0;
  const pull = (px: number, py: number, mass: number) => {
    const dx = px - x;
    const dy = py - y;
    const d2 = dx * dx + dy * dy + SOFTENING * SOFTENING;
    const k = (G * mass) / (d2 * Math.sqrt(d2));
    ax += dx * k;
    ay += dy * k;
  };
  for (const p of world.planets) pull(p.pos.x, p.pos.y, p.mass);
  pull(world.blackHole.pos.x, world.blackHole.pos.y, world.blackHole.mass);
  return { ax, ay };
}

/**
 * Advances the ball by one fixed step (ADR-0002) and mutates it in place.
 * Order: gravity → velocity → position (semi-implicit Euler) → collisions → checks.
 */
export function step(world: World, ball: Ball): StepOutcome {
  const { ax, ay } = gravityAt(world, ball.x, ball.y);
  ball.vx += ax * DT;
  ball.vy += ay * DT;
  ball.x += ball.vx * DT;
  ball.y += ball.vy * DT;

  const bh = world.blackHole;
  if (Math.hypot(ball.x - bh.pos.x, ball.y - bh.pos.y) < bh.horizon) return "holed";

  let touching = false;
  for (const p of world.planets) {
    const dx = ball.x - p.pos.x;
    const dy = ball.y - p.pos.y;
    const dist = Math.hypot(dx, dy);
    const minDist = p.radius + BALL_RADIUS;
    if (dist >= minDist || dist === 0) continue;

    touching = true;
    const nx = dx / dist;
    const ny = dy / dist;
    // Positional correction: put the ball back on the surface.
    ball.x = p.pos.x + nx * minDist;
    ball.y = p.pos.y + ny * minDist;
    // Split velocity into normal and tangential parts.
    const vn = ball.vx * nx + ball.vy * ny;
    let tx = ball.vx - vn * nx;
    let ty = ball.vy - vn * ny;
    tx *= 1 - SURFACE_FRICTION;
    ty *= 1 - SURFACE_FRICTION;
    const newVn = vn < 0 ? -vn * RESTITUTION : vn;
    ball.vx = tx + newVn * nx;
    ball.vy = ty + newVn * ny;
  }

  if (touching && Math.hypot(ball.vx, ball.vy) < REST_SPEED) {
    ball.slowTime += DT;
    if (ball.slowTime >= REST_TIME) {
      ball.vx = 0;
      ball.vy = 0;
      return "rest";
    }
  } else {
    ball.slowTime = 0;
  }

  const m = OUT_OF_BOUNDS_MARGIN;
  if (ball.x < -m || ball.x > WORLD_WIDTH + m || ball.y < -m || ball.y > WORLD_HEIGHT + m) {
    return "out";
  }
  return "flying";
}
