"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/lib/role-context";
import type { Role } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  hideFor?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Notes", href: "/notes" },
  { label: "Canvas", href: "/canvas" },
  { label: "Courses", href: "/courses" },
  { label: "Calendar", href: "/calendar" },
  { label: "Inbox", href: "/inbox" },
  { label: "Agent", href: "/agent" },
  { label: "Members", href: "/members", hideFor: ["student"] },
  { label: "Settings", href: "/settings", hideFor: ["student"] },
];

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  lecturer: "Lecturer",
  student: "Student",
};

export function Sidebar() {
  const pathname = usePathname();
  const { role, setRole } = useRole();

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 px-4 py-8">
      <div className="px-3 text-heading-sm font-aeonik font-medium text-ink mb-8">weave+</div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.filter((item) => !item.hideFor?.includes(role)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-body font-medium font-geist rounded-tags ${
                active ? "bg-lavender-wash text-ink" : "text-graphite hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3">
        <div className="text-caption text-fog mb-2 uppercase tracking-wide">Viewing as</div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full bg-bone-white text-body-sm text-ink rounded-inputs px-3 py-2 font-geist cursor-pointer"
        >
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r]}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
