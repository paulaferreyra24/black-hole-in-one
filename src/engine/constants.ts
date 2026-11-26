/**
 * Physics constants. Units: world pixels and seconds. The world is 1600 × 900.
 * Values are tuned for feel, not for astrophysical accuracy (docs/vision.md).
 */

/** Fixed simulation step, in seconds (ADR-0002). */
export const DT = 1 / 120;

/** Gravitational constant. Surface pull of a planet = G · mass / radius². */
export const G = 1600;

/** Softening length: keeps gravity finite near an attractor's centre. */
export const SOFTENING = 12;

export const BALL_RADIUS = 9;

/** Fraction of normal speed kept after hitting a planet (0 = dead stop, 1 = perfect bounce). */
export const RESTITUTION = 0.45;

/** Fraction of tangential speed lost per step while touching a planet. */
export const SURFACE_FRICTION = 0.035;

/** Below this speed while touching a planet, the ball starts settling. */
export const REST_SPEED = 30;

/** Time the ball must stay slow on a surface before it counts as at rest. */
export const REST_TIME = 0.2;

/** Speed of a shot at full power. Also the tunnelling guard (see ADR-0002). */
export const MAX_SHOT_SPEED = 640;

/** A ball further than this outside the world is lost. */
export const OUT_OF_BOUNDS_MARGIN = 220;

/** A flight longer than this is considered stuck in orbit. */
export const MAX_FLIGHT_TIME = 14;

export const WORLD_WIDTH = 1600;
export const WORLD_HEIGHT = 900;
