import type {
  AgentActivityEntry,
  CalendarEvent,
  CanvasBoard,
  Course,
  InboxThread,
  Member,
  Note,
  PriorityFeedItem,
  Role,
  StatBlock,
  AssignedItem,
  RecentNote,
} from "./types";

export const courses: Course[] = [
  {
    id: "cs101",
    title: "Intro to Systems Design",
    code: "CS101",
    wash: "lavender",
    term: "Fall 2026",
    progressPct: 62,
    announcements: [
      {
        id: "a1",
        title: "Midterm moved to next Thursday",
        body: "We're pushing the midterm one week to give everyone time to finish the caching module.",
        postedAt: "2026-08-08",
        author: "Dr. Elena Cho",
      },
      {
        id: "a2",
        title: "Office hours added",
        body: "Added a second office-hours slot on Wednesdays at 3pm.",
        postedAt: "2026-08-04",
        author: "Dr. Elena Cho",
      },
    ],
    modules: [
      { id: "m1", title: "Foundations of distributed systems", summary: "CAP theorem, consistency models, replication.", noteCount: 6 },
      { id: "m2", title: "Caching and load balancing", summary: "Cache invalidation, CDN strategy, load balancer types.", noteCount: 4 },
      { id: "m3", title: "Queues and async processing", summary: "Message queues, backpressure, dead-letter handling.", noteCount: 5 },
    ],
    assignments: [
      {
        id: "as1",
        title: "Design a rate limiter",
        dueLabel: "Due in 2 days",
        submissions: [
          { id: "s1", studentName: "Maya Lin", submittedAt: "2026-08-09", status: "submitted" },
          { id: "s2", studentName: "Jordan Reyes", submittedAt: null, status: "missing" },
          { id: "s3", studentName: "Priya Nair", submittedAt: "2026-08-07", status: "graded", grade: "A-" },
        ],
      },
    ],
  },
  {
    id: "cs204",
    title: "Applied Machine Learning",
    code: "CS204",
    wash: "mint",
    term: "Fall 2026",
    progressPct: 41,
    announcements: [
      {
        id: "a3",
        title: "Dataset for project 2 released",
        body: "Grab the cleaned dataset from the Modules tab before Friday's lab.",
        postedAt: "2026-08-06",
        author: "Prof. Sam Okafor",
      },
    ],
    modules: [
      { id: "m4", title: "Feature engineering", summary: "Encoding, scaling, leakage traps.", noteCount: 3 },
      { id: "m5", title: "Model evaluation", summary: "Cross-validation, precision/recall tradeoffs.", noteCount: 4 },
    ],
    assignments: [
      {
        id: "as2",
        title: "Project 2: Classifier report",
        dueLabel: "Due in 6 days",
        submissions: [
          { id: "s4", studentName: "Maya Lin", submittedAt: null, status: "missing" },
          { id: "s5", studentName: "Diego Fuentes", submittedAt: "2026-08-08", status: "submitted" },
        ],
      },
    ],
  },
  {
    id: "hum110",
    title: "Design Ethics Seminar",
    code: "HUM110",
    wash: "powder",
    term: "Fall 2026",
    progressPct: 78,
    announcements: [],
    modules: [
      { id: "m6", title: "Consent and dark patterns", summary: "Reading discussion, week 5.", noteCount: 2 },
    ],
    assignments: [],
  },
];

