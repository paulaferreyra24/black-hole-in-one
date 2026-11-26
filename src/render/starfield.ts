/** Stars in normalised screen space [0, 1], so they fill the letterbox too. */
export interface Star {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly twinkle: number;
}

export type Starfield = readonly Star[];

/** Deterministic pseudo-random generator (mulberry32), so the sky is the same every visit. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStarfield(count = 260, seed = 7): Starfield {
  const rand = rng(seed);
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    r: rand() ** 3 * 1.6 + 0.3,
    twinkle: rand() * Math.PI * 2,
  }));
}

export function drawStarfield(
  ctx: CanvasRenderingContext2D,
  stars: Starfield,
  w: number,
  h: number,
  t: number,
) {
  for (const s of stars) {
    const a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + s.twinkle));
    ctx.fillStyle = `rgba(226, 232, 255, ${a})`;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}
