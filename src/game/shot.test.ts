import { describe, expect, it } from "vitest";
import { length, MAX_SHOT_SPEED, vec } from "../engine";
import { MAX_DRAG, MIN_DRAG, shotPower, shotVelocity } from "./shot";

describe("shot (US-01)", () => {
  it("launches opposite to the drag (AC1)", () => {
    const v = shotVelocity(vec(-100, 0))!;
    expect(v.x).toBeGreaterThan(0);
    expect(v.y).toBeCloseTo(0);
  });

  it("power grows with distance and is capped (AC2)", () => {
    expect(shotPower(vec(MAX_DRAG / 2, 0))).toBeCloseTo(0.5);
    expect(shotPower(vec(MAX_DRAG * 3, 0))).toBe(1);
    expect(length(shotVelocity(vec(0, MAX_DRAG * 3))!)).toBeCloseTo(MAX_SHOT_SPEED);
  });

  it("a drag shorter than the minimum is not a shot (AC4)", () => {
    expect(shotVelocity(vec(MIN_DRAG - 1, 0))).toBeNull();
    expect(shotPower(vec(0, 0))).toBe(0);
  });
});
