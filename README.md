# Black Hole in One

A physics golf game in space. Pull back to aim, let planets bend your shot with their
gravity, and sink the ball into a black hole — in as few strokes as you can.

**Play:** _link coming with release 1.0_

## How to play

- Press anywhere, drag back and release — like a slingshot. The further you drag, the harder the shot.
- The dotted line shows where the first part of your shot will go.
- The ball rests where it lands. Shoot again from there.
- Lost a ball in space? It comes back, with a one-stroke penalty.
- Beat par for three stars. `R` restarts, `Esc` goes back to the levels.

## What's inside

- **Hand-written physics** — n-body softened gravity, circle collisions with restitution
  and friction, fixed 120 Hz step with a symplectic integrator. Deterministic on every device.
- **Layered architecture** — `engine → game → render → ui`, with the import rules
  enforced by ESLint. The physics and the game rules never touch the browser.
- **Levels proven solvable** — a beam-search solver runs every level in CI and fails the
  build if one cannot be finished within par.
- No runtime dependencies. Vite + TypeScript + Canvas 2D.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run check    # typecheck + lint + tests
npm run build
```

## Docs

|                                      |                                                                       |
| ------------------------------------ | --------------------------------------------------------------------- |
| [CLAUDE.md](CLAUDE.md)               | Repository rules: layers, standards, git workflow, definition of done |
| [Vision](docs/vision.md)             | What the game is and is not                                           |
| [User stories](docs/user-stories.md) | What it must do, with acceptance criteria                             |
| [Architecture](docs/architecture.md) | Layers, simulation, shot lifecycle                                    |
| [Decisions (ADRs)](docs/adr/)        | Why it is built this way                                              |
| [Roadmap](docs/roadmap.md)           | Milestones                                                            |

---

Made by [Paula Ferreyra](https://github.com/P4ul4f).
