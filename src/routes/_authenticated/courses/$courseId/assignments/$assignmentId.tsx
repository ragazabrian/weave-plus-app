import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole, useSession } from "@/lib/session";
import { Card, EmptyState, FilledButton, GhostButton, Pill } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/assignments/$assignmentId")(
  {
    head: () => ({
      meta: [
        { title: "Assignment | weave+" },
        { name: "description", content: "Submit work, or grade and give feedback." },
        { property: "og:title", content: "Assignment | weave+" },
        { property: "og:description", content: "Submissions, grades and feedback." },
      ],
    }),
    component: AssignmentDetail,
  },
);

function AssignmentDetail() {
  const { assignmentId } = Route.useParams();
  const { role } = useRole();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const isStaff = role === "admin" || role === "lecturer";
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const data = useQuery({
    queryKey: ["assignment", assignmentId, user?.id],
    queryFn: async () => {
      const [assignment, submissions, profiles] = await Promise.all([
        supabase
          .from("assignments")
          .select("id, title, instructions, due_at, points")
          .eq("id", assignmentId)
          .maybeSingle(),
        supabase
          .from("submissions")
          .select("id, user_id, body, status, grade, feedback, submitted_at")
          .eq("assignment_id", assignmentId),
        supabase.from("profiles").select("id, full_name, email"),
      ]);
      if (assignment.error) throw assignment.error;
      return {
        assignment: assignment.data,
        submissions: submissions.data ?? [],
        profiles: profiles.data ?? [],
      };
    },
  });

  const mine = data.data?.submissions.find((s) => s.user_id === user?.id);

  async function submitWork() {
    if (!user || !body.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("submissions").upsert(
      {
        assignment_id: assignmentId,
        user_id: user.id,
        body,
        status: "submitted",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "assignment_id,user_id" },
    );
    setBusy(false);
    if (error) {
      toast.error("Could not submit.");
      return;
    }
    toast.success("Submitted");
    setBody("");
    queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId, user.id] });
  }

  async function grade(submissionId: string, gradeValue: number, feedback: string) {
    const { error } = await supabase
      .from("submissions")
      .update({
        grade: gradeValue,
        feedback,
        status: "graded",
        graded_at: new Date().toISOString(),
        graded_by: user?.id ?? null,
      })
      .eq("id", submissionId);
    if (error) {
      toast.error("Could not save the grade.");
      return;
    }
    toast.success("Grade saved");
    queryClient.invalidateQueries({ queryKey: ["assignment", assignmentId, user?.id] });
  }

  if (data.isLoading) return <EmptyState>Loading assignment…</EmptyState>;
  if (!data.data?.assignment) return <EmptyState>Assignment not available.</EmptyState>;

  const a = data.data.assignment;
  const nameOf = (id: string) =>
    data.data!.profiles.find((p) => p.id === id)?.full_name ??
    data.data!.profiles.find((p) => p.id === id)?.email ??
    "Student";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <h1 className="font-display text-heading-sm font-medium text-ink">{a.title}</h1>
        <p className="mt-2 text-body-sm text-fog">
          {a.due_at ? `due ${new Date(a.due_at).toLocaleString()}` : "no due date"} · {a.points}{" "}
          points
        </p>
        <p className="mt-5 whitespace-pre-wrap text-body text-graphite">{a.instructions}</p>
      </Card>

      {isStaff ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-body font-medium text-ink">
            Submissions ({data.data.submissions.length})
          </h2>
          {data.data.submissions.length === 0 ? (
            <EmptyState>Nothing submitted yet.</EmptyState>
          ) : (
            data.data.submissions.map((s) => (
              <GradeCard
                key={s.id}
                name={nameOf(s.user_id)}
                submission={s}
                points={a.points}
                onGrade={grade}
              />
            ))
          )}
        </div>
      ) : (
        <Card dense>
          <h2 className="text-body font-medium text-ink">Your submission</h2>
          {mine ? (
            <>
              <Pill
                tone={mine.status === "graded" ? "mint" : "powder"}
                className="mt-3 inline-block"
              >
                {mine.status === "graded" ? `graded ${mine.grade ?? 0}/${a.points}` : mine.status}
              </Pill>
              <p className="mt-4 whitespace-pre-wrap text-body-sm text-graphite">{mine.body}</p>
              {mine.feedback ? (
                <div className="mt-4 rounded-card-sm bg-mint-wash p-4">
                  <p className="text-body-sm font-medium text-ink">Feedback</p>
                  <p className="mt-1 text-body-sm text-graphite">{mine.feedback}</p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Paste or write your submission here."
                className="mt-4 w-full resize-none rounded-card-sm bg-mist-gray px-4 py-3 text-body text-ink outline-none"
              />
              <FilledButton onClick={submitWork} disabled={busy} compact className="mt-4 w-full">
                Submit
              </FilledButton>
            </>
          )}
        </Card>
      )}
    </div>
  );
}

function GradeCard({
  name,
  submission,
  points,
  onGrade,
}: {
  name: string;
  submission: {
    id: string;
    body: string | null;
    status: string;
    grade: number | null;
    feedback: string | null;
  };
  points: number;
  onGrade: (id: string, grade: number, feedback: string) => Promise<void>;
}) {
  const [grade, setGrade] = useState(String(submission.grade ?? ""));
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [open, setOpen] = useState(false);

  return (
    <Card dense>
      <div className="flex items-center justify-between gap-3">
        <p className="text-body font-medium text-ink">{name}</p>
        <Pill tone={submission.status === "graded" ? "mint" : "solar"}>
          {submission.status === "graded" ? `${submission.grade ?? 0}/${points}` : "to grade"}
        </Pill>
      </div>
      <p className="mt-3 line-clamp-3 text-body-sm text-graphite">{submission.body}</p>
      <GhostButton onClick={() => setOpen((v) => !v)} className="mt-3">
        {open ? "Hide" : "Grade"}
      </GhostButton>
      {open ? (
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            inputMode="numeric"
            placeholder={`Grade out of ${points}`}
            className="rounded-card-sm bg-mist-gray px-4 py-2 text-body text-ink outline-none"
          />
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="Feedback"
            className="resize-none rounded-card-sm bg-mist-gray px-4 py-2 text-body text-ink outline-none"
          />
          <FilledButton
            compact
            onClick={() => onGrade(submission.id, Number(grade) || 0, feedback)}
          >
            Save grade
          </FilledButton>
        </div>
      ) : null}
    </Card>
  );
}
