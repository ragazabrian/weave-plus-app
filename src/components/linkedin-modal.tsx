import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { createLocalStore } from "@/lib/local-store";
import qrAsset from "@/assets/linkedin-qr.png.asset.json";

const KEY = "weave-linkedin-invite";
const PROFILE_URL = "https://www.linkedin.com/in/ragazabrian/";

const store = createLocalStore<"seen" | null>(
  KEY,
  (raw) => (raw === "seen" ? "seen" : null),
  (value) => value ?? "",
);

/**
 * Follow invite, built like the privacy modal so both feel like one family.
 * Shows once per browser, and can be reopened from the footer link.
 */
export function LinkedInInviteModal({
  open: openProp,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
} = {}) {
  const seen = store.useStore();
  const controlled = openProp !== undefined;
  const [auto, setAuto] = useState(false);

  useEffect(() => {
    if (controlled || seen === "seen") return;
    const timer = window.setTimeout(() => setAuto(true), 6500);
    return () => window.clearTimeout(timer);
  }, [controlled, seen]);

  const open = controlled ? openProp : auto;
  if (!open) return null;

  function close() {
    store.set("seen");
    setAuto(false);
    onClose?.();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="linkedin-invite-title"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8"
    >
      <div
        aria-hidden
        onClick={close}
        className="absolute inset-0 animate-fade-in bg-void-canvas/75 backdrop-blur-sm"
      />
      <div className="relative max-h-full w-full max-w-md animate-scale-in overflow-y-auto rounded-card bg-graphite-surface p-6 text-center hairline sm:p-8">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-pill bg-muted p-2 text-smoke transition-colors hover:bg-accent hover:text-snow-white"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
        </button>

        <h2
          id="linkedin-invite-title"
          className="font-display text-subheading font-medium text-snow-white"
        >
          Follow me on LinkedIn
        </h2>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="rounded-card-sm bg-snow-white p-3">
            <img
              src={qrAsset.url}
              alt="QR code linking to the LinkedIn profile of Brian Jess Ragaza"
              width={800}
              height={800}
              loading="lazy"
              className="h-[200px] w-[200px] object-contain"
            />
          </div>
          <p className="text-body-sm text-slate">Scan the code, or open the profile.</p>
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noreferrer noopener"
            onClick={close}
            className="flex min-h-11 items-center justify-center rounded-pill bg-snow-white px-5 py-2.5 text-body-sm font-medium text-graphite-surface transition-colors hover:bg-bone"
          >
            Follow on LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
