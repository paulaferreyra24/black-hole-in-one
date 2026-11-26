import { BALL_RADIUS, G, normalize, scale, type Planet, type Vec } from "../engine";
import { shotPower, sinkingPosition, type Session } from "../game";
import type { Camera } from "./camera";
import { PALETTE, SPACE } from "./palette";
import { drawStarfield, type Starfield } from "./starfield";

/** Everything needed to draw one frame. Built by the UI layer each frame. */
export interface View {
  readonly session: Session;
  /** Seconds since start, for ambient animation only. */
  readonly time: number;
  /** Drag vector from the ball while aiming, or null. */
  readonly aim: Vec | null;
  readonly preview: readonly Vec[];
  readonly trail: readonly Vec[];
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  view: View,
  stars: Starfield,
  size: { width: number; height: number },
): void {
  const { dpr } = cam;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawBackground(ctx, size.width, size.height);
  drawStarfield(ctx, stars, size.width, size.height, view.time);

  ctx.setTransform(dpr * cam.scale, 0, 0, dpr * cam.scale, dpr * cam.offsetX, dpr * cam.offsetY);
  const { session } = view;
  session.world.planets.forEach((p, i) => drawGravityRings(ctx, p, i));
  drawBlackHole(ctx, session.world.blackHole.pos, session.world.blackHole.horizon, view.time);
  session.world.planets.forEach((p, i) => drawPlanet(ctx, p, i));
  drawTrail(ctx, view.trail);

  if (session.phase === "aiming" && view.aim) {
    drawPreview(ctx, view.preview);
    drawAim(ctx, { x: session.ball.x, y: session.ball.y }, view.aim);
  }

  if (session.phase === "sinking") {
    const { pos, scale: s } = sinkingPosition(session);
    drawBall(ctx, pos, s);
  } else if (session.phase !== "holed") {
    drawBall(
      ctx,
      { x: session.ball.x, y: session.ball.y },
      1,
      session.phase === "aiming",
      view.time,
    );
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = SPACE.deep;
  ctx.fillRect(0, 0, w, h);
  const nebula = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };
  nebula(w * 0.15, h * 0.2, Math.max(w, h) * 0.55, SPACE.nebulaA);
  nebula(w * 0.85, h * 0.85, Math.max(w, h) * 0.5, SPACE.nebulaB);
}

