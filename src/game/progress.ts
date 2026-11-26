import type { Level } from "./level";
import { starsFor, type Stars } from "./scoring";

/** Best strokes per level id. Pure data: persisting it is the UI's job (CLAUDE.md R4). */
export interface Progress {
  readonly best: Readonly<Record<number, number>>;
}

export const emptyProgress: Progress = { best: {} };

/** Keeps the lower stroke count (US-07 AC2). */
export function recordResult(p: Progress, levelId: number, strokes: number): Progress {
  const prev = p.best[levelId];
  if (prev !== undefined && prev <= strokes) return p;
  return { best: { ...p.best, [levelId]: strokes } };
}

/** The first level is always open; others open once the previous one is completed (US-08 AC2). */
export function isUnlocked(p: Progress, levels: readonly Level[], levelId: number): boolean {
  const i = levels.findIndex((l) => l.id === levelId);
  if (i <= 0) return i === 0;
  const prev = levels[i - 1]!;
  return p.best[prev.id] !== undefined;
}

export function bestStars(p: Progress, level: Level): Stars | 0 {
  const best = p.best[level.id];
  return best === undefined ? 0 : starsFor(best, level.par);
}

/** Validates data read from storage; anything unexpected becomes empty progress. */
export function parseProgress(raw: unknown): Progress {
  if (typeof raw !== "object" || raw === null || !("best" in raw)) return emptyProgress;
  const best = (raw as { best: unknown }).best;
  if (typeof best !== "object" || best === null) return emptyProgress;
  const clean: Record<number, number> = {};
  for (const [k, v] of Object.entries(best)) {
    const id = Number(k);
    if (Number.isInteger(id) && typeof v === "number" && Number.isInteger(v) && v > 0)
      clean[id] = v;
  }
  return { best: clean };
}
