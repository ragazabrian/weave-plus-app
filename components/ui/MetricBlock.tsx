interface MetricBlockProps {
  label: string;
  value: string;
}

export function MetricBlock({ label, value }: MetricBlockProps) {
  return (
    <div className="bg-bone-white rounded-cards-small p-5">
      <div className="text-body-sm text-fog">{label}</div>
      <div className="text-heading-sm font-aeonik font-medium text-ink mt-1">{value}</div>
    </div>
  );
}
