import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { createLocalStore } from "@/lib/local-store";

const KEY = "weave-analytics-consent";

export type AnalyticsConsent = "granted" | "denied" | null;

const store = createLocalStore<AnalyticsConsent>(
  KEY,
  (raw) => (raw === "granted" || raw === "denied" ? raw : null),
  (value) => value ?? "",
);

export function useAnalyticsConsent() {
  const consent = store.useStore();
  return { consent, setConsent: (next: AnalyticsConsent) => store.set(next) };
}

/**
 * Privacy consent modal. Asks once whether questions may be logged
 * anonymously, and links to the full privacy notice.
 */
export function PrivacyConsentModal() {
  const { consent, setConsent } = useAnalyticsConsent();
  const [mounted, setMounted] = useState(false);

  // Only decide after hydration so the SSR markup stays stable.
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-consent-title"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
    >
      <div
        aria-hidden
        className="absolute inset-0 animate-fade-in bg-void-canvas/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-lg animate-scale-in rounded-card bg-graphite-surface p-7 hairline sm:p-9">
        <button
          onClick={() => setConsent("denied")}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-pill bg-muted p-2 text-smoke transition-colors hover:bg-accent hover:text-snow-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
        </button>

        <span className="flex h-10 w-10 items-center justify-center rounded-card-sm bg-muted hairline">
          <HugeiconsIcon
            icon={SparklesIcon}
            size={18}
            strokeWidth={1.6}
            className="text-snow-white"
          />
        </span>

        <h2
          id="privacy-consent-title"
          className="mt-6 font-display text-subheading font-medium text-snow-white"
        >
          Help us improve
        </h2>
        <p className="mt-3 text-body text-ash">
          Allow your questions to be logged anonymously to help us improve weave+. You can opt out
          at any time in Settings. Read more in our{" "}
          <Link to="/privacy" className="font-medium text-snow-white underline underline-offset-4">
            Privacy Notice
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => setConsent("denied")}
            className="min-h-11 rounded-pill bg-muted px-5 py-2.5 text-body-sm font-medium text-bone transition-colors hairline hover:bg-accent hover:text-snow-white"
          >
            Don't share
          </button>
          <button
            onClick={() => setConsent("granted")}
            className="min-h-11 rounded-pill bg-snow-white px-5 py-2.5 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone"
          >
            Share analytics
          </button>
        </div>
      </div>
    </div>
  );
}
