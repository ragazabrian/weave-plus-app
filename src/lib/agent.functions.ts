import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type PriorityItem = {
  severity: "p0" | "p1" | "p2";
  title: string;
  why: string;
};

const ChatInput = z.object({
  message: z.string().min(1).max(4000),
  chatId: z.string().uuid(),
});

/**
 * Agent-curated priority feed. Reads what the signed-in user is allowed to see
 * (RLS applies through context.supabase), then asks the model to reason over the
 * real rows , deadlines, grading age, module drop-off , and rank what matters.
 */
export const getPriorityFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ items: PriorityItem[]; error?: string }> => {
    const { supabase, userId } = context;

    const [{ data: roles }, { data: courses }, { data: assignments }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("courses").select("id, title, code, ends_on"),
      supabase.from("assignments").select("id, course_id, title, due_at, points"),
    ]);

    const role = (roles ?? []).some((r) => r.role === "admin")
      ? "admin"
      : (roles ?? []).some((r) => r.role === "lecturer")
        ? "lecturer"
        : "student";

    const [{ data: submissions }, { data: progress }, { data: enrollments }] = await Promise.all([
      supabase
        .from("submissions")
        .select("id, assignment_id, user_id, status, submitted_at, grade"),
      supabase.from("module_progress").select("module_id, user_id, completed_at"),
      supabase.from("enrollments").select("course_id, user_id"),
    ]);

    const { data: modules } = await supabase
      .from("modules")
      .select("id, course_id, title, position");

    const now = new Date();
    const courseById = new Map((courses ?? []).map((c) => [c.id, c]));

    const snapshot = {
      today: now.toISOString(),
      role,
      viewerId: userId,
      courses: (courses ?? []).map((c) => ({
        title: c.title,
        code: c.code,
        endsOn: c.ends_on,
        assignmentCount: (assignments ?? []).filter((a) => a.course_id === c.id).length,
        studentCount: (enrollments ?? []).filter((e) => e.course_id === c.id).length,
      })),
      assignments: (assignments ?? []).map((a) => {
        const subs = (submissions ?? []).filter((s) => s.assignment_id === a.id);
        const mine = subs.find((s) => s.user_id === userId);
        const hoursToDue = a.due_at
          ? Math.round((new Date(a.due_at).getTime() - now.getTime()) / (1000 * 60 * 60))
          : null;

        return {
          title: a.title,
          course: courseById.get(a.course_id)?.code ?? "",
          hoursToDue,
          totalSubmissions: subs.length,
          ungraded: subs.filter((s) => s.status === "submitted").length,
          oldestUngradedHours:
            subs
              .filter((s) => s.status === "submitted" && s.submitted_at)
              .map((s) =>
                Math.round(
                  (now.getTime() - new Date(s.submitted_at!).getTime()) / (1000 * 60 * 60),
                ),
              )
              .sort((a2, b2) => b2 - a2)[0] ?? null,
          myStatus: mine?.status ?? "none",
          myGrade: mine?.grade ?? null,
        };
      }),
      modules: (modules ?? []).map((m) => {
        const cohort = (enrollments ?? []).filter((e) => e.course_id === m.course_id).length;
        const done = (progress ?? []).filter((p) => p.module_id === m.id && p.completed_at).length;
        return {
          title: m.title,
          course: courseById.get(m.course_id)?.code ?? "",
          position: m.position,
          completionRate: cohort > 0 ? Math.round((done / cohort) * 100) : 0,
          cohortSize: cohort,
          myCompletion: (progress ?? []).some(
            (p) => p.module_id === m.id && p.user_id === userId && p.completed_at,
          ),
        };
      }),
    };

    const rolePrompt =
      role === "admin"
        ? "You are advising a workspace admin. Prioritise cross-course risk: courses missing assignments before their end date, cohorts with low module completion, grading backlogs across courses."
        : role === "lecturer"
          ? "You are advising a lecturer. Prioritise ungraded submissions aged by urgency plus their downstream consequence, and module drop-off anomalies in their courses."
          : "You are advising a student. Prioritise at-risk deadlines and how their pace compares with the cohort completion rates.";

    const { getAiRuntime, AI_SETUP_HINT } = await import("@/lib/ai-provider.server");
    const ai = getAiRuntime();
    if (!ai) {
      return { items: [], error: AI_SETUP_HINT };
    }

    try {
      const { generateText, Output, NoObjectGeneratedError } = await import("ai");
      const schema = z.object({
        items: z.array(
          z.object({
            severity: z.enum(["p0", "p1", "p2"]),
            title: z.string(),
            why: z.string(),
          }),
        ),
      });

      const result = await generateText({
        model: ai.model,
        output: Output.object({ schema }),
        system: `${rolePrompt}
Return between 3 and 5 items, ordered most urgent first. Each item needs a short imperative action title (under 70 characters) and a one-sentence "why" that cites a concrete number from the data: hours until a deadline, hours a submission has waited, a completion percentage, or a cohort size. Never write a generic reason. p0 = needs action today, p1 = this week, p2 = worth knowing. Use only the data given.`,
        prompt: JSON.stringify(snapshot),
      });

      const items = (result.output?.items ?? []).slice(0, 5).map((item) => ({
        severity: item.severity,
        title: item.title.slice(0, 120),
        why: item.why.slice(0, 240),
      }));

      await supabase.from("agent_runs").insert({
        user_id: userId,
        kind: "priority_feed",
        prompt: `Priority feed for ${role}`,
        result: items.map((i) => `[${i.severity}] ${i.title}`).join(" · "),
      });

      return { items };
    } catch (error) {
      const { NoObjectGeneratedError } = await import("ai");
      if (NoObjectGeneratedError.isInstance(error)) {
        return { items: [], error: "The agent returned an unreadable answer. Try refreshing." };
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message.includes("429")) {
        return { items: [], error: "AI rate limit reached , try again in a moment." };
      }
      if (message.includes("402")) {
        return { items: [], error: "AI credits exhausted. Add credits to continue." };
      }
      console.error("priority feed failed", error);
      return { items: [], error: "Could not generate the priority feed right now." };
    }
  });

