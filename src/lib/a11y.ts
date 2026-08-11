import { useEffect } from "react";
import { createLocalStore } from "@/lib/local-store";

export type A11ySettings = {
  highContrast: boolean;
  dyslexiaFont: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
};

const DEFAULTS: A11ySettings = {
  highContrast: false,
  dyslexiaFont: false,
  underlineLinks: false,
  reduceMotion: false,
};

const store = createLocalStore<A11ySettings>(
  "weave-a11y",
  (raw) => {
    if (!raw) return DEFAULTS;
    try {
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<A11ySettings>) };
    } catch {
      return DEFAULTS;
    }
  },
  (value) => JSON.stringify(value),
);

/** Reads the accessibility preferences and mirrors them onto the html element. */
export function useA11y() {
  const settings = store.useStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-contrast", settings.highContrast);
    root.classList.toggle("a11y-dyslexia", settings.dyslexiaFont);
    root.classList.toggle("a11y-underline", settings.underlineLinks);
    root.classList.toggle("a11y-calm", settings.reduceMotion);
  }, [settings]);

  return {
    settings,
    set: (patch: Partial<A11ySettings>) => store.set({ ...settings, ...patch }),
  };
}
