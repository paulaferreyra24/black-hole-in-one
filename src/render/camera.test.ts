import { describe, expect, it } from "vitest";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../engine";
import { fitCamera, toWorld } from "./camera";

describe("camera", () => {
  it("keeps the world's proportions and centres it", () => {
    const cam = fitCamera(1000, 1000, 1);
    expect(WORLD_WIDTH * cam.scale).toBeLessThanOrEqual(1000);
    expect(cam.offsetY).toBeCloseTo((1000 - WORLD_HEIGHT * cam.scale) / 2);
  });

  it("converts screen positions back to world positions", () => {
    const cam = fitCamera(800, 450, 2);
    const centre = toWorld(cam, 400, 225);
    expect(centre.x).toBeCloseTo(WORLD_WIDTH / 2);
    expect(centre.y).toBeCloseTo(WORLD_HEIGHT / 2);
  });
});
