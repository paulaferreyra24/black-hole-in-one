# ADR-0001: Build with Vite, TypeScript and a plain canvas, no UI framework

- **Status:** accepted
- **Date:** 2026-11-25

## Context

The game is one canvas plus a few overlay screens (HUD, level select, result). It must
load fast on phones, run at 60 fps and have no backend. The physics and rules must be
unit-testable without a browser.

## Decision

- **Vite** for dev server and build, **TypeScript** in strict mode, **Canvas 2D** for drawing,
  plain DOM for the few overlay screens.
- **TypeScript is pinned to 6.0.x.** TypeScript 7 is the current release, but
  `typescript-eslint` does not support it yet (peer range `<6.1`). We move to 7 when it does.
- **Vitest** for tests, **ESLint** (with import rules per layer) and **Prettier**.
- In-game text is English, so the game can be shared with anyone.
- Static hosting (Vercel or GitHub Pages).

## Alternatives considered

| Option                                | Why not                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| React / Next.js                       | A framework for four overlay screens adds weight and a render model that fights a game loop |
| Phaser or another game engine         | Hides the physics, which is the part this project wants to show                             |
| A physics library (Matter.js, Planck) | Built for rigid-body stacking, not n-body gravity; our model is small and fully testable    |
| WebGL / Three.js                      | 2D circles and trails do not need it; Canvas 2D is simpler and fast enough                  |

## Consequences

- Very small bundle and no runtime dependencies.
- We write our own physics and must test it well; that is the point of the project.
- Overlay screens are hand-written DOM: fine for a handful, revisit if the UI grows.
