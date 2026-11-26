import { describe, expect, it } from "vitest";
import { BALL_RADIUS, DT, G, MAX_SHOT_SPEED } from "./constants";
import { gravityAt, step, type StepOutcome } from "./step";
import { vec } from "./vec";
import { cloneBall, createBall, type Ball, type World } from "./world";

const farHole = { pos: vec(5000, 5000), mass: 0, horizon: 10 };

const worldWith = (planets: World["planets"], blackHole = farHole): World => ({
  planets,
  blackHole,
});

/** Runs until the ball stops flying or `maxSteps` pass. */
function run(world: World, ball: Ball, maxSteps = 5000): { outcome: StepOutcome; steps: number } {
  for (let i = 1; i <= maxSteps; i++) {
    const outcome = step(world, ball);
    if (outcome !== "flying") return { outcome, steps: i };
  }
  return { outcome: "flying", steps: maxSteps };
}

describe("gravity (US-03)", () => {
  const planet = { pos: vec(800, 450), radius: 60, mass: 3000 };
  const world = worldWith([planet]);

  it("pulls towards the planet", () => {
    const left = gravityAt(world, 600, 450);
    expect(left.ax).toBeGreaterThan(0);
    expect(Math.abs(left.ay)).toBeLessThan(1e-9);
    const below = gravityAt(world, 800, 650);
    expect(below.ay).toBeLessThan(0);
  });

  it("falls with distance and grows with mass", () => {
    const near = gravityAt(world, 600, 450).ax;
    const far = gravityAt(world, 300, 450).ax;
    expect(far).toBeLessThan(near / 3);
    const heavy = gravityAt(worldWith([{ ...planet, mass: 6000 }]), 600, 450).ax;
    expect(heavy).toBeCloseTo(near * 2);
  });

  it("follows the inverse-square law far from the centre", () => {
    const { ax } = gravityAt(world, 0, 450);
    expect(ax).toBeCloseTo((G * planet.mass) / 800 ** 2, 1);
  });

  it("includes the black hole (AC2)", () => {
    const empty = worldWith([], { pos: vec(800, 450), mass: 2000, horizon: 20 });
    expect(gravityAt(empty, 700, 450).ax).toBeGreaterThan(0);
  });
});

describe("collisions and rest (US-04)", () => {
  const planet = { pos: vec(800, 600), radius: 80, mass: 3000 };
  const world = worldWith([planet]);

  it("a dropped ball lands on the surface and comes to rest", () => {
    const ball = createBall(vec(800, 300));
    const { outcome } = run(world, ball);
    expect(outcome).toBe("rest");
    expect(Math.hypot(ball.x - 800, ball.y - 600)).toBeCloseTo(planet.radius + BALL_RADIUS, 0);
  });

  it("never passes through a planet, even at full speed", () => {
    const ball = createBall(vec(800, 100));
    ball.vy = MAX_SHOT_SPEED * 1.5;
    for (let i = 0; i < 2000; i++) {
      step(world, ball);
      const d = Math.hypot(ball.x - 800, ball.y - 600);
      expect(d).toBeGreaterThanOrEqual(planet.radius + BALL_RADIUS - 1e-6);
    }
  });

  it("each bounce is lower than the previous one", () => {
    const ball = createBall(vec(800, 200));
    const peaks: number[] = [];
    let goingUp = false;
    let lastDist = Infinity;
    for (let i = 0; i < 4000; i++) {
      if (step(world, ball) === "rest") break;
      const d = Math.hypot(ball.x - 800, ball.y - 600);
      if (goingUp && d < lastDist) peaks.push(lastDist);
      goingUp = d > lastDist;
      lastDist = d;
    }
    expect(peaks.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < peaks.length; i++) expect(peaks[i]!).toBeLessThan(peaks[i - 1]!);
  });
});

describe("goal and bounds", () => {
  it("captures the ball inside the event horizon (US-06 AC1)", () => {
    const world = worldWith([], { pos: vec(800, 450), mass: 1500, horizon: 22 });
    const ball = createBall(vec(600, 450));
    ball.vx = 200;
    expect(run(world, ball).outcome).toBe("holed");
  });

  it("reports a ball that leaves the play area (US-05 AC1)", () => {
    const ball = createBall(vec(800, 450));
    ball.vx = -MAX_SHOT_SPEED;
    expect(run(worldWith([]), ball).outcome).toBe("out");
  });
});

describe("simulation properties (ADR-0002)", () => {
  it("is deterministic: same start, same path (R5)", () => {
    const world = worldWith(
      [
        { pos: vec(500, 400), radius: 50, mass: 2500 },
        { pos: vec(1100, 500), radius: 70, mass: 4000 },
      ],
      { pos: vec(1400, 200), mass: 1800, horizon: 20 },
    );
    const a = createBall(vec(150, 700));
    a.vx = 500;
    a.vy = -300;
    const b = cloneBall(a);
    const ra = run(world, a);
    const rb = run(world, b);
    expect(rb).toEqual(ra);
    expect(b).toEqual(a);
  });

  it("keeps a circular orbit stable (symplectic integrator)", () => {
    const mass = 3000;
    const r = 200;
    const world = worldWith([{ pos: vec(800, 450), radius: 20, mass }]);
    const ball = createBall(vec(800 + r, 450));
    ball.vy = Math.sqrt((G * mass) / r); // circular orbit speed
    const steps = Math.round(6 / DT);
    let min = Infinity;
    let max = 0;
    for (let i = 0; i < steps; i++) {
      step(world, ball);
      const d = Math.hypot(ball.x - 800, ball.y - 450);
      min = Math.min(min, d);
      max = Math.max(max, d);
    }
    expect(max - min).toBeLessThan(r * 0.05);
  });
});
