import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Bug01Icon,
  Note01Icon,
  SearchVisualIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Card, EmptyState, FilledButton, GhostButton, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({
    meta: [
      { title: "Help | weave+" },
      {
        name: "description",
        content:
          "Search the Canvas Guides, ask your instructor a question, report a problem, visit the community and read release notes.",
      },
      { property: "og:title", content: "Help | weave+" },
      {
        property: "og:description",
        content: "Guides, instructor questions, problem reports, community and release notes.",
      },
    ],
  }),
  component: HelpPage,
});

const GUIDES = [
  {
    title: "Submitting an assignment",
    body: "Open the assignment, write or paste your response, then submit. You can resubmit until the due date passes.",
    keywords: "assignment submit submission resubmit due",
  },
  {
    title: "Reading your grades",
    body: "Grades shows every assignment, your score out of the available points and the lecturer feedback.",
    keywords: "grades score feedback gradebook marks",
  },
  {
    title: "Using modules",
    body: "Modules run in order. Mark one complete to track progress, the course home page shows what is next.",
    keywords: "modules progress complete order lesson",
  },
  {
    title: "Linking notes",
    body: "Type double square brackets to link one note to another. The graph view draws every link you create.",
    keywords: "notes links graph vault backlink",
  },
  {
    title: "Calendar views",
    body: "Switch between month, week and agenda, filter by course, and hide weekends from the toolbar.",
    keywords: "calendar month week agenda filter weekend",
  },
  {
    title: "Discussions etiquette",
    body: "Reply in the existing thread rather than opening a new one, so the cohort can follow the conversation.",
    keywords: "discussion thread reply etiquette forum",
  },
];

const COMMUNITY_LINKS = [
  {
    label: "Visit the Community",
    href: "https://community.canvaslms.com/",
    hint: "Questions answered by other educators and learners.",
  },
  {
    label: "Share a Contribution",
    href: "https://community.canvaslms.com/t5/Contributions/con-p/contributions",
    hint: "Publish a guide, template or workflow for others.",
  },
  {
    label: "Release Notes archive",
    href: "https://community.canvaslms.com/t5/Release-Notes/tkb-p/canvas-release-notes",
    hint: "Every change, newest first.",
  },
];

