import { cn } from "@/lib/utils";

const SIZES = {
  xs: "text-body-sm",
  sm: "text-body",
  md: "text-body-lg",
  lg: "text-heading-sm",
  xl: "text-heading",
} as const;

export type LogoSize = keyof typeof SIZES;

/** weave+ wordmark. Text only, no mark or container. */
export function Logo({
  size = "md",
  showLabel = true,
  className,
}: {
  size?: LogoSize;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block truncate font-display font-medium tracking-[-0.03em] text-snow-white",
        SIZES[size],
        className,
      )}
    >
      {showLabel ? "weave+" : "w+"}
    </span>
  );
}
