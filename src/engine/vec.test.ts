import { describe, expect, it } from "vitest";
import { add, clampLength, distance, length, normalize, sub, vec } from "./vec";

describe("vec", () => {
  it("adds and subtracts", () => {
    expect(add(vec(1, 2), vec(3, 4))).toEqual(vec(4, 6));
    expect(sub(vec(3, 4), vec(1, 2))).toEqual(vec(2, 2));
  });

  it("measures length and distance", () => {
    expect(length(vec(3, 4))).toBe(5);
    expect(distance(vec(0, 0), vec(6, 8))).toBe(10);
  });

  it("normalizes to unit length and keeps zero as zero", () => {
    expect(length(normalize(vec(10, 0)))).toBeCloseTo(1);
    expect(normalize(vec(0, 0))).toEqual(vec(0, 0));
  });

  it("caps length without changing direction", () => {
    const v = clampLength(vec(30, 40), 10);
    expect(length(v)).toBeCloseTo(10);
    expect(v.x / v.y).toBeCloseTo(30 / 40);
    expect(clampLength(vec(1, 1), 10)).toEqual(vec(1, 1));
  });
});