function HelpPage() {
  const { user } = useSession();
  const [query, setQuery] = useState("");
  const [askCourse, setAskCourse] = useState("");
  const [question, setQuestion] = useState("");
  const [problem, setProblem] = useState("");

  const courses = useQuery({
    queryKey: ["help-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, code, title, owner_id");
      return data ?? [];
    },
  });

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return GUIDES;
    return GUIDES.filter((guide) =>
      `${guide.title} ${guide.body} ${guide.keywords}`.toLowerCase().includes(term),
    );
  }, [query]);

  /** Both flows open a thread, so staff answer in the normal inbox. */
  const openThread = useMutation({
    mutationFn: async ({
      subject,
      body,
      courseId,
      recipient,
    }: {
      subject: string;
      body: string;
      courseId: string | null;
      recipient: string | null;
    }) => {
      const { data: thread, error } = await supabase
        .from("threads")
        .insert({ subject, course_id: courseId, created_by: user!.id })
        .select("id")
        .single();
      if (error) throw error;
      const participants = [{ thread_id: thread.id, user_id: user!.id }];
      if (recipient && recipient !== user!.id)
        participants.push({ thread_id: thread.id, user_id: recipient });
      await supabase.from("thread_participants").insert(participants);
      const { error: messageError } = await supabase
        .from("messages")
        .insert({ thread_id: thread.id, author_id: user!.id, body });
      if (messageError) throw messageError;
      return thread.id;
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <PageHeader
        title="Help"
        description="Search the guides, reach your instructor, or tell us when something breaks."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-body font-medium text-snow-white">
            <HugeiconsIcon icon={SearchVisualIcon} size={18} strokeWidth={1.6} />
            Search the Canvas Guides
          </h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try grades, modules, calendar…"
            className="mt-4 min-h-11 w-full rounded-ui bg-muted px-3 text-body-sm text-snow-white hairline placeholder:text-slate"
          />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {results.length === 0 ? (
              <EmptyState>No guide matches that. Try asking your instructor below.</EmptyState>
            ) : (
              results.map((guide) => (
                <div key={guide.title} className="rounded-card-sm bg-muted p-4 hairline">
                  <p className="flex items-center gap-2 text-body-sm font-medium text-snow-white">
                    <HugeiconsIcon icon={BookOpen01Icon} size={16} strokeWidth={1.6} />
                    {guide.title}
                  </p>
                  <p className="mt-1 text-caption text-slate">{guide.body}</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-body font-medium text-snow-white">
            <HugeiconsIcon icon={UserGroupIcon} size={18} strokeWidth={1.6} />
            Ask Your Instructor a Question
          </h2>
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const course = courses.data?.find((c) => c.id === askCourse);
              if (!course || !question.trim()) {
                toast.error("Pick a course and write your question.");
                return;
              }
              openThread.mutate(
                {
                  subject: `Question about ${course.code}`,
                  body: question.trim(),
                  courseId: course.id,
                  recipient: course.owner_id,
                },
                {
                  onSuccess: () => {
                    toast.success("Sent. Your instructor replies in the inbox.");
                    setQuestion("");
                  },
                },
              );
            }}
          >
            <select
              value={askCourse}
              onChange={(event) => setAskCourse(event.target.value)}
              className="min-h-11 rounded-ui bg-muted px-3 text-body-sm text-snow-white hairline"
            >
              <option value="">Select a course</option>
              {(courses.data ?? []).map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.title}
                </option>
              ))}
            </select>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={5}
              placeholder="What do you need help with?"
              className="rounded-ui bg-muted p-3 text-body-sm text-snow-white hairline placeholder:text-slate"
            />
            <FilledButton
              type="submit"
              compact
              disabled={openThread.isPending}
              className="self-start"
            >
              Send question
            </FilledButton>
          </form>
          <p className="mt-3 text-caption text-slate">
            Answers arrive in{" "}
            <Link to="/inbox" className="font-medium text-snow-white underline underline-offset-4">
              your inbox
            </Link>
            .
          </p>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-body font-medium text-snow-white">
            <HugeiconsIcon icon={Bug01Icon} size={18} strokeWidth={1.6} />
            Report a Problem
          </h2>
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!problem.trim()) {
                toast.error("Describe the problem first.");
                return;
              }
              openThread.mutate(
                {
                  subject: "Problem report",
                  body: `${problem.trim()}\n\nPage: ${window.location.href}`,
                  courseId: null,
                  recipient: null,
                },
                {
                  onSuccess: () => {
                    toast.success("Report filed. Support can see it in the inbox.");
                    setProblem("");
                  },
                },
              );
            }}
          >
            <textarea
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              rows={5}
              placeholder="What happened, and what did you expect?"
              className="rounded-ui bg-muted p-3 text-body-sm text-snow-white hairline placeholder:text-slate"
            />
            <FilledButton
              type="submit"
              compact
              disabled={openThread.isPending}
              className="self-start"
            >
              File report
            </FilledButton>
          </form>
          <p className="mt-3 text-caption text-slate">
            We attach the page address automatically so nobody has to guess where it broke.
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-body font-medium text-snow-white">
            <HugeiconsIcon icon={Note01Icon} size={18} strokeWidth={1.6} />
            Community and release notes
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {COMMUNITY_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-card-sm bg-muted p-4 transition-colors hairline hover:bg-accent"
              >
                <p className="text-body-sm font-medium text-snow-white">{link.label}</p>
                <p className="mt-1 text-caption text-slate">{link.hint}</p>
              </a>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <GhostButton onClick={() => setQuery("")}>Reset guide search</GhostButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
