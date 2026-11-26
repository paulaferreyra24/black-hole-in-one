import { bestStars, isUnlocked, starsFor, type Level, type Progress } from "../game";

/** Small DOM helper: element with class and optional text. */
function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const e = document.createElement(tag);
  e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

const starRow = (n: number, total = 3) => {
  const row = el("div", "stars");
  for (let i = 0; i < total; i++) row.append(el("span", i < n ? "star on" : "star", "★"));
  return row;
};

export function renderMenu(
  root: HTMLElement,
  levels: readonly Level[],
  progress: Progress,
  onPick: (level: Level) => void,
) {
  root.replaceChildren();
  const panel = el("div", "menu");
  const title = el("h1", "title");
  title.innerHTML = "Black Hole <span>in One</span>";
  panel.append(title, el("p", "tagline", "Golf in space. Gravity is the course."));

  const grid = el("div", "level-grid");
  for (const level of levels) {
    const unlocked = isUnlocked(progress, levels, level.id);
    const card = el("button", "level-card");
    card.disabled = !unlocked;
    card.append(el("span", "level-num", String(level.id).padStart(2, "0")));
    card.append(el("span", "level-name", unlocked ? level.name : "Locked"));
    card.append(starRow(bestStars(progress, level)));
    card.addEventListener("click", () => onPick(level));
    grid.append(card);
  }
  panel.append(grid);
  const total = levels.reduce((sum, l) => sum + bestStars(progress, l), 0);
  panel.append(el("p", "total", `${total} / ${levels.length * 3} stars`));
  root.append(panel);
}

export interface Hud {
  setLevel(level: Level): void;
  setStrokes(strokes: number, par: number): void;
  toast(message: string, ms?: number): void;
}

export function createHud(root: HTMLElement, onRestart: () => void, onMenu: () => void): Hud {
  root.replaceChildren();
  const left = el("div", "hud-left");
  const name = el("div", "hud-level");
  left.append(name);
  const right = el("div", "hud-right");
  const strokes = el("div", "hud-strokes");
  const restart = el("button", "icon-btn", "↺");
  restart.title = "Restart (R)";
  restart.setAttribute("aria-label", "Restart level");
  restart.addEventListener("click", onRestart);
  const menu = el("button", "icon-btn", "☰");
  menu.title = "Levels (Esc)";
  menu.setAttribute("aria-label", "Back to levels");
  menu.addEventListener("click", onMenu);
  right.append(strokes, restart, menu);
  const toastEl = el("div", "toast");
  root.append(left, right, toastEl);

  let timer = 0;
  return {
    setLevel(level) {
      name.innerHTML = "";
      name.append(el("span", "hud-num", `Level ${level.id}`), document.createTextNode(level.name));
    },
    setStrokes(n, par) {
      strokes.textContent = `Strokes ${n} · Par ${par}`;
    },
    toast(message, ms = 2600) {
      toastEl.textContent = message;
      toastEl.classList.add("show");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => toastEl.classList.remove("show"), ms);
    },
  };
}

function verdict(strokes: number, par: number): string {
  if (strokes === 1) return "Black hole in one!";
  const diff = strokes - par;
  if (diff <= -2) return "Eagle!";
  if (diff === -1) return "Birdie!";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  return `${diff} over par`;
}

export function renderResult(
  root: HTMLElement,
  level: Level,
  strokes: number,
  hasNext: boolean,
  actions: { retry: () => void; next: () => void; menu: () => void },
) {
  root.replaceChildren();
  const card = el("div", "result");
  card.append(el("p", "result-level", `Level ${level.id} · ${level.name}`));
  card.append(el("h2", "result-title", verdict(strokes, level.par)));
  card.append(starRow(starsFor(strokes, level.par)));
  card.append(
    el(
      "p",
      "result-strokes",
      `${strokes} ${strokes === 1 ? "stroke" : "strokes"} · par ${level.par}`,
    ),
  );
  const buttons = el("div", "result-actions");
  const retry = el("button", "btn", "Retry");
  retry.addEventListener("click", actions.retry);
  const menu = el("button", "btn", "Levels");
  menu.addEventListener("click", actions.menu);
  buttons.append(menu, retry);
  if (hasNext) {
    const next = el("button", "btn primary", "Next level →");
    next.addEventListener("click", actions.next);
    buttons.append(next);
  }
  card.append(buttons);
  root.append(card);
  (buttons.lastElementChild as HTMLButtonElement | null)?.focus();
}
