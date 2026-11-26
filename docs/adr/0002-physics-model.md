# ADR-0002: Use a fixed-step, semi-implicit Euler simulation with softened gravity

- **Status:** accepted
- **Date:** 2026-11-25

## Context

The core of the game is a ball moving under the gravity of several bodies. Players must
be able to trust it: the same shot has to land in the same place on a fast desktop and
on a slow phone, and the aiming preview must match the real flight.

## Decision

1. **Fixed time step** `dt = 1/120 s`. The render loop accumulates real time and runs
   whole steps; leftover time carries to the next frame. Physics never sees a variable `dt`.
2. **Semi-implicit Euler**: `v += a·dt`, then `p += v·dt`. It is symplectic, so orbits
   neither gain nor lose energy over time.
3. **Softened inverse-square gravity**: `a = G·m·d / (|d|² + ε²)^(3/2)`.
4. **Circle–circle collisions** with positional correction, restitution and friction.
5. The trajectory preview calls the same `step` function on a copy of the state.

## Alternatives considered

| Option                                     | Why not                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| Variable `dt` from `requestAnimationFrame` | Different frame rates give different results; replays and the preview break       |
| Explicit Euler                             | Orbits spiral outwards; a ball would gain energy around a planet                  |
| RK4                                        | More accurate, but 4× the cost per step and not symplectic; unnecessary at 120 Hz |
| Analytic orbit preview                     | Cannot include bounces and several attractors                                     |

## Consequences

- Deterministic by construction, which also makes the level solver possible (ADR-0003).
- Very fast shots could tunnel through small planets; mitigated by a maximum shot speed
  and the 120 Hz step, and covered by a test.
