import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_upcoming_assignments",
  title: "List upcoming assignments",
  description: "List weave+ assignments that are due soon, with course code, due date and points.",
  inputSchema: {
    days: z.number().int().min(1).max(180).default(30).describe("Look-ahead window in days."),
    limit: z.number().int().min(1).max(100).default(25).describe("Max assignments to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const now = new Date();
    const until = new Date(now.getTime() + (days ?? 30) * 86_400_000);
    const [assignments, courses] = await Promise.all([
      supabase
        .from("assignments")
        .select("id, title, course_id, due_at, points")
        .gte("due_at", now.toISOString())
        .lte("due_at", until.toISOString())
        .order("due_at")
        .limit(limit ?? 25),
      supabase.from("courses").select("id, code, title"),
    ]);
    if (assignments.error)
      return { content: [{ type: "text", text: assignments.error.message }], isError: true };
    const byId = new Map((courses.data ?? []).map((c) => [c.id, c]));
    const items = (assignments.data ?? []).map((a) => ({
      id: a.id,
      title: a.title,
      due_at: a.due_at,
      points: a.points,
      course_code: byId.get(a.course_id)?.code ?? null,
      course_title: byId.get(a.course_id)?.title ?? null,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { assignments: items },
    };
  },
});