export const priorityFeedByRole: Record<Role, PriorityFeedItem[]> = {
  admin: [
    { id: "p1", severity: "p0", title: "3 students in CS204 are falling behind pace", reason: "Cohort completion rate dropped 22% below median over the last 7 days.", href: "/courses/cs204" },
    { id: "p2", severity: "p1", title: "HUM110 has no assignments before term end", reason: "Course ends in 18 days with zero graded deliverables scheduled.", href: "/courses/hum110" },
    { id: "p3", severity: "p2", title: "CS101 module 3 has low engagement", reason: "Only 40% of enrolled students have opened Module 3 notes.", href: "/courses/cs101" },
  ],
  lecturer: [
    { id: "p4", severity: "p0", title: "Grade 'Design a rate limiter' submissions", reason: "2 of 3 submissions are 5+ days old and block Module 3 unlock.", href: "/courses/cs101" },
    { id: "p5", severity: "p1", title: "Module 2 drop-off spike in CS204", reason: "31% of students exited Module 2 before completing the last section.", href: "/courses/cs204" },
    { id: "p6", severity: "p2", title: "Jordan Reyes missing rate limiter submission", reason: "No submission logged and assignment is due in 2 days.", href: "/courses/cs101" },
  ],
  student: [
    { id: "p7", severity: "p0", title: "Classifier report due in 6 days", reason: "You haven't started — this assignment usually takes classmates 3+ sessions.", href: "/courses/cs204" },
    { id: "p8", severity: "p1", title: "You're behind cohort pace in CS101", reason: "You've completed Module 2 while 70% of the class has started Module 3.", href: "/courses/cs101" },
    { id: "p9", severity: "p2", title: "Rate limiter design due in 2 days", reason: "Estimated 2 hours of work remaining based on similar past assignments.", href: "/courses/cs101" },
  ],
};

export const statsByRole: Record<Role, StatBlock[]> = {
  admin: [
    { id: "s1", label: "Active courses", value: "3" },
    { id: "s2", label: "Total members", value: "142" },
    { id: "s3", label: "At-risk students", value: "7" },
  ],
  lecturer: [
    { id: "s1", label: "Courses you teach", value: "2" },
    { id: "s2", label: "Ungraded submissions", value: "4" },
    { id: "s3", label: "Students enrolled", value: "68" },
  ],
  student: [
    { id: "s1", label: "Enrolled courses", value: "3" },
    { id: "s2", label: "Assignments due this week", value: "2" },
    { id: "s3", label: "Notes updated", value: "9" },
  ],
};

export const recentNotesByRole: Record<Role, RecentNote[]> = {
  admin: [
    { id: "n1", title: "Q3 cohort risk review", updatedAt: "2 hours ago" },
    { id: "n2", title: "Workspace onboarding checklist", updatedAt: "yesterday" },
  ],
  lecturer: [
    { id: "n3", title: "Rate limiter grading rubric", updatedAt: "1 hour ago" },
    { id: "n4", title: "CS204 lecture 6 outline", updatedAt: "yesterday" },
  ],
  student: [
    { id: "n5", title: "CAP theorem — my summary", updatedAt: "3 hours ago" },
    { id: "n6", title: "Feature engineering cheatsheet", updatedAt: "2 days ago" },
  ],
};

export const assignedByRole: Record<Role, AssignedItem[]> = {
  admin: [],
  lecturer: [
    { id: "as1", title: "Design a rate limiter", courseTitle: "CS101", dueLabel: "2 ungraded", href: "/courses/cs101" },
    { id: "as2", title: "Classifier report", courseTitle: "CS204", dueLabel: "1 ungraded", href: "/courses/cs204" },
  ],
  student: [
    { id: "as1", title: "Design a rate limiter", courseTitle: "CS101", dueLabel: "Due in 2 days", href: "/courses/cs101" },
    { id: "as2", title: "Classifier report", courseTitle: "CS204", dueLabel: "Due in 6 days", href: "/courses/cs204" },
  ],
};

