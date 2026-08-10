import { inboxThreads } from "@/lib/mock-data";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function InboxPage() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Inbox" description="Direct and course-scoped message threads." />
      <div className="rounded-cards-small overflow-hidden">
        {inboxThreads.map((thread, i) => (
          <div
            key={thread.id}
            className={`flex items-center justify-between px-5 py-4 ${i % 2 === 0 ? "bg-bone-white" : "bg-mist-gray"}`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {thread.unread && <span className="size-2 rounded-full bg-iris-blue shrink-0" aria-hidden />}
                <div className="text-body text-ink font-geist font-medium truncate">{thread.subject}</div>
              </div>
              <div className="text-body-sm text-fog truncate">{thread.from} — {thread.preview}</div>
            </div>
            <div className="text-body-sm text-graphite font-geist shrink-0 ml-4">{thread.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
