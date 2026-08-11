import { createLocalStore } from "@/lib/local-store";
import type { AppRole } from "@/lib/session";

const KEY = "weave-demo-profile";

export type DemoProfile = {
  role: AppRole;
  firstName: string;
  lastName: string;
  email: string;
  profession?: string;
  subject?: string;
  department?: string;
  school?: string;
  contact?: string;
  program?: string;
  yearLevel?: string;
  avatar?: string;
};

function parse(raw: string | null): DemoProfile | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as DemoProfile;
    if (!value || typeof value.email !== "string") return null;
    if (value.role !== "admin" && value.role !== "lecturer" && value.role !== "student")
      return null;
    return value;
  } catch {
    return null;
  }
}

const store = createLocalStore<DemoProfile | null>(KEY, parse, (value) =>
  value ? JSON.stringify(value) : "",
);

/**
 * Demo identity captured during onboarding. The demo has no real sign in, so
 * this store is what the workspace reads for the person's name, role and face.
 */
export function useDemoProfile() {
  const profile = store.useStore();
  return {
    profile,
    setProfile: (next: DemoProfile | null) => store.set(next),
  };
}

export function readDemoProfile() {
  return store.read();
}

export function demoFullName(profile: DemoProfile) {
  return `${profile.firstName} ${profile.lastName}`.trim();
}

/** Landing page for each role once onboarding finishes. */
export function homeForRole(role: AppRole) {
  return role === "student" ? "/student" : "/dashboard";
}
