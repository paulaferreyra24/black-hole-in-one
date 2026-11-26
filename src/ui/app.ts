import { DT, sub, vec, type Vec } from "../engine";
import {
  advance,
  createSession,
  LEVELS,
  predictPath,
  recordResult,
  shoot,
  type Level,
  type Session,
  type SessionEvent,
} from "../game";
import { createStarfield, drawScene, fitCamera, toWorld, type Camera } from "../render";
import { createHud, renderMenu, renderResult, type Hud } from "./screens";
import { loadProgress, saveProgress } from "./storage";

const TRAIL_LENGTH = 70;
/** Never simulate more than this per frame, so a background tab does not freeze on return. */
const MAX_FRAME_TIME = 0.1;

type Screen = "menu" | "playing" | "result";

/** Wires input, simulation, rendering and screens together. */
export function startApp(root: HTMLElement) {
  root.innerHTML = `
    <canvas class="stage" aria-label="Game area"></canvas>
    <div class="hud" hidden></div>
    <div class="overlay"></div>`;
  const canvas = root.querySelector("canvas")!;
  const hudRoot = root.querySelector<HTMLElement>(".hud")!;
  const overlay = root.querySelector<HTMLElement>(".overlay")!;
  const ctx = canvas.getContext("2d")!;
  const stars = createStarfield();

  let progress = loadProgress();
  let screen: Screen = "menu";
  let session: Session = createSession(LEVELS[0]!);
  let camera: Camera = fitCamera(1, 1, 1);
  let size = { width: 1, height: 1 };
  let dragStart: Vec | null = null;
  let aim: Vec | null = null;
  let preview: Vec[] = [];
  let trail: Vec[] = [];
  let hud: Hud | null = null;

  // ── Screens ──────────────────────────────────────────────────────────────
  function showMenu() {
    screen = "menu";
    hudRoot.hidden = true;
    overlay.className = "overlay visible";
    renderMenu(overlay, LEVELS, progress, play);
  }

  function play(level: Level) {
    screen = "playing";
    session = createSession(level);
    trail = [];
    aim = null;
    preview = [];
    overlay.className = "overlay";
    overlay.replaceChildren();
    hudRoot.hidden = false;
    hud = createHud(hudRoot, () => play(level), showMenu);
    hud.setLevel(level);
    hud.setStrokes(0, level.par);
    if (level.hint) hud.toast(level.hint, 4000);
  }

  function showResult() {
    screen = "result";
    const level = session.level;
    progress = recordResult(progress, level.id, session.strokes);
    saveProgress(progress);
    const i = LEVELS.indexOf(level);
    const next = LEVELS[i + 1];
    overlay.className = "overlay visible dim";
    renderResult(overlay, level, session.strokes, next !== undefined, {
      retry: () => play(level),
      next: () => next && play(next),
      menu: showMenu,
    });
  }

  function onEvent(e: SessionEvent) {
    if (!hud) return;
    hud.setStrokes(session.strokes, session.level.par);
    if (e === "lost-out") hud.toast("Lost in space. +1 stroke");
    if (e === "lost-orbit") hud.toast("Stuck in orbit. +1 stroke");
    if (e === "holed") showResult();
  }

  // ── Input (US-01): drag anywhere, release to shoot ───────────────────────
  const pointerWorld = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return toWorld(camera, e.clientX - r.left, e.clientY - r.top);
  };

  canvas.addEventListener("pointerdown", (e) => {
    if (screen !== "playing" || session.phase !== "aiming") return;
    canvas.setPointerCapture(e.pointerId);
    dragStart = pointerWorld(e);
    aim = vec(0, 0);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragStart) return;
    aim = sub(pointerWorld(e), dragStart);
    preview = predictPath(session.world, session.ball, aim);
  });
  const release = (e: PointerEvent) => {
    if (!dragStart || !aim) return;
    aim = sub(pointerWorld(e), dragStart);
    const event = shoot(session, aim);
    dragStart = null;
    aim = null;
    preview = [];
    if (event) {
      trail = [];
      onEvent(event);
    }
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", () => {
    dragStart = null;
    aim = null;
    preview = [];
  });

  window.addEventListener("keydown", (e) => {
    if (screen === "playing" && e.key.toLowerCase() === "r") play(session.level);
    if (e.key === "Escape" && screen !== "menu") showMenu();
  });

  // ── Layout ───────────────────────────────────────────────────────────────
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = { width: root.clientWidth, height: root.clientHeight };
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    camera = fitCamera(size.width, size.height, dpr);
  }
  window.addEventListener("resize", resize);
  resize();

  // ── Loop (ADR-0002): fixed steps, decoupled from the frame rate ──────────
  let last = performance.now();
  let acc = 0;
  let stepCount = 0;
  function frame(now: number) {
    acc += Math.min((now - last) / 1000, MAX_FRAME_TIME);
    last = now;
    while (acc >= DT) {
      acc -= DT;
      if (screen !== "playing") continue;
      const e = advance(session);
      if (session.phase === "flying" && ++stepCount % 2 === 0) {
        trail.push(vec(session.ball.x, session.ball.y));
        if (trail.length > TRAIL_LENGTH) trail.shift();
      } else if (session.phase !== "flying" && trail.length > 0 && stepCount++ % 2 === 0) {
        trail.shift();
      }
      if (e) onEvent(e);
    }
    drawScene(ctx, camera, { session, time: now / 1000, aim, preview, trail }, stars, size);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  showMenu();
}
