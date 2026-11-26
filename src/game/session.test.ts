import { describe, expect, it } from "vitest";
import { cloneBall, MAX_FLIGHT_TIME, DT, step, vec } from "../engine";
import type { Level } from "./level";
import { predictPath } from "./preview";
import {
  advance,
  createSession,
  shoot,
  SINK_DURATION,
  type Session,
  type SessionEvent,
} from "./session";

const level: Level = {
  id: 0,
  name: "Test",
  par: 2,
  tee: { planet: 0, angle: 0 },
  planets: [{ pos: vec(300, 450), radius: 60, mass: 2000 }],
  blackHole: { pos: vec(1300, 450), mass: 1500, horizon: 22 },
};

function runUntilEvent(s: Session, maxSteps = 5000): SessionEvent | null {
  for (let i = 0; i < maxSteps; i++) {
    const e = advance(s);
    if (e) return e;
  }
  return null;
}

describe("shot lifecycle", () => {
  it("starts aiming on the tee with no strokes", () => {
    const s = createSession(level);
    expect(s.phase).toBe("aiming");
    expect(s.strokes).toBe(0);
    expect(s.ball.x).toBeCloseTo(300 + 60 + 9);
  });

  it("a shot adds one stroke and starts flying (US-01 AC3)", () => {
    const s = createSession(level);
    expect(shoot(s, vec(-120, 0))).toBe("shot");
    expect(s.strokes).toBe(1);
    expect(s.phase).toBe("flying");
  });

  it("a too-short drag does nothing (US-01 AC4)", () => {
    const s = createSession(level);
    expect(shoot(s, vec(-3, 0))).toBeNull();
    expect(s.strokes).toBe(0);
    expect(s.phase).toBe("aiming");
  });

  it("cannot shoot while flying", () => {
    const s = createSession(level);
    shoot(s, vec(-120, 0));
    expect(shoot(s, vec(-120, 0))).toBeNull();
    expect(s.strokes).toBe(1);
  });

  it("a lost ball returns to the shot origin with a penalty (US-05 AC1)", () => {
    const s = createSession(level);
    const origin = vec(s.ball.x, s.ball.y);
    shoot(s, vec(60, 190)); // full power, up and away from the hole, off the screen
    expect(runUntilEvent(s)).toBe("lost-out");
    expect(s.strokes).toBe(2);
    expect(s.phase).toBe("aiming");
    expect(s.ball.x).toBeCloseTo(origin.x);
    expect(s.ball.y).toBeCloseTo(origin.y);
  });

  it("a ball stuck in orbit is lost too (US-05 AC2)", () => {
    const orbitLevel: Level = {
      ...level,
      tee: { planet: 0, angle: 0 },
      planets: [{ pos: vec(800, 450), radius: 20, mass: 3000 }],
      blackHole: { pos: vec(5000, 5000), mass: 0, horizon: 1 },
    };
    const s = createSession(orbitLevel);
    s.ball.x = 1000;
    s.ball.y = 450;
    s.phase = "flying";
    s.ball.vy = 155; // roughly circular, never lands
    s.flightTime = MAX_FLIGHT_TIME - 1;
    expect(runUntilEvent(s, Math.ceil(2 / DT))).toBe("lost-orbit");
  });

  it("a captured ball sinks, then the level is holed (US-06)", () => {
    const s = createSession(level);
    s.ball.x = 1200;
    s.ball.y = 450;
    s.phase = "flying";
    s.ball.vx = 300;
    expect(runUntilEvent(s)).toBe("captured");
    expect(s.phase).toBe("sinking");
    expect(runUntilEvent(s, Math.ceil(SINK_DURATION / DT) + 2)).toBe("holed");
    expect(s.phase).toBe("holed");
  });
});

describe("trajectory preview (US-02)", () => {
  it("matches the real flight point by point (AC3)", () => {
    const s = createSession(level);
    const drag = vec(-150, 60);
    const preview = predictPath(s.world, s.ball, drag, 60, 1);
    shoot(s, drag);
    const real = cloneBall(s.ball);
    for (const p of preview) {
      step(s.world, real);
      expect(real.x).toBe(p.x);
      expect(real.y).toBe(p.y);
    }
    expect(preview.length).toBe(60);
  });

  it("is empty for a drag that would not shoot", () => {
    const s = createSession(level);
    expect(predictPath(s.world, s.ball, vec(2, 0))).toEqual([]);
  });
});
