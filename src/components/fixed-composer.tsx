import { useEffect, useRef, useState, type ReactNode } from "react";

const DESKTOP_BREAKPOINT = "(min-width: 1024px)";

/**
 * Pins a composer to the bottom of the viewport with real `position: fixed`,
 * so it never moves while the page scrolls. The anchor stays in normal flow so
 * the composer keeps the width and horizontal position of the content column.
 *
 * On mobile (< 1024px) the composer renders inline at the end of the content
 * instead of fixed, so it cannot overlap the stacked history rail above it.
 */
export function FixedComposer({ children }: { children: ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_BREAKPOINT).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_BREAKPOINT);
    const onBreak = () => setIsDesktop(mql.matches);
    onBreak();
    mql.addEventListener("change", onBreak);

    function measure() {
      const node = anchorRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setBox({ left: rect.left, width: rect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    const timer = window.setInterval(measure, 400);
    return () => {
      mql.removeEventListener("change", onBreak);
      window.removeEventListener("resize", measure);
      window.clearInterval(timer);
    };
  }, []);

  if (!isDesktop) {
    return (
      <div ref={anchorRef} className="w-full">
        <div className="relative z-40 pb-4 pt-2">{children}</div>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="h-32 w-full">
      <div
        className="fixed bottom-0 z-40 px-1 pb-4 pt-12"
        style={box ? { left: box.left, width: box.width } : { left: 0, right: 0, width: "auto" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void-canvas via-void-canvas/92 to-transparent"
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
