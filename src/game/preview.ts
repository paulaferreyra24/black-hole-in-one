import { cloneBall, step, vec, type Ball, type Vec, type World } from "../engine";
import { shotVelocity } from "./shot";

/** How far ahead the preview looks, in simulation steps (US-02 AC2). */
export const PREVIEW_STEPS = 75;

/**
 * Predicted path of a shot, using the same `step` as the real flight (US-02 AC3).
 * Returns one point every `every` steps; stops early if the ball rests, is holed or leaves.
 */
export function predictPath(
  world: World,
  ball: Ball,
  drag: Vec,
  steps = PREVIEW_STEPS,
  every = 3,
): Vec[] {
  const v = shotVelocity(drag);
  if (!v) return [];
  const b = cloneBall(ball);
  b.vx = v.x;
  b.vy = v.y;
  b.slowTime = 0;
  const points: Vec[] = [];
  for (let i = 1; i <= steps; i++) {
    const outcome = step(world, b);
    if (i % every === 0 || outcome !== "flying") points.push(vec(b.x, b.y));
    if (outcome !== "flying") break;
  }
  return points;
}
