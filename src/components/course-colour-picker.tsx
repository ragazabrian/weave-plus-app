import { COURSE_PRESETS, DEFAULT_COURSE_HEX, isHex } from "@/lib/course-color";
import { cn } from "@/lib/utils";

/** Preset palette plus a free web colour, by picker or hex. */
export function ColourPicker({
  category,
  color,
  onChange,
}: {
  category: string;
  color: string;
  onChange: (next: { category?: (typeof COURSE_PRESETS)[number]["id"]; color: string }) => void;
}) {
  const preset = COURSE_PRESETS.find((p) => p.hex.toLowerCase() === color.toLowerCase());
  return (
    <div className="mt-4">
      <p className="text-caption uppercase tracking-wide text-slate">Course colour</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {COURSE_PRESETS.map((option) => {
          const on = category === option.id && preset?.id === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange({ category: option.id, color: option.hex })}
              aria-pressed={on}
              className={cn(
                "flex min-h-9 items-center gap-2 rounded-pill px-3 text-caption font-medium transition-colors hairline",
                on ? "bg-snow-white text-graphite-surface" : "text-smoke hover:bg-muted",
              )}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: option.hex }} />
              {option.label}
            </button>
          );
        })}

        <label className="flex min-h-9 items-center gap-2 rounded-pill px-3 text-caption font-medium text-smoke hairline">
          Web colour
          <input
            type="color"
            value={isHex(color) ? color : DEFAULT_COURSE_HEX}
            onChange={(e) => onChange({ color: e.target.value })}
            aria-label="Pick a custom course colour"
            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </label>
        <input
          value={color}
          onChange={(e) => onChange({ color: e.target.value })}
          aria-label="Course colour hex code"
          placeholder="#6b62f2"
          className="w-28 rounded-pill bg-muted px-3 py-1.5 text-caption text-snow-white outline-none hairline placeholder:text-slate"
        />
      </div>
      {!isHex(color) ? (
        <p className="mt-2 text-caption text-slate">Use a hex code such as #6b62f2.</p>
      ) : null}
    </div>
  );
}
