import { vec, WORLD_HEIGHT, WORLD_WIDTH, type Vec } from "../engine";

/** Maps the fixed 1600 × 900 world onto a canvas of any size, keeping proportions. */
export interface Camera {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
  /** Device pixel ratio the canvas backing store was sized with. */
  readonly dpr: number;
}

/** Fits the world inside `width × height` CSS pixels, centred, with a small padding. */
export function fitCamera(width: number, height: number, dpr: number): Camera {
  const pad = 0.04;
  const scale = Math.min((width * (1 - pad)) / WORLD_WIDTH, (height * (1 - pad)) / WORLD_HEIGHT);
  return {
    scale,
    offsetX: (width - WORLD_WIDTH * scale) / 2,
    offsetY: (height - WORLD_HEIGHT * scale) / 2,
    dpr,
  };
}

/** CSS-pixel position on the canvas → world position. */
export const toWorld = (cam: Camera, x: number, y: number): Vec =>
  vec((x - cam.offsetX) / cam.scale, (y - cam.offsetY) / cam.scale);
