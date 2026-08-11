import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole, useSession } from "@/lib/session";
import { Card, EmptyState, FilledButton, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements | weave+" },
      { name: "description", content: "Course announcements from the teaching team." },
      { property: "og:title", content: "Announcements | weave+" },
      { property: "og:description", content: "Updates posted to this course." },
    ],
  }),
  component: Announcements,
});

function Announcements() {
  const { courseId } = Route.useParams();
  const { role } = useRole();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const isStaff = role === "admin" || role === "lecturer";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const list = useQuery({
    queryKey: ["announcements", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, body, created_at")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function post() {
    if (!title.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("announcements").insert({
      course_id: courseId,
      title,
      body,
      author_id: user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not post the announcement.");
      return;
    }
    setTitle("");
    setBody("");
    toast.success("Announcement posted");
    queryClient.invalidateQueries({ queryKey: ["announcements", courseId] });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section>
        <SectionHeader title="Announcements" />
        <div className="flex flex-col gap-3">
          {list.isLoading ? (
            <EmptyState>Loading…</EmptyState>
          ) : (list.data ?? []).length === 0 ? (
            <EmptyState>Nothing posted yet.</EmptyState>
          ) : (
            list.data!.map((a) => (
              <Card key={a.id}>
                <p className="text-subheading font-medium text-ink">{a.title}</p>
                <p className="mt-1 text-body-sm text-fog">
                  {new Date(a.created_at).toLocaleString()}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-body text-graphite">{a.body}</p>
              </Card>
            ))
          )}
        </div>
      </section>

      {isStaff ? (
        <Card dense>
          <h2 className="text-body font-medium text-ink">Post an announcement</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mt-4 w-full rounded-card-sm bg-mist-gray px-4 py-3 text-body text-ink outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="What should the cohort know?"
            className="mt-3 w-full resize-none rounded-card-sm bg-mist-gray px-4 py-3 text-body text-ink outline-none"
          />
          <FilledButton onClick={post} disabled={busy} compact className="mt-4 w-full">
            Post
          </FilledButton>
        </Card>
      ) : null}
    </div>
  );
}
