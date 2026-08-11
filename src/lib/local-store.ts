import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store. Used for preferences that several surfaces
 * need to read at once (enabled plugins, the admin role preview) without
 * threading state through the router.
 */
export function createLocalStore<T>(
  key: string,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string,
) {
  const listeners = new Set<() => void>();
  const fallback = parse(null);
  let cache: T | null = null;

  function read(): T {
    if (typeof window === "undefined") return fallback;
    if (cache === null) cache = parse(window.localStorage.getItem(key));
    return cache;
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  function set(value: T) {
    cache = value;
    if (typeof window !== "undefined") window.localStorage.setItem(key, serialize(value));
    emit();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      cache = parse(event.newValue);
      emit();
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, read, () => fallback);
  }

  return { read, set, subscribe, useStore };
}
