import { useMemo } from "react";

type Snapshot = unknown;

type Item =
  | { kind: "rect"; x: number; y: number; w: number; h: number; radius: number }
  | { kind: "ellipse"; x: number; y: number; w: number; h: number }
  | { kind: "line"; points: { x: number; y: number }[] }
  | { kind: "text"; x: number; y: number; w: number; h: number; lines: number };

type Parsed = { items: Item[]; count: number };

function num(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Reads a tldraw snapshot and turns each shape into a primitive we can draw, so
 * the tile mirrors what is actually on the board: geo boxes and ellipses, draw
 * strokes, arrows and text blocks.
 */
function readShapes(snapshot: Snapshot): Parsed {
  if (!snapshot || typeof snapshot !== "object") return { items: [], count: 0 };
  const root = snapshot as Record<string, unknown>;
  const doc = (root["document"] ?? root) as Record<string, unknown>;
  const store = (doc["store"] ?? doc) as Record<string, unknown>;
  if (!store || typeof store !== "object") return { items: [], count: 0 };

  const items: Item[] = [];
  let count = 0;

  for (const record of Object.values(store)) {
    if (!record || typeof record !== "object") continue;
    const shape = record as Record<string, unknown>;
    if (shape["typeName"] !== "shape") continue;
    const props = (shape["props"] ?? {}) as Record<string, unknown>;
    const type = String(shape["type"] ?? "shape");
    const x = num(shape["x"], 0);
    const y = num(shape["y"], 0);
    count += 1;
    if (items.length >= 120) continue;

    if (type === "draw" || type === "highlight" || type === "line") {
      const points: { x: number; y: number }[] = [];
      const segments = props["segments"];
      if (Array.isArray(segments)) {
        for (const segment of segments) {
          const segPoints = (segment as Record<string, unknown>)["points"];
          if (!Array.isArray(segPoints)) continue;
          for (const point of segPoints) {
            const p = point as Record<string, unknown>;
            points.push({ x: x + num(p["x"], 0), y: y + num(p["y"], 0) });
          }
        }
      }
      const linePoints = props["points"];
      if (points.length === 0 && linePoints && typeof linePoints === "object") {
        for (const point of Object.values(linePoints as Record<string, unknown>)) {
          const p = point as Record<string, unknown>;
          points.push({ x: x + num(p["x"], 0), y: y + num(p["y"], 0) });
        }
      }
      if (points.length > 1) items.push({ kind: "line", points });
      continue;
    }

    if (type === "arrow") {
      const start = (props["start"] ?? {}) as Record<string, unknown>;
      const end = (props["end"] ?? {}) as Record<string, unknown>;
      const sx = x + num(start["x"], 0);
      const sy = y + num(start["y"], 0);
      const ex = x + num(end["x"], sx + 100 - x);
      const ey = y + num(end["y"], sy - y);
      items.push({
        kind: "line",
        points: [
          { x: sx, y: sy },
          { x: ex, y: ey },
        ],
      });
      continue;
    }

    const w = Math.max(num(props["w"] ?? props["width"], 120), 1);
    const h = Math.max(num(props["h"] ?? props["height"], type === "text" ? 32 : 90), 1);

    if (type === "text" || type === "note") {
      const text = String(props["text"] ?? props["richText"] ?? "");
      items.push({
        kind: "text",
        x,
        y,
        w,
        h: type === "note" ? Math.max(h, 60) : h,
        lines: Math.min(Math.max(Math.round(text.length / 24) || 1, 1), 4),
      });
      continue;
    }

    const geo = String(props["geo"] ?? "");
    if (type === "ellipse" || geo === "ellipse" || geo === "oval" || geo === "cloud") {
      items.push({ kind: "ellipse", x, y, w, h });
      continue;
    }

    items.push({
      kind: "rect",
      x,
      y,
      w,
      h,
      radius: geo === "rectangle" || geo === "" ? Math.min(10, Math.min(w, h) / 5) : 4,
    });
  }

  return { items, count };
}

/**
 * Lightweight canvas preview. Derives a mini map from the stored tldraw
 * snapshot so the card shows what is actually on the board, without booting a
 * whole editor for every tile in the grid.
 */
export function CanvasThumbnail({
  snapshot,
  className,
}: {
  snapshot: Snapshot;
  className?: string;
}) {
  const { items, count } = useMemo(() => readShapes(snapshot), [snapshot]);

  if (items.length === 0) {
    return (
      <div
        className={
          className ??
          "grid h-28 place-items-center rounded-card-sm bg-muted text-caption text-slate"
        }
      >
        Empty board
      </div>
    );
  }

  const xs: number[] = [];
  const ys: number[] = [];
  for (const item of items) {
    if (item.kind === "line") {
      for (const point of item.points) {
        xs.push(point.x);
        ys.push(point.y);
      }
    } else {
      xs.push(item.x, item.x + item.w);
      ys.push(item.y, item.y + item.h);
    }
  }

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(Math.max(...xs) - minX, 1);
  const height = Math.max(Math.max(...ys) - minY, 1);
  const pad = Math.max(width, height) * 0.06;
  const stroke = Math.max(width, height) * 0.005;

  return (
    <div className={className ?? "h-28 overflow-hidden rounded-card-sm bg-muted"}>
      <svg
        role="img"
        aria-label={`Preview of ${count} items on the board`}
        viewBox={`${minX - pad} ${minY - pad} ${width + pad * 2} ${height + pad * 2}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full text-snow-white"
      >
        {items.map((item, index) => {
          if (item.kind === "line") {
            return (
              <polyline
                key={index}
                points={item.points.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth={stroke * 1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            );
          }
          if (item.kind === "ellipse") {
            return (
              <ellipse
                key={index}
                cx={item.x + item.w / 2}
                cy={item.y + item.h / 2}
                rx={item.w / 2}
                ry={item.h / 2}
                fill="currentColor"
                fillOpacity={0.12}
                stroke="currentColor"
                strokeOpacity={0.5}
                strokeWidth={stroke}
              />
            );
          }
          if (item.kind === "text") {
            return (
              <g key={index} opacity={0.6}>
                {Array.from({ length: item.lines }).map((_, line) => (
                  <rect
                    key={line}
                    x={item.x}
                    y={item.y + (item.h / item.lines) * line + item.h * 0.08}
                    width={item.w * (line === item.lines - 1 ? 0.62 : 1)}
                    height={Math.max(item.h / item.lines - item.h * 0.16, 1)}
                    rx={Math.max(item.h / item.lines / 3, 1)}
                    fill="currentColor"
                    fillOpacity={0.45}
                  />
                ))}
              </g>
            );
          }
          return (
            <rect
              key={index}
              x={item.x}
              y={item.y}
              width={item.w}
              height={item.h}
              rx={item.radius}
              fill="currentColor"
              fillOpacity={0.12}
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={stroke}
            />
          );
        })}
      </svg>
    </div>
  );
}