/** Faint rings where the planet's pull equals a few fixed strengths: the "field" made visible. */
function drawGravityRings(ctx: CanvasRenderingContext2D, p: Planet, i: number) {
  const color = PALETTE[i % PALETTE.length]!.light;
  ctx.save();
  ctx.setLineDash([2, 10]);
  ctx.lineWidth = 1.5;
  for (const [accel, alpha] of [
    [220, 0.22],
    [90, 0.14],
    [40, 0.08],
  ] as const) {
    const r = Math.sqrt((G * p.mass) / accel);
    if (r <= p.radius * 1.15) continue;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlanet(ctx: CanvasRenderingContext2D, p: Planet, i: number) {
  const c = PALETTE[i % PALETTE.length]!;
  const { x, y } = p.pos;
  const r = p.radius;

  const halo = ctx.createRadialGradient(x, y, r * 0.95, x, y, r * 1.35);
  halo.addColorStop(0, c.glow);
  halo.addColorStop(1, "transparent");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.35, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r);
  body.addColorStop(0, c.light);
  body.addColorStop(0.55, c.base);
  body.addColorStop(1, c.dark);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Soft terminator: the night side.
  const night = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  night.addColorStop(0.45, "transparent");
  night.addColorStop(1, "rgba(5, 3, 20, 0.55)");
  ctx.fillStyle = night;
  ctx.fill();
}

function drawBlackHole(ctx: CanvasRenderingContext2D, pos: Vec, horizon: number, t: number) {
  const { x, y } = pos;
  const inner = horizon * 1.25;
  const outer = horizon * 3.6;

  const glow = ctx.createRadialGradient(x, y, inner, x, y, outer * 1.6);
  glow.addColorStop(0, "rgba(255, 170, 90, 0.35)");
  glow.addColorStop(0.4, "rgba(170, 110, 255, 0.18)");
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, outer * 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Accretion disk: a rotating conic gradient in a ring.
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, outer, 0, Math.PI * 2);
  ctx.arc(x, y, inner, 0, Math.PI * 2, true);
  ctx.clip();
  const disk = ctx.createConicGradient(t * 1.4, x, y);
  disk.addColorStop(0, "rgba(255, 220, 160, 0.95)");
  disk.addColorStop(0.18, "rgba(255, 140, 70, 0.55)");
  disk.addColorStop(0.45, "rgba(150, 90, 255, 0.35)");
  disk.addColorStop(0.7, "rgba(255, 120, 80, 0.6)");
  disk.addColorStop(1, "rgba(255, 220, 160, 0.95)");
  ctx.fillStyle = disk;
  ctx.fillRect(x - outer, y - outer, outer * 2, outer * 2);
  const fade = ctx.createRadialGradient(x, y, inner, x, y, outer);
  fade.addColorStop(0, "transparent");
  fade.addColorStop(1, SPACE.deep);
  ctx.fillStyle = fade;
  ctx.fillRect(x - outer, y - outer, outer * 2, outer * 2);
  ctx.restore();

  // Infalling sparks, deterministic from time.
  for (let k = 0; k < 14; k++) {
    const phase = (t * 0.35 + k / 14) % 1;
    const r = outer * (1 - phase) + inner * phase;
    const a = k * 2.4 + phase * 5 + t * 0.8;
    ctx.fillStyle = `rgba(255, 210, 160, ${0.8 * phase})`;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(x, y, horizon, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 225, 180, 0.9)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawTrail(ctx: CanvasRenderingContext2D, trail: readonly Vec[]) {
  if (trail.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1]!;
    const b = trail[i]!;
    const k = i / trail.length;
    ctx.strokeStyle = `rgba(196, 181, 253, ${0.55 * k})`;
    ctx.lineWidth = 1 + BALL_RADIUS * 0.9 * k;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPreview(ctx: CanvasRenderingContext2D, points: readonly Vec[]) {
  points.forEach((p, i) => {
    const k = 1 - i / points.length;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * k})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5 + 2.5 * k, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawAim(ctx: CanvasRenderingContext2D, ball: Vec, drag: Vec) {
  const power = shotPower(drag);
  if (power === 0) return;
  const dir = normalize(scale(drag, -1));
  const len = 30 + power * 90;
  const tip = { x: ball.x + dir.x * len, y: ball.y + dir.y * len };
  const hue = 270 - power * 230; // violet → orange as power grows
  const color = `hsl(${hue}, 95%, 68%)`;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ball.x + dir.x * (BALL_RADIUS + 6), ball.y + dir.y * (BALL_RADIUS + 6));
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();
  const side = { x: -dir.y, y: dir.x };
  ctx.beginPath();
  ctx.moveTo(tip.x + dir.x * 12, tip.y + dir.y * 12);
  ctx.lineTo(tip.x + side.x * 8, tip.y + side.y * 8);
  ctx.lineTo(tip.x - side.x * 8, tip.y - side.y * 8);
  ctx.closePath();
  ctx.fill();

  // Power ring around the ball.
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS + 14, -Math.PI / 2, -Math.PI / 2 + power * Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, p: Vec, s: number, idle = false, t = 0) {
  const r = BALL_RADIUS * s;
  if (r <= 0.2) return;
  const halo = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, r * 3);
  halo.addColorStop(0, "rgba(221, 214, 254, 0.5)");
  halo.addColorStop(1, "transparent");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
  ctx.fill();

  if (idle) {
    // A gentle pulse says "touch me".
    const pulse = (Math.sin(t * 3) + 1) / 2;
    ctx.strokeStyle = `rgba(221, 214, 254, ${0.15 + 0.25 * pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r + 8 + pulse * 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  const body = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r);
  body.addColorStop(0, "#ffffff");
  body.addColorStop(1, "#c4b5fd");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
}
