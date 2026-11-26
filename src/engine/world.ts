import type { Vec } from "./vec";

/** A solid body with gravity. The ball bounces off its surface. */
export interface Planet {
  readonly pos: Vec;
  readonly radius: number;
  readonly mass: number;
}

/** The goal. Pulls like a planet, but has no surface: crossing the horizon captures the ball. */
export interface BlackHole {
  readonly pos: Vec;
  readonly mass: number;
  readonly horizon: number;
}

export interface World {
  readonly planets: readonly Planet[];
  readonly blackHole: BlackHole;
}

/**
 * The ball's mutable state. The simulation updates it in place for speed: the solver
 * runs millions of steps. Copy it with `cloneBall` before predicting a path.
 */
export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds the ball has been slow while touching a surface. */
  slowTime: number;
}

export const createBall = (pos: Vec): Ball => ({ x: pos.x, y: pos.y, vx: 0, vy: 0, slowTime: 0 });

export const cloneBall = (b: Ball): Ball => ({ ...b });
