import { describe, expect, it } from "vitest";
import { LEVELS } from "./levels";
import { bestStars, emptyProgress, isUnlocked, parseProgress, recordResult } from "./progress";

describe("progress (US-07 AC2, US-08 AC2)", () => {
  it("keeps the best result", () => {
    let p = recordResult(emptyProgress, 1, 4);
    p = recordResult(p, 1, 2);
    p = recordResult(p, 1, 3);
    expect(p.best[1]).toBe(2);
  });

  it("unlocks levels one by one", () => {
    expect(isUnlocked(emptyProgress, LEVELS, 1)).toBe(true);
    expect(isUnlocked(emptyProgress, LEVELS, 2)).toBe(false);
    const p = recordResult(emptyProgress, 1, 5);
    expect(isUnlocked(p, LEVELS, 2)).toBe(true);
    expect(isUnlocked(p, LEVELS, 3)).toBe(false);
  });

  it("reports stars for the best result, 0 if never completed", () => {
    const level = LEVELS[0]!;
    expect(bestStars(emptyProgress, level)).toBe(0);
    expect(bestStars(recordResult(emptyProgress, level.id, level.par), level)).toBe(3);
  });

  it("survives corrupted storage", () => {
    expect(parseProgress(null)).toEqual(emptyProgress);
    expect(parseProgress("nope")).toEqual(emptyProgress);
    expect(parseProgress({ best: { 1: 2, 2: -1, x: 3, 4: "a" } })).toEqual({ best: { 1: 2 } });
  });
});
