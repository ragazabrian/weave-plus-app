/**
 * Course menu, modelled on the Canvas course navigation. Visibility states are
 * kept here so the rail, the tool pages and the settings screen agree.
 */
export type CourseItemState =
  /** Visible to everyone in the course. */
  | "open"
  /** Only staff see it, students never do. */
  | "hidden"
  /** Turned off for students, staff see it flagged as disabled. */
  | "disabled"
  /** Staff administration only. */
  | "staff";

export type CoursePageItem = {
  kind: "page";
  label: string;
  to:
    | "/courses/$courseId"
    | "/courses/$courseId/ignite"
    | "/courses/$courseId/announcements"
    | "/courses/$courseId/syllabus"
    | "/courses/$courseId/modules"
    | "/courses/$courseId/assignments"
    | "/courses/$courseId/discussions"
    | "/courses/$courseId/quizzes"
    | "/courses/$courseId/rubrics"
    | "/courses/$courseId/progress"
    | "/courses/$courseId/people"
    | "/courses/$courseId/settings";
  state: CourseItemState;
  exact?: boolean;
};

export type CourseToolItem = {
  kind: "tool";
  label: string;
  toolId: string;
  state: CourseItemState;
  external: boolean;
  blurb: string;
};

export type CourseMenuItem = CoursePageItem | CourseToolItem;

export const COURSE_MENU: CourseMenuItem[] = [
  { kind: "page", label: "Home", to: "/courses/$courseId", state: "open", exact: true },
  { kind: "page", label: "Search", to: "/courses/$courseId/ignite", state: "open" },
  {
    kind: "page",
    label: "Announcements",
    to: "/courses/$courseId/announcements",
    state: "open",
  },
  { kind: "page", label: "Syllabus", to: "/courses/$courseId/syllabus", state: "open" },
  { kind: "page", label: "Modules", to: "/courses/$courseId/modules", state: "open" },
  { kind: "page", label: "Assignments", to: "/courses/$courseId/assignments", state: "open" },
  { kind: "page", label: "Discussions", to: "/courses/$courseId/discussions", state: "open" },
  { kind: "page", label: "Quizzes", to: "/courses/$courseId/quizzes", state: "hidden" },
  {
    kind: "tool",
    label: "Attendance",
    toolId: "attendance",
    state: "open",
    external: true,
    blurb:
      "Roll call and seating charts run in the attendance tool. Sessions sync back to the gradebook once the lecturer submits them.",
  },
  { kind: "page", label: "Rubrics", to: "/courses/$courseId/rubrics", state: "open" },
  { kind: "page", label: "Grades", to: "/courses/$courseId/progress", state: "open" },
  { kind: "page", label: "People", to: "/courses/$courseId/people", state: "open" },
  {
    kind: "tool",
    label: "Course Analytics",
    toolId: "analytics",
    state: "open",
    external: true,
    blurb:
      "Participation, submission timing and grade distribution for the cohort, rendered by the analytics tool.",
  },
  {
    kind: "tool",
    label: "Parchment Badges",
    toolId: "badges",
    state: "open",
    external: true,
    blurb:
      "Issue and verify digital badges and certificates for learners who complete the course outcomes.",
  },
  {
    kind: "tool",
    label: "Files",
    toolId: "files",
    state: "disabled",
    external: false,
    blurb: "Course file storage. Turned off for students, so files reach them through modules.",
  },
  {
    kind: "tool",
    label: "Pages",
    toolId: "pages",
    state: "disabled",
    external: false,
    blurb: "Wiki style pages. Turned off, module bodies carry the reading material instead.",
  },
  {
    kind: "tool",
    label: "Outcomes",
    toolId: "outcomes",
    state: "disabled",
    external: false,
    blurb: "Outcome mastery tracking. Turned off, rubrics carry the criteria for now.",
  },
  {
    kind: "tool",
    label: "Collaborations",
    toolId: "collaborations",
    state: "disabled",
    external: false,
    blurb: "Shared documents. Turned off, group work happens on the shared canvas.",
  },
  {
    kind: "tool",
    label: "Item Banks",
    toolId: "item-banks",
    state: "disabled",
    external: false,
    blurb: "Reusable question banks for quizzes. Turned off while quizzes stay unpublished.",
  },
  { kind: "page", label: "Settings", to: "/courses/$courseId/settings", state: "staff" },
];

export function courseToolById(toolId: string) {
  return COURSE_MENU.find(
    (item): item is CourseToolItem => item.kind === "tool" && item.toolId === toolId,
  );
}

/** What a given role may see in the course rail. */
export function visibleCourseMenu(isStaff: boolean) {
  return COURSE_MENU.filter((item) => (isStaff ? true : item.state === "open"));
}
