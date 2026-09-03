import { migrateDoc } from "./data";
import type { Doc, Workspace } from "./types";

const KEY = "slidecast:workspace:v1";

/** Read the persisted workspace, or null if none / unreadable. */
export function loadWorkspace(): Workspace | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    if (parsed.version !== 1 || !Array.isArray(parsed.docs)) return null;
    // Older saves predate accent / header / swipe-hint fields.
    const docs = (parsed.docs as Partial<Doc>[])
      .filter((d): d is Doc => !!d && typeof d.id === "string" && Array.isArray(d.slides))
      .map((d) => migrateDoc(d));
    return { ...(parsed as Workspace), docs, channels: parsed.channels ?? [] };
  } catch {
    return null;
  }
}

let pending: ReturnType<typeof setTimeout> | undefined;

/** Debounced write — a burst of edits produces one localStorage write. */
export function saveWorkspace(ws: Workspace) {
  clearTimeout(pending);
  pending = setTimeout(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ws));
    } catch (err) {
      console.warn("Slidecast: could not persist workspace", err);
    }
  }, 250);
}

export function clearWorkspace() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
