import { emptyProgress, parseProgress, type Progress } from "../game";

const KEY = "black-hole-in-one:progress:v1";

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseProgress(JSON.parse(raw)) : emptyProgress;
  } catch {
    return emptyProgress; // private mode or corrupted JSON: play without saving
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage full or disabled: progress just won't persist.
  }
}
