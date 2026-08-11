import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";

export type GraphNode = { id: string; label: string; group?: string | undefined };
export type GraphLink = { source: string; target: string };

type Sim = {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

/**
 * Interactive force directed graph, Obsidian style, rendered on a canvas so it
 * stays smooth with thousands of nodes. Repulsion uses a coarse grid of mass
 * centroids instead of every pair, which keeps each frame close to linear.
 */
export function GraphView({
  nodes,
  links,
  onSelect,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  onSelect?: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<Sim[]>([]);
  const indexRef = useRef<Map<string, number>>(new Map());
  const edgesRef = useRef<Array<[number, number]>>([]);
  const alphaRef = useRef(1);
  const viewRef = useRef({ x: 0, y: 0, k: 0.55 });
  const hoverRef = useRef<number | null>(null);
  const dragRef = useRef<{ node: number | null; panning: boolean }>({
    node: null,
    panning: false,
  });
  const sizeRef = useRef({ w: 1000, h: 640 });
  const downRef = useRef({ x: 0, y: 0, moved: false });

  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const { theme } = useTheme();
  const palette = useMemo(
    () =>
      theme === "light"
        ? {
            link: "51,65,85",
            node: "#475569",
            nodeActive: "#0f172a",
            ring: "#4c46c4",
            label: "#334155",
          }
        : {
            link: "255,255,255",
            node: "#b2b2b2",
            nodeActive: "#ffffff",
            ring: "#8c85ff",
            label: "#d4d4d4",
          },
    [theme],
  );

  const degree = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of links) {
      map.set(l.source, (map.get(l.source) ?? 0) + 1);
      map.set(l.target, (map.get(l.target) ?? 0) + 1);
    }
    return map;
  }, [links]);

  /** Seed the simulation on a spiral so the layout unfolds evenly. */
  useEffect(() => {
    const previous = new Map(simRef.current.map((n) => [n.id, n]));
    const golden = Math.PI * (3 - Math.sqrt(5));
    simRef.current = nodes.map((node, i) => {
      const existing = previous.get(node.id);
      const radius = 26 * Math.sqrt(i + 1);
      const angle = i * golden;
      return {
        id: node.id,
        label: node.label,
        x: existing?.x ?? Math.cos(angle) * radius,
        y: existing?.y ?? Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        r: 2.4 + Math.min(degree.get(node.id) ?? 0, 24) * 0.5,
      };
    });
    const index = new Map<string, number>();
    simRef.current.forEach((n, i) => index.set(n.id, i));
    indexRef.current = index;
    edgesRef.current = links
      .map((l) => [index.get(l.source), index.get(l.target)] as [number?, number?])
      .filter((e): e is [number, number] => e[0] !== undefined && e[1] !== undefined);
    alphaRef.current = 1;
  }, [nodes, links, degree]);

  /** Keep the canvas backing store matched to its CSS box. */
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const apply = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewRef.current.x = rect.width / 2;
      viewRef.current.y = rect.height / 2;
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  /** Physics plus paint, one rAF loop, no React state per frame. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    const CELL = 90;

    const step = () => {
      const sim = simRef.current;
      const edges = edgesRef.current;
      const alpha = alphaRef.current;
      const n = sim.length;

      if (n > 0 && alpha > 0.02) {
        // Coarse grid of mass centroids, used as the repulsion field.
        const cells = new Map<string, { x: number; y: number; m: number }>();
        for (let i = 0; i < n; i += 1) {
          const p = sim[i]!;
          const key = `${Math.round(p.x / CELL)}:${Math.round(p.y / CELL)}`;
          const cell = cells.get(key);
          if (cell) {
            cell.x += p.x;
            cell.y += p.y;
            cell.m += 1;
          } else {
            cells.set(key, { x: p.x, y: p.y, m: 1 });
          }
        }
        const field = Array.from(cells.values(), (c) => ({
          x: c.x / c.m,
          y: c.y / c.m,
          m: c.m,
        }));

        for (let i = 0; i < n; i += 1) {
          const p = sim[i]!;
          for (let c = 0; c < field.length; c += 1) {
            const f = field[c]!;
            let dx = p.x - f.x;
            let dy = p.y - f.y;
            let d2 = dx * dx + dy * dy;
            if (d2 < 40) {
              dx = (Math.random() - 0.5) * 6;
              dy = (Math.random() - 0.5) * 6;
              d2 = 40;
            }
            const force = (900 * f.m * alpha) / d2;
            const d = Math.sqrt(d2);
            p.vx += (dx / d) * force;
            p.vy += (dy / d) * force;
          }
        }

        for (let e = 0; e < edges.length; e += 1) {
          const [ai, bi] = edges[e]!;
          const a = sim[ai]!;
          const b = sim[bi]!;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.max(Math.sqrt(dx * dx + dy * dy), 0.01);
          const force = (d - 70) * 0.02 * alpha;
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }

        const dragging = dragRef.current.node;
        for (let i = 0; i < n; i += 1) {
          const p = sim[i]!;
          p.vx -= p.x * 0.004 * alpha;
          p.vy -= p.y * 0.004 * alpha;
          if (i === dragging) {
            p.vx = 0;
            p.vy = 0;
            continue;
          }
          p.vx *= 0.8;
          p.vy *= 0.8;
          p.x += p.vx;
          p.y += p.vy;
        }
        alphaRef.current = Math.max(alpha * 0.994, 0.015);
      }

      // paint
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const { w, h } = sizeRef.current;
        const view = viewRef.current;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(view.x, view.y);
        ctx.scale(view.k, view.k);

        const hovered = hoverRef.current;
        const neighbour = new Set<number>();
        if (hovered !== null) {
          for (let e = 0; e < edges.length; e += 1) {
            const [a, b] = edges[e]!;
            if (a === hovered) neighbour.add(b);
            else if (b === hovered) neighbour.add(a);
          }
        }

        ctx.lineWidth = 1 / view.k;
        ctx.strokeStyle = `rgba(${palette.link},${theme === "light" ? 0.16 : 0.09})`;
        ctx.beginPath();
        for (let e = 0; e < edges.length; e += 1) {
          const [ai, bi] = edges[e]!;
          if (hovered !== null && ai !== hovered && bi !== hovered) continue;
          const a = sim[ai]!;
          const b = sim[bi]!;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        if (hovered !== null) {
          ctx.strokeStyle = `rgba(${palette.link},${theme === "light" ? 0.7 : 0.5})`;
          ctx.lineWidth = 1.4 / view.k;
        }
        ctx.stroke();

        ctx.fillStyle = palette.node;
        for (let i = 0; i < n; i += 1) {
          const p = sim[i]!;
          const active = hovered === i || neighbour.has(i);
          ctx.globalAlpha = hovered === null ? 1 : active ? 1 : 0.22;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = active ? palette.nodeActive : palette.node;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        if (hovered !== null && sim[hovered]) {
          const p = sim[hovered]!;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 7 / view.k, 0, Math.PI * 2);
          ctx.strokeStyle = palette.ring;
          ctx.lineWidth = 1.5 / view.k;
          ctx.stroke();
        }

        // Labels only when zoomed in enough to be legible, or for the hover set.
        if (view.k > 1.15 || hovered !== null) {
          ctx.fillStyle = palette.label;
          ctx.textAlign = "center";
          ctx.font = `${11 / view.k}px "Geist Variable", system-ui, sans-serif`;
          for (let i = 0; i < n; i += 1) {
            if (hovered !== null && i !== hovered && !neighbour.has(i)) continue;
            const p = sim[i]!;
            const label = p.label.length > 26 ? `${p.label.slice(0, 26)}…` : p.label;
            ctx.fillText(label, p.x, p.y + p.r + 12 / view.k);
          }
        }

        ctx.restore();
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [palette, theme]);

  function toGraph(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    const view = viewRef.current;
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - view.x) / view.k,
      y: (clientY - rect.top - view.y) / view.k,
    };
  }

  function nearest(clientX: number, clientY: number) {
    const point = toGraph(clientX, clientY);
    const sim = simRef.current;
    const reach = 14 / viewRef.current.k;
    let best: number | null = null;
    let bestD = reach * reach;
    for (let i = 0; i < sim.length; i += 1) {
      const p = sim[i]!;
      const d = (p.x - point.x) ** 2 + (p.y - point.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  return (
    <div ref={wrapRef} className="relative h-[68vh] overflow-hidden rounded-card frost">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Interactive graph of ${nodes.length} linked notes`}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={(event) => {
          downRef.current = { x: event.clientX, y: event.clientY, moved: false };
          const hit = nearest(event.clientX, event.clientY);
          dragRef.current = { node: hit, panning: hit === null };
          if (hit !== null) alphaRef.current = Math.max(alphaRef.current, 0.3);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (
            Math.abs(event.clientX - downRef.current.x) > 3 ||
            Math.abs(event.clientY - downRef.current.y) > 3
          ) {
            downRef.current.moved = true;
          }
          if (drag.node !== null && downRef.current.moved) {
            const point = toGraph(event.clientX, event.clientY);
            const node = simRef.current[drag.node];
            if (node) {
              node.x = point.x;
              node.y = point.y;
            }
            return;
          }
          if (drag.panning) {
            viewRef.current.x += event.movementX;
            viewRef.current.y += event.movementY;
            return;
          }
          const hit = nearest(event.clientX, event.clientY);
          if (hit !== hoverRef.current) {
            hoverRef.current = hit;
            setHoverLabel(hit === null ? null : (simRef.current[hit]?.label ?? null));
          }
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          if (drag.node !== null && !downRef.current.moved) {
            const node = simRef.current[drag.node];
            if (node) onSelect?.(node.id);
          }
          dragRef.current = { node: null, panning: false };
          void event;
        }}
        onPointerLeave={() => {
          dragRef.current = { node: null, panning: false };
          hoverRef.current = null;
          setHoverLabel(null);
        }}
        onWheel={(event) => {
          event.preventDefault();
          const view = viewRef.current;
          const rect = canvasRef.current!.getBoundingClientRect();
          const mx = event.clientX - rect.left;
          const my = event.clientY - rect.top;
          const next = Math.min(4, Math.max(0.12, view.k * (event.deltaY < 0 ? 1.12 : 0.89)));
          view.x = mx - ((mx - view.x) / view.k) * next;
          view.y = my - ((my - view.y) / view.k) * next;
          view.k = next;
        }}
      />

      <div className="pointer-events-none absolute left-5 top-5 flex flex-wrap items-center gap-2 text-caption text-slate">
        <span className="rounded-pill bg-graphite-surface/70 px-3 py-1 backdrop-blur hairline">
          {nodes.length} notes
        </span>
        <span className="rounded-pill bg-graphite-surface/70 px-3 py-1 backdrop-blur hairline">
          {links.length} links
        </span>
        {hoverLabel ? (
          <span className="max-w-[280px] truncate rounded-pill bg-graphite-surface/80 px-3 py-1 text-snow-white backdrop-blur hairline">
            {hoverLabel}
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 flex flex-wrap gap-2 text-caption text-slate">
        <span className="rounded-pill px-3 py-1 hairline">drag a node</span>
        <span className="rounded-pill px-3 py-1 hairline">scroll to zoom</span>
        <span className="rounded-pill px-3 py-1 hairline">hover to isolate</span>
      </div>

      <div className="absolute bottom-5 right-5 flex gap-2">
        <button
          onClick={() => {
            const { w, h } = sizeRef.current;
            viewRef.current = { x: w / 2, y: h / 2, k: 0.55 };
          }}
          className="rounded-pill px-3 py-1 text-caption text-bone transition-colors hairline hover:bg-muted hover:text-snow-white"
        >
          Reset view
        </button>
        <button
          onClick={() => {
            alphaRef.current = 1;
          }}
          className="rounded-pill px-3 py-1 text-caption text-bone transition-colors hairline hover:bg-muted hover:text-snow-white"
        >
          Re-simulate
        </button>
      </div>
    </div>
  );
}
