import { describe, expect, it } from "vitest";
import { starsFor } from "./scoring";

describe("stars (US-07 AC1)", () => {
  it.each([
    [1, 2, 3],
    [2, 2, 3],
    [3, 2, 2],
    [4, 2, 2],
    [5, 2, 1],
    [12, 3, 1],
  ])("%i strokes on par %i gives %i stars", (strokes, par, stars) => {
    expect(starsFor(strokes, par)).toBe(stars);
  });
});
