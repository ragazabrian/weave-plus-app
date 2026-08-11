/**
 * Course colour. Every course gets one: either a named preset from the weave+
 * palette, or a free web colour the lecturer picks by hex or colour picker.
 * The stored `color` column always wins over the `category` preset.
 */
export const COURSE_PRESETS = [
  { id: "lavender", label: "Lavender", hex: "#a06bf2" },
  { id: "mint", label: "Mint", hex: "#28c76f" },
  { id: "powder", label: "Powder", hex: "#3aa9ff" },
  { id: "solar", label: "Solar", hex: "#ffb020" },
] as const;

export type CoursePreset = (typeof COURSE_PRESETS)[number]["id"];

export const DEFAULT_COURSE_HEX = "#6b62f2";

export function isHex(value: string) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

/** Resolve the colour a course should render with. */
export function courseHex(course: { color?: string | null; category?: string | null }) {
  if (course.color && isHex(course.color)) return course.color;
  const preset = COURSE_PRESETS.find((p) => p.id === course.category);
  return preset?.hex ?? DEFAULT_COURSE_HEX;
}

/** A soft wash of the colour, for card headers and swatches. */
export function courseWash(hex: string, alpha = 0.18) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