/** Agent chat, scoped to what the signed-in user can read. */
export const askAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }): Promise<{ reply: string }> => {
    const { supabase, userId } = context;

    const { getAiRuntime, AI_SETUP_HINT } = await import("@/lib/ai-provider.server");
    const ai = getAiRuntime();
    if (!ai) throw new Error(AI_SETUP_HINT);

    const [{ data: history }, { data: courses }, { data: assignments }, { data: notes }] =
      await Promise.all([
        supabase
          .from("agent_messages")
          .select("role, content")
          .eq("user_id", userId)
          .eq("chat_id", data.chatId)
          .order("created_at", { ascending: true })
          .limit(20),
        supabase.from("courses").select("title, code, description"),
        supabase.from("assignments").select("title, due_at, course_id"),
        supabase.from("notes").select("title, tags, content").limit(30),
      ]);

    const workspace = {
      courses: courses ?? [],
      assignments: (assignments ?? []).map((a) => ({ title: a.title, dueAt: a.due_at })),
      notes: (notes ?? []).map((n) => ({
        title: n.title,
        tags: n.tags,
        excerpt: (n.content ?? "").slice(0, 400),
      })),
    };

    const { generateText } = await import("ai");

    const result = await generateText({
      model: ai.model,
      system: `You are the weave+ workspace agent. Answer using only the workspace data provided. Be concise and specific , cite note titles, course codes and dates when relevant. If the data does not contain the answer, say so plainly.

WORKSPACE DATA:
${JSON.stringify(workspace)}`,
      messages: [
        ...(history ?? []).map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: data.message },
      ],
    });

    const reply = result.text.trim() || "I could not produce an answer for that.";

    const { error: insertError } = await supabase.from("agent_messages").insert([
      { user_id: userId, role: "user", content: data.message, chat_id: data.chatId },
      { user_id: userId, role: "assistant", content: reply, chat_id: data.chatId },
    ]);
    if (insertError) console.error("failed to persist agent messages", insertError);

    // Keep the chat list fresh, and title a brand new chat from its first message.
    const { data: chatRow } = await supabase
      .from("agent_chats")
      .select("title")
      .eq("id", data.chatId)
      .maybeSingle();
    await supabase
      .from("agent_chats")
      .update({
        updated_at: new Date().toISOString(),
        ...(chatRow?.title && chatRow.title !== "New chat"
          ? {}
          : { title: data.message.slice(0, 60) }),
      })
      .eq("id", data.chatId);

    await supabase.from("agent_runs").insert({
      user_id: userId,
      kind: "chat",
      prompt: data.message.slice(0, 500),
      result: reply.slice(0, 500),
    });

    return { reply };
  });
