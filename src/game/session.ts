import {
  createBall,
  DT,
  MAX_FLIGHT_TIME,
  step,
  vec,
  type Ball,
  type Vec,
  type World,
} from "../engine";
import { teePosition, worldOf, type Level } from "./level";
import { shotVelocity } from "./shot";

/** Seconds the ball takes to spiral into the black hole (US-06 AC2). */
export const SINK_DURATION = 1.1;

export type Phase = "aiming" | "flying" | "sinking" | "holed";

/** Things the UI may want to react to. Returned by `shoot` and `advance`. */
export type SessionEvent = "shot" | "rest" | "captured" | "holed" | "lost-out" | "lost-orbit";

/** Everything about one attempt at one level. Mutated in place by `shoot` and `advance`. */
export interface Session {
  readonly level: Level;
  readonly world: World;
  readonly ball: Ball;
  phase: Phase;
  strokes: number;
  /** Where the current shot was taken from; a lost ball returns here (US-05). */
  shotOrigin: Vec;
  flightTime: number;
  /** Where the ball crossed the horizon, and how far into the sinking animation we are. */
  sinkFrom: Vec;
  sinkTime: number;
}

export function createSession(level: Level): Session {
  const tee = teePosition(level);
  return {
    level,
    world: worldOf(level),
    ball: createBall(tee),
    phase: "aiming",
    strokes: 0,
    shotOrigin: tee,
    flightTime: 0,
    sinkFrom: tee,
    sinkTime: 0,
  };
}

/** Takes a shot from the current position (US-01). Returns null if nothing happened. */
export function shoot(s: Session, drag: Vec): SessionEvent | null {
  if (s.phase !== "aiming") return null;
  const v = shotVelocity(drag);
  if (!v) return null;
  s.shotOrigin = vec(s.ball.x, s.ball.y);
  s.ball.vx = v.x;
  s.ball.vy = v.y;
  s.ball.slowTime = 0;
  s.flightTime = 0;
  s.strokes += 1;
  s.phase = "flying";
  return "shot";
}

function returnToOrigin(s: Session) {
  s.ball.x = s.shotOrigin.x;
  s.ball.y = s.shotOrigin.y;
  s.ball.vx = 0;
  s.ball.vy = 0;
  s.ball.slowTime = 0;
  s.strokes += 1; // penalty (US-05 AC1)
  s.phase = "aiming";
}

/** Advances the session by one fixed step. */
export function advance(s: Session): SessionEvent | null {
  if (s.phase === "sinking") {
    s.sinkTime += DT;
    if (s.sinkTime >= SINK_DURATION) {
      s.phase = "holed";
      return "holed";
    }
    return null;
  }
  if (s.phase !== "flying") return null;

  s.flightTime += DT;
  const outcome = step(s.world, s.ball);
  switch (outcome) {
    case "holed":
      s.phase = "sinking";
      s.sinkFrom = vec(s.ball.x, s.ball.y);
      s.sinkTime = 0;
      return "captured";
    case "rest":
      s.phase = "aiming";
      return "rest";
    case "out":
      returnToOrigin(s);
      return "lost-out";
    case "flying":
      if (s.flightTime > MAX_FLIGHT_TIME) {
        returnToOrigin(s);
        return "lost-orbit";
      }
      return null;
  }
}

/** Ball position during the sinking animation: a shrinking spiral into the centre. */
export function sinkingPosition(s: Session): { pos: Vec; scale: number } {
  const t = Math.min(1, s.sinkTime / SINK_DURATION);
  const c = s.world.blackHole.pos;
  const dx = s.sinkFrom.x - c.x;
  const dy = s.sinkFrom.y - c.y;
  const r0 = Math.hypot(dx, dy);
  const a0 = Math.atan2(dy, dx);
  const ease = 1 - (1 - t) ** 2;
  const r = r0 * (1 - ease);
  const a = a0 + ease * Math.PI * 3;
  return { pos: vec(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r), scale: 1 - ease };
}
