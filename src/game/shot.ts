import { length, MAX_SHOT_SPEED, normalize, scale, type Vec } from "../engine";

/** Drags shorter than this cancel the shot (US-01 AC4). */
export const MIN_DRAG = 14;

/** Drag distance that gives full power; further dragging adds nothing (US-01 AC2). */
export const MAX_DRAG = 200;

/** Power in [0, 1] for a drag vector (from the ball to the pointer). */
export function shotPower(drag: Vec): number {
  const d = length(drag);
  if (d < MIN_DRAG) return 0;
  return Math.min(d, MAX_DRAG) / MAX_DRAG;
}

/**
 * Launch velocity for a slingshot drag: opposite to the drag, scaled by power.
 * Returns null when the drag is too short to count as a shot.
 */
export function shotVelocity(drag: Vec): Vec | null {
  const power = shotPower(drag);
  if (power === 0) return null;
  return scale(normalize(scale(drag, -1)), power * MAX_SHOT_SPEED);
}
