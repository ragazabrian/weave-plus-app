import { createLocalStore } from "@/lib/local-store";
import { INTEGRATIONS } from "@/lib/integrations";

const KEY = "weave-enabled-integrations";

const defaults = () => INTEGRATIONS.filter((p) => p.enabledByDefault).map((p) => p.id);

const store = createLocalStore<string[]>(
  KEY,
  (raw) => {
    if (!raw) return defaults();
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : defaults();
    } catch {
      return defaults();
    }
  },
  (value) => JSON.stringify(value),
);

/** Enabled integration ids, shared between the integrations page and the sidebar. */
export function useEnabledPlugins() {
  const enabled = store.useStore();
  const set = new Set(enabled);
  return {
    enabled: set,
    toggle: (id: string) =>
      store.set(set.has(id) ? enabled.filter((x) => x !== id) : [...enabled, id]),
  };
}

/** Enabled integrations, in catalogue order, for navigation. */
export function useEnabledPluginList() {
  const { enabled } = useEnabledPlugins();
  return INTEGRATIONS.filter((integration) => enabled.has(integration.id));
}
