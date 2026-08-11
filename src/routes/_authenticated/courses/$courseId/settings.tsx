import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, FilledButton, SectionHeader } from "@/components/kit";
import { ColourPicker } from "@/components/course-colour-picker";
import { COURSE_PRESETS, courseHex, isHex } from "@/lib/course-color";

export const Route = createFileRoute("/_authenticated/courses/$courseId/settings")({
  head: () => ({
    meta: [
      { title: "Course settings | weave+" },
      {
        name: "description",
        content: "Edit the course title, description, colour and the lecturer who runs it.",
      },
      { property: "og:title", content: "Course settings | weave+" },
      { property: "og:description", content: "Manage this course's details." },
    ],
  }),
  component: CourseSettings,
});

function CourseSettings() {
  const { courseId } = Route.useParams();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof COURSE_PRESETS)[number]["id"]>("powder");
  const [color, setColor] = useState(COURSE_PRESETS[2].hex as string);
  const [ownerId, setOwnerId] = useState("");
  const [busy, setBusy] = useState(false);

  const course = useQuery({
    queryKey: ["course-settings", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, code, category, color, owner_id, starts_on, ends_on")
        .eq("id", courseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  /** Anyone who can be put in front of a course. */
  const staff = useQuery({
    queryKey: ["course-staff-options"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["lecturer", "admin"]);
      const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
      if (ids.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", ids);
      return profiles ?? [];
    },
  });

  useEffect(() => {
    if (!course.data) return;
    setTitle(course.data.title);
    setDescription(course.data.description ?? "");
    setCategory(
      (COURSE_PRESETS.find((p) => p.id === course.data!.category)?.id ??
        "powder") as (typeof COURSE_PRESETS)[number]["id"],
    );
    setColor(courseHex(course.data));
    setOwnerId(course.data.owner_id ?? "");
  }, [course.data]);

  async function save() {
    if (!isHex(color)) {
      toast.error("That colour isn't a valid hex code.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("courses")
      .update({
        title,
        description,
        category,
        color,
        owner_id: ownerId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);
    setBusy(false);
    if (error) {
      toast.error("Could not save. You may not have permission.");
      return;
    }
    toast.success("Course updated");
    queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    queryClient.invalidateQueries({ queryKey: ["course-settings", courseId] });
    queryClient.invalidateQueries({ queryKey: ["courses-list"] });
  }

  return (
    <div className="max-w-2xl">
      <SectionHeader title="Course settings" />
      <Card>
        <label className="text-body-sm text-smoke">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 w-full rounded-input bg-muted px-4 py-3 text-body text-snow-white outline-none hairline"
          />
        </label>
        <label className="mt-4 block text-body-sm text-smoke">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1.5 w-full resize-none rounded-input bg-muted px-4 py-3 text-body text-snow-white outline-none hairline"
          />
        </label>

        <label className="mt-4 block text-body-sm text-smoke">
          Lecturer in charge
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="mt-1.5 w-full rounded-input bg-muted px-4 py-3 text-body text-snow-white outline-none hairline"
          >
            <option value="">Unassigned</option>
            {(staff.data ?? []).map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name ?? person.email}
              </option>
            ))}
          </select>
        </label>

        <ColourPicker
          category={category}
          color={color}
          onChange={(next) => {
            if (next.category) setCategory(next.category);
            setColor(next.color);
          }}
        />

        <p className="mt-4 text-body-sm text-slate">
          Code {course.data?.code} · runs{" "}
          {course.data?.starts_on
            ? new Date(course.data.starts_on).toLocaleDateString()
            : "any time"}{" "}
          to{" "}
          {course.data?.ends_on ? new Date(course.data.ends_on).toLocaleDateString() : "any time"}
        </p>
        <FilledButton onClick={save} disabled={busy} compact className="mt-6">
          Save changes
        </FilledButton>
      </Card>
    </div>
  );
}
