import { createLocalStore } from "@/lib/local-store";

export type Visit = { path: string; label: string; at: number };

const store = createLocalStore<Visit[]>(
  "weave-history",
  (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Visit[]) : [];
    } catch {
      return [];
    }
  },
  (value) => JSON.stringify(value.slice(0, 80)),
);

export function recordVisit(path: string, label: string) {
  const current = store.read();
  if (current[0]?.path === path) return;
  store.set(
    [{ path, label, at: Date.now() }, ...current.filter((v) => v.path !== path)].slice(0, 80),
  );
}

export function useHistory() {
  return { visits: store.useStore(), clear: () => store.set([]) };
}

/** Human label for any in app path, used by the History page. */
export function labelForPath(path: string) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "Home";
  const last = parts[parts.length - 1]!;
  if (parts[0] === "courses" && parts.length >= 2) {
    const tail = parts.length === 2 ? "home" : last;
    return `Course · ${prettify(tail)}`;
  }
  return prettify(last);
}

function prettify(segment: string) {
  return segment.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
