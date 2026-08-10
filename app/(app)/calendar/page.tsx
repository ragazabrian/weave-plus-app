import { calendarEvents } from "@/lib/mock-data";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Calendar" description="Merged deadlines across all your courses." />
      <div className="rounded-cards-small overflow-hidden">
        {calendarEvents.map((event, i) => (
          <div
            key={event.id}
            className={`flex items-center justify-between px-5 py-4 ${i % 2 === 0 ? "bg-bone-white" : "bg-mist-gray"}`}
          >
            <div>
              <div className="text-body text-ink font-geist">{event.title}</div>
              <div className="text-body-sm text-fog">{event.courseTitle}</div>
            </div>
            <div className="text-body-sm text-graphite font-geist">{event.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
