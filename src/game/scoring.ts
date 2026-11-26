export type Stars = 1 | 2 | 3;

/** US-07 AC1: 3 stars at or under par, 2 up to par + 2, otherwise 1. */
export function starsFor(strokes: number, par: number): Stars {
  if (strokes <= par) return 3;
  if (strokes <= par + 2) return 2;
  return 1;
}
