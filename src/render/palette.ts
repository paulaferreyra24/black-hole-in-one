/** Colours of space and planets. One place, so the look can be tuned without touching drawing code. */
export const SPACE = {
  deep: "#07051a",
  nebulaA: "rgba(91, 33, 182, 0.22)",
  nebulaB: "rgba(14, 116, 144, 0.16)",
} as const;

export interface PlanetColors {
  readonly light: string;
  readonly base: string;
  readonly dark: string;
  readonly glow: string;
}

export const PALETTE: readonly PlanetColors[] = [
  { light: "#a5f3fc", base: "#0891b2", dark: "#083344", glow: "rgba(34, 211, 238, 0.28)" },
  { light: "#fecaca", base: "#e11d48", dark: "#4c0519", glow: "rgba(244, 63, 94, 0.25)" },
  { light: "#fde68a", base: "#d97706", dark: "#451a03", glow: "rgba(245, 158, 11, 0.25)" },
  { light: "#ddd6fe", base: "#7c3aed", dark: "#2e1065", glow: "rgba(167, 139, 250, 0.3)" },
  { light: "#bbf7d0", base: "#059669", dark: "#022c22", glow: "rgba(52, 211, 153, 0.25)" },
];
