export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-heading font-aeonik font-medium text-ink">{title}</h1>
      {description && <p className="text-body-lg text-graphite font-geist mt-2">{description}</p>}
    </div>
  );
}
