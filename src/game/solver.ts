import {
  createBall,
  distance,
  DT,
  MAX_FLIGHT_TIME,
  scale,
  step,
  vec,
  type Vec,
  type World,
} from "../engine";
import { teePosition, worldOf, type Level } from "./level";
import { MAX_DRAG, shotVelocity } from "./shot";

/** A shot as the player would make it: the drag vector from the ball. */
export type Drag = Vec;

export interface Solution {
  readonly drags: readonly Drag[];
}

export interface SolverOptions {
  /** Number of directions tried per shot. */
  angles?: number;
  /** Power levels tried per direction, as fractions of full power. */
  powers?: readonly number[];
  /** How many resting positions are kept between shots. */
  beam?: number;
}

type ShotResult = { kind: "holed" } | { kind: "rest"; pos: Vec } | { kind: "lost" };

const maxSteps = Math.ceil(MAX_FLIGHT_TIME / DT);

/** Simulates one shot from a resting position. */
export function simulateShot(world: World, from: Vec, drag: Drag): ShotResult {
  const v = shotVelocity(drag);
  if (!v) return { kind: "lost" };
  // Same launch as the real game: the solver must never find a shot a player cannot make.
  const ball = createBall(from);
  ball.vx = v.x;
  ball.vy = v.y;
  for (let i = 0; i < maxSteps; i++) {
    const outcome = step(world, ball);
    if (outcome === "holed") return { kind: "holed" };
    if (outcome === "rest") return { kind: "rest", pos: vec(ball.x, ball.y) };
    if (outcome === "out") return { kind: "lost" };
  }
  return { kind: "lost" };
}

/**
 * Beam search over shots (ADR-0003). Finds a sequence of at most `maxStrokes` shots
 * that sinks the ball, or returns null. Lost balls are never part of a solution.
 */
export function solve(level: Level, maxStrokes: number, opts: SolverOptions = {}): Solution | null {
  const angles = opts.angles ?? 120;
  const powers = opts.powers ?? [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const beamWidth = opts.beam ?? 6;
  const world = worldOf(level);
  const hole = level.blackHole.pos;

  let frontier: { pos: Vec; drags: Drag[] }[] = [{ pos: teePosition(level), drags: [] }];

  for (let depth = 0; depth < maxStrokes; depth++) {
    const next = new Map<string, { pos: Vec; drags: Drag[] }>();
    for (const node of frontier) {
      for (let a = 0; a < angles; a++) {
        const theta = (a / angles) * Math.PI * 2;
        for (const p of powers) {
          const drag = scale(vec(Math.cos(theta), Math.sin(theta)), p * MAX_DRAG);
          const result = simulateShot(world, node.pos, drag);
          if (result.kind === "holed") return { drags: [...node.drags, drag] };
          if (result.kind === "rest") {
            const key = `${Math.round(result.pos.x / 12)},${Math.round(result.pos.y / 12)}`;
            if (!next.has(key)) next.set(key, { pos: result.pos, drags: [...node.drags, drag] });
          }
        }
      }
    }
    frontier = [...next.values()]
      .sort((u, v) => distance(u.pos, hole) - distance(v.pos, hole))
      .slice(0, beamWidth);
    if (frontier.length === 0) return null;
  }
  return null;
}
