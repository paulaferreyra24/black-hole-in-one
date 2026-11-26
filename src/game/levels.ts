import { vec } from "../engine";
import type { Level } from "./level";

const planet = (x: number, y: number, radius: number, mass: number) => ({
  pos: vec(x, y),
  radius,
  mass,
});
const hole = (x: number, y: number, mass = 1600, horizon = 22) => ({
  pos: vec(x, y),
  mass,
  horizon,
});

/**
 * The shipped levels, in order. Each one introduces one idea (US-09 AC1) and is
 * proven solvable within par by `levels.test.ts` (ADR-0003).
 */
export const LEVELS: readonly Level[] = [
  {
    id: 1,
    name: "First Light",
    par: 2,
    hint: "Drag back from the ball and let go.",
    tee: { planet: 0, angle: -60 },
    planets: [planet(320, 640, 110, 3200)],
    blackHole: hole(1180, 380),
  },
  {
    id: 2,
    name: "In the Way",
    par: 2,
    hint: "Planets are solid. Go over, or land and try again.",
    tee: { planet: 0, angle: -90 },
    planets: [planet(260, 600, 90, 2600), planet(800, 520, 140, 5200)],
    blackHole: hole(1340, 520),
  },
  {
    id: 3,
    name: "Bend It",
    par: 2,
    hint: "Gravity curves your shot. Use it.",
    tee: { planet: 0, angle: -45 },
    planets: [planet(240, 700, 80, 2200), planet(820, 300, 70, 4200)],
    blackHole: hole(1300, 640),
  },
  {
    id: 4,
    name: "Stepping Stones",
    par: 2,
    tee: { planet: 0, angle: -90 },
    planets: [planet(200, 720, 70, 2000), planet(620, 560, 60, 1800), planet(1000, 420, 55, 1700)],
    blackHole: hole(1420, 260),
  },
  {
    id: 5,
    name: "Gravity Well",
    par: 2,
    hint: "Heavy planets pull hard. Don't get too close.",
    tee: { planet: 0, angle: -120 },
    planets: [planet(1300, 720, 80, 2400), planet(760, 450, 120, 9000)],
    blackHole: hole(320, 240),
  },
  {
    id: 6,
    name: "The Gap",
    par: 2,
    tee: { planet: 0, angle: 0 },
    planets: [planet(180, 450, 80, 2400), planet(800, 250, 150, 5000), planet(800, 700, 150, 5000)],
    blackHole: hole(1420, 460),
  },
  {
    id: 7,
    name: "Slingshot",
    par: 2,
    hint: "Skim past a planet to change direction.",
    tee: { planet: 0, angle: -90 },
    planets: [planet(220, 760, 90, 2600), planet(1250, 300, 60, 6500), planet(700, 520, 110, 3500)],
    blackHole: hole(260, 200),
  },
  {
    id: 8,
    name: "Pinball",
    par: 3,
    tee: { planet: 0, angle: -90 },
    planets: [
      planet(160, 780, 70, 2000),
      planet(480, 420, 50, 1600),
      planet(760, 640, 55, 1700),
      planet(1040, 360, 50, 1600),
      planet(1320, 620, 55, 1700),
    ],
    blackHole: hole(1460, 180),
  },
  {
    id: 9,
    name: "Event Horizon",
    par: 2,
    hint: "A lighter hole is harder to fall into.",
    tee: { planet: 0, angle: -30 },
    planets: [planet(200, 650, 90, 2600), planet(900, 650, 100, 4000)],
    blackHole: hole(1300, 260, 500, 16),
  },
  {
    id: 10,
    name: "Grand Tour",
    par: 3,
    tee: { planet: 0, angle: -90 },
    planets: [
      planet(180, 800, 80, 2200),
      planet(560, 300, 90, 4200),
      planet(980, 640, 120, 6000),
      planet(1380, 300, 70, 3000),
    ],
    blackHole: hole(1450, 760),
  },
];
