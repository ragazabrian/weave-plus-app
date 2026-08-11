import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_notes",
  title: "Search notes",
  description:
    "Search the signed-in user's weave+ notes by title, body text, or tag. Returns matching notes with tags and last-updated time.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Text or tag to search for."),
    limit: z.number().int().min(1).max(50).default(10).describe("Max results."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const term = query.replace(/^#/, "");
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, tags, updated_at")
      .or(`title.ilike.%${term}%,content.ilike.%${term}%,tags.cs.{${term}}`)
      .order("updated_at", { ascending: false })
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const notes = (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      tags: n.tags,
      updated_at: n.updated_at,
      excerpt: (n.content ?? "").slice(0, 400),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(notes, null, 2) }],
      structuredContent: { notes },
    };
  },
});
