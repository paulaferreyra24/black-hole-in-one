# Architecture

## Layers

```
            ┌──────────────────────────────┐
            │  main.ts  (composition root) │
            └──────────────┬───────────────┘
                           │
            ┌──────────────▼───────────────┐
            │  ui/   input · HUD · menus   │  DOM, pointer events, localStorage
            └───────┬──────────────┬───────┘
                    │              │
      ┌─────────────▼───┐    ┌─────▼──────────────┐
      │ render/  canvas │───▶│ game/  rules       │  levels, shot lifecycle, scoring
      └─────────────┬───┘    └─────┬──────────────┘
                    │              │
                ┌───▼──────────────▼───┐
                │ engine/  physics      │  pure, deterministic
                └───────────────────────┘
```

Arrows are "may import". The rules R1–R5 in [`CLAUDE.md`](../CLAUDE.md) are enforced by
ESLint (`eslint.config.js`), so a wrong import fails CI instead of waiting for review.

| Layer     | Owns                                                                  | Knows nothing about                   |
| --------- | --------------------------------------------------------------------- | ------------------------------------- |
| `engine/` | Vectors, bodies, gravity, collisions, one simulation step             | Levels, strokes, screens, the browser |
| `game/`   | Level data, the shot state machine, strokes, par, stars, level solver | Pixels, input devices, storage        |
| `render/` | Drawing a `GameState` onto a canvas, camera fit                       | Input, menus                          |
| `ui/`     | Pointer input, HUD, screens, saving progress                          | Physics details                       |

## Simulation

- **Fixed time step** of 1/120 s, decoupled from the frame rate: the render loop runs as
  many steps as real time requires. Same inputs → same outputs on every device
  ([ADR-0002](adr/0002-physics-model.md)).
- **Integrator:** semi-implicit (symplectic) Euler — velocity first, then position. It keeps
  orbits stable where explicit Euler spirals outwards.
- **Gravity:** every attractor (planets and the black hole) pulls with
  `a = G·m·d / (|d|² + ε²)^(3/2)`; the softening `ε` avoids infinite forces near centres.
- **Collisions:** ball vs. planet as circle vs. circle. On overlap the ball is pushed to the
  surface, the normal velocity is reflected with restitution `e` and the tangential velocity
  is damped by friction `μ`.
- **Rest:** while touching a planet below a speed threshold for a short time, the ball is at rest.

## Shot lifecycle (`game/`)

```
 aiming ──release──▶ flying ──touches surface slowly──▶ resting ──▶ aiming
                       │
                       ├──inside event horizon──▶ sinking ──animation──▶ holed
                       │
                       └──out of bounds / too long in flight──▶ lost ──▶ aiming (back at shot origin, +1)
```

The trajectory preview runs the **same** `step` function from the current state for a
limited number of steps, so the preview can never disagree with the real flight.

## Levels

Levels are typed TypeScript data in `game/levels/` ([ADR-0003](adr/0003-level-format.md)).
`game/solver.ts` searches shots by beam search; a test runs it on every level to prove
each one can be finished within par.

## World and screen

The world is a fixed 1600 × 900 logical space. `render/camera.ts` scales it to fit any
screen while keeping proportions, and converts pointer positions back to world units.
