import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchVisualIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/ignite")({
  head: () => ({
    meta: [
      { title: "Search | weave+" },
      {
        name: "description",
        content: "Search modules, assignments, announcements and shared notes inside this course.",
      },
      { property: "og:title", content: "Search | weave+" },
      {
        property: "og:description",
        content: "One search box across every piece of course content you can see.",
      },
    ],
  }),
  component: IgnitePage,
});

type Hit = {
  id: string;
  kind: "module" | "assignment" | "announcement" | "note";
  title: string;
  snippet: string;
};

function IgnitePage() {
  const { courseId } = Route.useParams();
  const [term, setTerm] = useState("");
  const [kinds, setKinds] = useState<Hit["kind"][]>([
    "module",
    "assignment",
    "announcement",
    "note",
  ]);

  const data = useQuery({
    queryKey: ["ignite", courseId],
    queryFn: async () => {
      const [modules, assignments, announcements, notes] = await Promise.all([
        supabase.from("modules").select("id, title, summary, body").eq("course_id", courseId),
        supabase.from("assignments").select("id, title, instructions").eq("course_id", courseId),
        supabase.from("announcements").select("id, title, body").eq("course_id", courseId),
        supabase.from("notes").select("id, title, content").eq("course_id", courseId),
      ]);
      const hits: Hit[] = [
        ...(modules.data ?? []).map((m) => ({
          id: m.id,
          kind: "module" as const,
          title: m.title,
          snippet: m.summary || m.body || "",
        })),
        ...(assignments.data ?? []).map((a) => ({
          id: a.id,
          kind: "assignment" as const,
          title: a.title,
          snippet: a.instructions || "",
        })),
        ...(announcements.data ?? []).map((a) => ({
          id: a.id,
          kind: "announcement" as const,
          title: a.title,
          snippet: a.body || "",
        })),
        ...(notes.data ?? []).map((n) => ({
          id: n.id,
          kind: "note" as const,
          title: n.title,
          snippet: n.content || "",
        })),
      ];
      return hits;
    },
  });

  const results = useMemo(() => {
    const query = term.trim().toLowerCase();
    const pool = (data.data ?? []).filter((hit) => kinds.includes(hit.kind));
    if (!query) return pool.slice(0, 12);
    return pool
      .map((hit) => {
        const haystack = `${hit.title} ${hit.snippet}`.toLowerCase();
        const score =
          (hit.title.toLowerCase().includes(query) ? 2 : 0) + (haystack.includes(query) ? 1 : 0);
        return { hit, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.hit);
  }, [data.data, term, kinds]);

  function linkFor(hit: Hit) {
    if (hit.kind === "assignment")
      return (
        <Link
          to="/courses/$courseId/assignments/$assignmentId"
          params={{ courseId, assignmentId: hit.id }}
          className="text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
        >
          Open assignment
        </Link>
      );
    if (hit.kind === "note")
      return (
        <Link
          to="/notes/$noteId"
          params={{ noteId: hit.id }}
          className="text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
        >
          Open note
        </Link>
      );
    if (hit.kind === "module")
      return (
        <Link
          to="/courses/$courseId/modules"
          params={{ courseId }}
          className="text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
        >
          Open module
        </Link>
      );
    return (
      <Link
        to="/courses/$courseId/announcements"
        params={{ courseId }}
        className="text-body-sm font-medium text-snow-white underline decoration-slate underline-offset-4"
      >
        Open announcement
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          title="Search"
          description="Ranked matches across everything published in this course, plus notes shared with it."
        />
        <div className="flex items-center gap-2 rounded-ui bg-muted px-3 hairline">
          <HugeiconsIcon icon={SearchVisualIcon} size={18} strokeWidth={1.6} />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Ask anything about this course"
            className="min-h-12 w-full bg-transparent text-body-sm text-snow-white placeholder:text-slate focus:outline-none"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["module", "assignment", "announcement", "note"] as Hit["kind"][]).map((kind) => {
            const on = kinds.includes(kind);
            return (
              <button
                key={kind}
                onClick={() => setKinds(on ? kinds.filter((k) => k !== kind) : [...kinds, kind])}
                aria-pressed={on}
                className={
                  on
                    ? "min-h-9 rounded-pill bg-snow-white px-3 text-caption font-medium capitalize text-graphite-surface"
                    : "min-h-9 rounded-pill bg-muted px-3 text-caption font-medium capitalize text-slate hairline hover:text-snow-white"
                }
              >
                {kind}s
              </button>
            );
          })}
        </div>
      </Card>

      {data.isLoading ? (
        <EmptyState>Indexing this course…</EmptyState>
      ) : results.length === 0 ? (
        <EmptyState>Nothing matched. Try a shorter phrase.</EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((hit) => (
            <Card key={`${hit.kind}-${hit.id}`} dense>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-body-sm font-medium text-snow-white">
                  <HugeiconsIcon icon={SparklesIcon} size={16} strokeWidth={1.6} />
                  {hit.title}
                </p>
                <Pill>{hit.kind}</Pill>
              </div>
              {hit.snippet ? (
                <p className="mt-2 line-clamp-2 text-body-sm text-bone">{hit.snippet}</p>
              ) : null}
              <div className="mt-3">{linkFor(hit)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
