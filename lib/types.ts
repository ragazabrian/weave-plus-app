export type Role = "admin" | "lecturer" | "student";

export type Severity = "p0" | "p1" | "p2";

export type PastelWash = "lavender" | "mint" | "powder" | "solar";

export interface PriorityFeedItem {
  id: string;
  severity: Severity;
  title: string;
  reason: string;
  href: string;
}

export interface StatBlock {
  id: string;
  label: string;
  value: string;
}

export interface RecentNote {
  id: string;
  title: string;
  updatedAt: string;
}

export interface AssignedItem {
  id: string;
  title: string;
  courseTitle: string;
  dueLabel: string;
  href: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  postedAt: string;
  author: string;
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  noteCount: number;
}

export interface Submission {
  id: string;
  studentName: string;
  submittedAt: string | null;
  status: "submitted" | "missing" | "graded";
  grade?: string;
}

export interface Assignment {
  id: string;
  title: string;
  dueLabel: string;
  submissions: Submission[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  wash: PastelWash;
  term: string;
  progressPct: number;
  announcements: Announcement[];
  modules: Module[];
  assignments: Assignment[];
}

export interface Backlink {
  id: string;
  title: string;
}

export interface NoteVersion {
  id: string;
  editedBy: string;
  editedAt: string;
}

export interface Note {
  id: string;
  title: string;
  tags: string[];
  updatedAt: string;
  content: string;
  backlinks: Backlink[];
  versions: NoteVersion[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  courseTitle: string;
  date: string;
}

export interface InboxThread {
  id: string;
  subject: string;
  from: string;
  preview: string;
  time: string;
  unread: boolean;
}

export interface CanvasBoard {
  id: string;
  title: string;
  courseTitle: string;
  collaborators: number;
  updatedAt: string;
}

export interface AgentActivityEntry {
  id: string;
  action: string;
  target: string;
  at: string;
}

export interface Member {
  id: string;
  name: string;
  role: Role;
  courses: string[];
}
