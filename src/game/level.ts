import { BALL_RADIUS, vec, type BlackHole, type Planet, type Vec, type World } from "../engine";

/** A level as plain, typed data (ADR-0003). */
export interface Level {
  readonly id: number;
  readonly name: string;
  readonly par: number;
  /** The ball starts sitting on a planet's surface, at an angle in degrees (0 = right, -90 = up). */
  readonly tee: { readonly planet: number; readonly angle: number };
  readonly blackHole: BlackHole;
  readonly planets: readonly Planet[];
  /** Optional one-line tip shown when the level starts. */
  readonly hint?: string;
}

export const worldOf = (level: Level): World => ({
  planets: level.planets,
  blackHole: level.blackHole,
});

export function teePosition(level: Level): Vec {
  const planet = level.planets[level.tee.planet];
  if (!planet) throw new Error(`Level ${level.id}: tee planet ${level.tee.planet} does not exist`);
  const a = (level.tee.angle * Math.PI) / 180;
  const r = planet.radius + BALL_RADIUS;
  return vec(planet.pos.x + Math.cos(a) * r, planet.pos.y + Math.sin(a) * r);
}
