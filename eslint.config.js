import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

// Layer rules R1–R4 from CLAUDE.md. A wrong import fails lint, and therefore CI.
const layer = (name, forbidden) => ({
  group: forbidden.map((l) => `**/${l}/**`),
  message: `${name}/ may not import from ${forbidden.join(", ")}/ (see CLAUDE.md §2).`,
});

const browserGlobals = [
  "window",
  "document",
  "localStorage",
  "requestAnimationFrame",
  "setTimeout",
  "setInterval",
  "performance",
].map((name) => ({
  name,
  message: "engine/ and game/ must not touch the browser (CLAUDE.md R4).",
}));

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: { globals: globals.browser },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    files: ["src/engine/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [layer("engine", ["game", "render", "ui"])] }],
      "no-restricted-globals": ["error", ...browserGlobals],
    },
  },
  {
    files: ["src/game/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [layer("game", ["render", "ui"])] }],
      "no-restricted-globals": ["error", ...browserGlobals],
    },
  },
  {
    files: ["src/render/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [layer("render", ["ui"])] }],
    },
  },
);
