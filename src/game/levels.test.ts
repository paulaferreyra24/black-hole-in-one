import { describe, expect, it } from "vitest";
import { BALL_RADIUS, distance, WORLD_HEIGHT, WORLD_WIDTH } from "../engine";
import { teePosition } from "./level";
import { LEVELS } from "./levels";
import { simulateShot, solve } from "./solver";
import { createSession, shoot, advance } from "./session";

describe("level data", () => {
  it("has 10 levels with unique, consecutive ids", () => {
    expect(LEVELS.map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it.each(LEVELS.map((l) => [l.id, l] as const))("level %i is well formed", (_id, level) => {
    const tee = teePosition(level);
    expect(level.par).toBeGreaterThanOrEqual(1);
    for (const p of level.planets) {
      // Nothing overlaps the black hole, and the tee is not buried in another planet.
      expect(distance(p.pos, level.blackHole.pos)).toBeGreaterThan(
        p.radius + level.blackHole.horizon,
      );
      expect(distance(p.pos, tee)).toBeGreaterThanOrEqual(p.radius + BALL_RADIUS - 1e-6);
    }
    const { x, y } = level.blackHole.pos;
    expect(x > 0 && x < WORLD_WIDTH && y > 0 && y < WORLD_HEIGHT).toBe(true);
  });
});

describe("every level is solvable within par (US-09 AC2, ADR-0003)", () => {
  it.each(LEVELS.map((l) => [l.id, l.name, l] as const))("level %i — %s", (_id, _name, level) => {
    const solution = solve(level, level.par);
    expect(solution, `no solution within par ${level.par}`).not.toBeNull();

    // Replay the solution through the real session, exactly as a player would.
    const s = createSession(level);
    for (const drag of solution!.drags) {
      expect(shoot(s, drag)).toBe("shot");
      let e = null;
      while (s.phase === "flying" || s.phase === "sinking") e = advance(s) ?? e;
      expect(e === "holed" || e === "rest").toBe(true);
    }
    expect(s.phase).toBe("holed");
    expect(s.strokes).toBeLessThanOrEqual(level.par);
  });

  it("the solver uses the real shot (a holed shot replays as holed)", () => {
    const level = LEVELS[0]!;
    const drag = solve(level, 1)!.drags[0]!;
    expect(simulateShot(createSession(level).world, teePosition(level), drag).kind).toBe("holed");
  });
});
