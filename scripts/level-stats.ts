// Dev tool: how forgiving is each level? Share of a fine grid of shots that sink in one.
// Run: npm run levels:stats
import { vec, scale } from "../src/engine";
import { teePosition, worldOf } from "../src/game/level";
import { LEVELS } from "../src/game/levels";
import { MAX_DRAG } from "../src/game/shot";
import { simulateShot } from "../src/game/solver";

for (const level of LEVELS) {
  const world = worldOf(level);
  const tee = teePosition(level);
  let holed = 0,
    rest = 0,
    lost = 0,
    total = 0;
  for (let a = 0; a < 720; a++) {
    const th = (a / 720) * Math.PI * 2;
    for (let p = 1; p <= 20; p++) {
      const r = simulateShot(
        world,
        tee,
        scale(vec(Math.cos(th), Math.sin(th)), (p / 20) * MAX_DRAG),
      );
      total++;
      if (r.kind === "holed") holed++;
      else if (r.kind === "rest") rest++;
      else lost++;
    }
  }
  const pct = (n: number) => ((100 * n) / total).toFixed(2).padStart(6) + "%";
  console.log(
    `#${String(level.id).padEnd(2)} ${level.name.padEnd(16)} par ${level.par}  in-one ${pct(holed)}  rest ${pct(rest)}  lost ${pct(lost)}`,
  );
}
