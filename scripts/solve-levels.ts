// Dev tool: prints the fewest strokes the solver needs for each level. Used to set par.
// Run: npm run levels:solve
import { LEVELS } from "../src/game/levels";
import { solve } from "../src/game/solver";

for (const level of LEVELS) {
  const t = Date.now();
  let found = 0;
  for (let n = 1; n <= 5 && !found; n++) if (solve(level, n)) found = n;
  console.log(
    `#${level.id} ${level.name.padEnd(16)} par ${level.par}  solver ${found || "none"}  (${Date.now() - t} ms)`,
  );
}
