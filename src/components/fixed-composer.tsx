import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Pins a composer to the bottom of the viewport with real `position: fixed`,
 * so it never moves while the page scrolls. The anchor stays in normal flow so
 * the composer keeps the width and horizontal position of the content column.
 */
export function FixedComposer({ children }: { children: ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
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
      window.removeEventListener("resize", measure);
      window.clearInterval(timer);
    };
  }, []);

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
