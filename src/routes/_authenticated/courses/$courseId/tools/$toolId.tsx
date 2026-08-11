import { createFileRoute, Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { LinkSquare02Icon, PlugSocketIcon } from "@hugeicons/core-free-icons";
import { courseToolById } from "@/lib/course-menu";
import { useRole } from "@/lib/session";
import { Card, EmptyState, GhostButton, Pill, SectionHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/courses/$courseId/tools/$toolId")({
  head: () => ({
    meta: [
      { title: "Course tool | weave+" },
      {
        name: "description",
        content: "External and disabled course tools, with their current status in this course.",
      },
      { property: "og:title", content: "Course tool | weave+" },
      {
        property: "og:description",
        content: "Status, scope and next step for each external course tool.",
      },
    ],
  }),
  component: CourseToolPage,
});

function CourseToolPage() {
  const { courseId, toolId } = Route.useParams();
  const { role } = useRole();
  const isStaff = role === "admin" || role === "lecturer";
  const tool = courseToolById(toolId);

  if (!tool)
    return (
      <EmptyState>
        That tool is not part of this course.{" "}
        <Link
          to="/courses/$courseId"
          params={{ courseId }}
          className="text-snow-white underline underline-offset-4"
        >
          Back to course home
        </Link>
      </EmptyState>
    );

  const blockedForStudents = tool.state !== "open" && !isStaff;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionHeader
          title={tool.label}
          description={tool.blurb}
          action={
            <div className="flex flex-wrap gap-2">
              {tool.external ? <Pill>external tool</Pill> : null}
              {tool.state === "disabled" ? <Pill>disabled for students</Pill> : null}
              {tool.state === "hidden" ? <Pill>hidden from students</Pill> : null}
            </div>
          }
        />
        {blockedForStudents ? (
          <EmptyState>
            This tool is turned off for students in this course. Your lecturer will share anything
            it produces through modules or announcements.
          </EmptyState>
        ) : tool.external ? (
          <div className="rounded-card-sm bg-muted p-6 hairline">
            <p className="flex items-center gap-2 text-body-sm font-medium text-snow-white">
              <HugeiconsIcon icon={PlugSocketIcon} size={18} strokeWidth={1.6} />
              Launch surface
            </p>
            <p className="mt-2 max-w-xl text-body-sm text-slate">
              External tools open in their own window once the workspace admin finishes the
              connection. Until then this page holds the launch point and the scopes it needs.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/plugins">
                <GhostButton>
                  <HugeiconsIcon icon={LinkSquare02Icon} size={16} strokeWidth={1.6} />
                  Manage integrations
                </GhostButton>
              </Link>
              <Link to="/courses/$courseId" params={{ courseId }}>
                <GhostButton>Back to course home</GhostButton>
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState>
            This area stays turned off for the whole course. The equivalent workflow lives in
            modules, rubrics or the shared canvas.
          </EmptyState>
        )}
      </Card>

      {isStaff ? (
        <Card dense>
          <p className="text-body-sm font-medium text-snow-white">Staff note</p>
          <p className="mt-1 text-caption text-slate">
            You can change what students see for this item under Course settings. Students never see
            hidden or disabled entries in their course menu.
          </p>
          <div className="mt-4">
            <Link to="/courses/$courseId/settings" params={{ courseId }}>
              <GhostButton>Open course settings</GhostButton>
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
