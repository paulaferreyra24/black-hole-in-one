# ADR-0003: Define levels as typed data and prove each one solvable in CI

- **Status:** accepted
- **Date:** 2026-11-25

## Context

Levels are where a physics game breaks quietly: a planet moved 20 px can make a level
impossible, and nobody notices until a player gets stuck.

## Decision

- A level is a plain `Level` object in `game/levels/`: tee, black hole, planets, par.
  TypeScript checks the shape at compile time.
- `game/solver.ts` runs a **beam search** over a grid of shot angles and powers, using the
  real simulation. A unit test asserts that every level has a solution within par.
- When the level editor arrives (1.1), the same type is serialised to JSON for share links.

## Alternatives considered

| Option                  | Why not                                                           |
| ----------------------- | ----------------------------------------------------------------- |
| JSON files from day one | Loses compile-time checks while there is no editor to justify it  |
| Manual playtesting only | Does not scale and does not catch regressions from physics tweaks |

## Consequences

- Changing a physics constant re-validates every level automatically.
- The solver also tells us how hard a level really is, which helps choosing par.
