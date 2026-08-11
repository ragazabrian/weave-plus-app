import { createFileRoute } from "@tanstack/react-router";
import { useA11y } from "@/lib/a11y";
import { Card, EmptyState, PageHeader } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/account/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility Settings | weave+" },
      {
        name: "description",
        content:
          "High Contrast UI, Dyslexia Friendly Font, underlined links and reduced motion for weave+.",
      },
      { property: "og:title", content: "Accessibility Settings | weave+" },
      {
        property: "og:description",
        content: "Turn on high contrast, a dyslexia friendly font, link underlines or calm motion.",
      },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const { settings, set } = useA11y();

  const toggles = [
    {
      key: "highContrast" as const,
      label: "High Contrast UI",
      hint: "Stronger borders and brighter text on every surface.",
    },
    {
      key: "dyslexiaFont" as const,
      label: "Dyslexia Friendly Font",
      hint: "Swaps the interface font for a wider, more distinct letterform.",
    },
    {
      key: "underlineLinks" as const,
      label: "Underline links",
      hint: "Never rely on colour alone to spot a link.",
    },
    {
      key: "reduceMotion" as const,
      label: "Reduce motion",
      hint: "Stops glow animations, marquees and long transitions.",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Accessibility Settings"
        description="These preferences stay on this device and apply to the whole workspace immediately."
      />
      <Card className="flex flex-col gap-2">
        {toggles.map((toggle) => {
          const on = settings[toggle.key];
          return (
            <div
              key={toggle.key}
              className="grid grid-cols-1 items-center gap-3 rounded-card-sm bg-muted p-4 hairline sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <p className="text-body-sm font-medium text-snow-white">{toggle.label}</p>
                <p className="mt-0.5 text-caption text-slate">{toggle.hint}</p>
              </div>
              <button
                role="switch"
                aria-checked={on}
                aria-label={toggle.label}
                onClick={() => set({ [toggle.key]: !on })}
                className={cn(
                  "flex h-9 w-16 items-center rounded-pill p-1 transition-colors hairline",
                  on ? "bg-snow-white" : "bg-graphite-surface",
                )}
              >
                <span
                  className={cn(
                    "h-7 w-7 rounded-pill transition-transform",
                    on ? "translate-x-7 bg-graphite-surface" : "translate-x-0 bg-slate",
                  )}
                />
              </button>
            </div>
          );
        })}
      </Card>
      <div className="mt-4">
        <EmptyState>
          weave+ also follows your operating system setting for reduced motion, so you rarely need
          to turn that one on by hand.
        </EmptyState>
      </div>
    </div>
  );
}
