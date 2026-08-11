import { createLocalStore } from "@/lib/local-store";
import type { AppRole } from "@/lib/session";

const KEY = "weave-view-role";

const store = createLocalStore<AppRole | null>(
  KEY,
  (raw) => (raw === "admin" || raw === "lecturer" || raw === "student" ? (raw as AppRole) : null),
  (value) => value ?? "",
);

/**
 * Admins can preview the workspace as another role. This only changes what the
 * interface offers, the database still filters every read by the real role.
 */
export function useViewRole() {
  const viewRole = store.useStore();
  return { viewRole, setViewRole: (next: AppRole | null) => store.set(next) };
}