export const notes: Note[] = [
  {
    id: "n5",
    title: "CAP theorem — my summary",
    tags: ["cs101", "systems"],
    updatedAt: "3 hours ago",
    content: "Consistency, Availability, Partition tolerance — you can only guarantee two of the three during a network partition. Most distributed databases pick AP or CP explicitly.",
    backlinks: [{ id: "n7", title: "Caching and load balancing" }],
    versions: [
      { id: "v1", editedBy: "You", editedAt: "3 hours ago" },
      { id: "v2", editedBy: "You", editedAt: "yesterday" },
    ],
  },
  {
    id: "n6",
    title: "Feature engineering cheatsheet",
    tags: ["cs204", "ml"],
    updatedAt: "2 days ago",
    content: "One-hot encode low-cardinality categoricals, target-encode high-cardinality ones with care for leakage. Always fit scalers on train only.",
    backlinks: [],
    versions: [{ id: "v3", editedBy: "You", editedAt: "2 days ago" }],
  },
  {
    id: "n7",
    title: "Caching and load balancing",
    tags: ["cs101", "systems"],
    updatedAt: "5 days ago",
    content: "Write-through vs write-back caching. Round robin vs least-connections load balancing.",
    backlinks: [{ id: "n5", title: "CAP theorem — my summary" }],
    versions: [{ id: "v4", editedBy: "You", editedAt: "5 days ago" }],
  },
];

export const calendarEvents: CalendarEvent[] = [
  { id: "c1", title: "Design a rate limiter due", courseTitle: "CS101", date: "Aug 12" },
  { id: "c2", title: "Midterm", courseTitle: "CS101", date: "Aug 14" },
  { id: "c3", title: "Classifier report due", courseTitle: "CS204", date: "Aug 16" },
  { id: "c4", title: "Seminar discussion", courseTitle: "HUM110", date: "Aug 18" },
];

export const inboxThreads: InboxThread[] = [
  { id: "i1", subject: "Re: Midterm date change", from: "Dr. Elena Cho", preview: "Just confirming the new midterm time works for everyone...", time: "10:24 AM", unread: true },
  { id: "i2", subject: "Project 2 dataset question", from: "Diego Fuentes", preview: "Is the cleaned dataset the one linked in Modules?", time: "Yesterday", unread: true },
  { id: "i3", subject: "Office hours confirmation", from: "Prof. Sam Okafor", preview: "See you at 3pm Wednesday.", time: "Mon", unread: false },
];

export const canvasBoards: CanvasBoard[] = [
  { id: "cv1", title: "System design whiteboard — rate limiter", courseTitle: "CS101", collaborators: 4, updatedAt: "1 hour ago" },
  { id: "cv2", title: "Model architecture sketch", courseTitle: "CS204", collaborators: 2, updatedAt: "yesterday" },
];

export const agentActivityLog: AgentActivityEntry[] = [
  { id: "ag1", action: "Flagged at-risk student", target: "Jordan Reyes — CS101", at: "10 minutes ago" },
  { id: "ag2", action: "Summarized module drop-off", target: "CS204 Module 2", at: "1 hour ago" },
  { id: "ag3", action: "Drafted grading rubric", target: "Design a rate limiter", at: "3 hours ago" },
];

export const members: Member[] = [
  { id: "u1", name: "Dr. Elena Cho", role: "lecturer", courses: ["CS101"] },
  { id: "u2", name: "Prof. Sam Okafor", role: "lecturer", courses: ["CS204"] },
  { id: "u3", name: "Maya Lin", role: "student", courses: ["CS101", "CS204"] },
  { id: "u4", name: "Jordan Reyes", role: "student", courses: ["CS101"] },
  { id: "u5", name: "Priya Nair", role: "student", courses: ["CS101"] },
  { id: "u6", name: "Diego Fuentes", role: "student", courses: ["CS204"] },
  { id: "u7", name: "Workspace Admin", role: "admin", courses: [] },
];

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getNoteById(id: string): Note | undefined {
  return notes.find((n) => n.id === id);
}

export function coursesForRole(role: Role): Course[] {
  if (role === "lecturer") return courses.filter((c) => c.id === "cs101" || c.id === "cs204");
  if (role === "student") return courses.filter((c) => c.id === "cs101" || c.id === "cs204");
  return courses;
}
