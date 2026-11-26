# CLAUDE.md — Repository rules

This file is the short, normative summary of how work is done in this repository.
It applies to people and to agents alike. Longer explanations live in [`docs/`](docs/).
Where something here says _enforced_, a lint rule or CI job blocks it; everything else
is a convention checked in review.

> **Language.** Code, comments, docs, commit messages and branch names are written in
> **English**. In-game text is English too (see [ADR-0001](docs/adr/0001-stack.md)).

---

## 1. What this is

**Black Hole in One** — a physics golf game in space. You fling a ball, planets bend its
path with gravity, and the hole is a black hole. Short levels, a par per level, stars
for beating it. Runs entirely in the browser, no backend.

- Product scope and non-goals: [`docs/vision.md`](docs/vision.md)
- What the game must do, as user stories with acceptance criteria: [`docs/user-stories.md`](docs/user-stories.md)
- Milestones: [`docs/roadmap.md`](docs/roadmap.md)

## 2. Architecture

Four layers, dependencies point one way only. Full reference: [`docs/architecture.md`](docs/architecture.md).

```
src/
├── engine/   # pure physics: vectors, bodies, gravity, collisions, fixed-step integration
├── game/     # rules: levels, shot lifecycle, strokes, par, stars
├── render/   # canvas drawing of a game state
├── ui/       # DOM: input, HUD, menus, persistence
└── main.ts   # composition root
```

| #      | Rule                                                                   | Enforced |
| ------ | ---------------------------------------------------------------------- | -------- |
| **R1** | `engine/` imports nothing from `game/`, `render/` or `ui/`             | ESLint   |
| **R2** | `game/` imports only from `engine/`                                    | ESLint   |
| **R3** | `render/` never imports from `ui/`                                     | ESLint   |
| **R4** | `engine/` and `game/` never touch the DOM, `window`, timers or storage | ESLint   |
| **R5** | Simulation is deterministic: same level + same shots → same result     | Tests    |

Why: the physics and the rules are the valuable, testable part. Keeping them free of the
browser means every rule can be unit-tested without a canvas.

## 3. Code standards

- TypeScript `strict`. No `any`; no non-null `!` without a comment saying why it is safe.
- Prefer plain data + functions over classes. State that changes over time lives in one
  place per layer.
- Physics constants live in `engine/constants.ts` or in the level data — never as magic
  numbers inline.
- Formatting is Prettier's business, not review's. `npm run format` before committing.

## 4. Tests

- Every rule in `engine/` and `game/` gets a unit test (Vitest), colocated as `*.test.ts`.
- A bug fix starts with a failing test that reproduces it.
- Levels are tested too: each shipped level must be solvable (see `game/levels.test.ts`).

## 5. Git workflow

- `main` = released. `develop` = integration. Work happens on short branches off `develop`:
  `feat/<area>-<what>`, `fix/<area>-<what>`, `docs/<what>`, `chore/<what>`.
- Never commit directly to `main` or `develop`; merge through a Pull Request.
- Commits follow **Conventional Commits**: `type(scope): imperative summary`, e.g.
  `feat(engine): add planet collision with restitution`. Scopes: `engine`, `game`,
  `render`, `ui`, `levels`, `docs`, `ci`.
- A PR uses the template in `.github/pull_request_template.md` and must pass CI.

## 6. Decisions

A decision that is hard to reverse or that someone will ask "why?" about gets an ADR in
[`docs/adr/`](docs/adr/), starting from `0000-template.md`. Do not reopen an accepted ADR
in code review; write a new one that supersedes it.

## 7. Definition of done

- [ ] Acceptance criteria of the story are met and checked in the browser
- [ ] `npm run check` passes (typecheck, lint, tests)
- [ ] Docs updated if behaviour, architecture or a decision changed
