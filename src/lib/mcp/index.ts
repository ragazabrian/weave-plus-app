import { defineMcp, auth } from "@lovable.dev/mcp-js";
import searchNotes from "./tools/search-notes";
import createNote from "./tools/create-note";
import listCourses from "./tools/list-courses";
import listUpcomingAssignments from "./tools/list-upcoming-assignments";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "weave",
  title: "weave+",
  version: "0.1.0",
  instructions:
    "Tools for the weave+ knowledge base and course platform. Use `search_notes` to find notes by text or tag, `create_note` to capture a new note, `list_courses` for the course catalogue, and `list_upcoming_assignments` for deadlines. All tools act as the signed-in weave+ user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchNotes, createNote, listCourses, listUpcomingAssignments] as unknown as Parameters<
    typeof defineMcp
  >[0]["tools"],
});
