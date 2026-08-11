import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_note",
  title: "Create note",
  description:
    "Create a new note in the signed-in user's weave+ workspace. Hashtags in the body are captured as tags.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Note title."),
    content: z.string().default("").describe("Markdown body of the note."),
    tags: z.array(z.string()).default([]).describe("Extra tags to attach."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, content, tags }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const body = content ?? "";
    const hashtags = Array.from(body.matchAll(/#([\w-]+)/g)).map((m) => m[1] as string);
    const allTags = Array.from(new Set([...(tags ?? []), ...hashtags]));
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("notes")
      .insert({ owner_id: ctx.getUserId(), title, content: body, tags: allTags })
      .select("id, title, tags, updated_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { note: data },
    };
  },
});
