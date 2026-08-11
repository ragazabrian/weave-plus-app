import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, EmptyState, PageHeader } from "@/components/kit";

export const Route = createFileRoute("/_authenticated/account/qr")({
  head: () => ({
    meta: [
      { title: "QR for Mobile Login | weave+" },
      {
        name: "description",
        content: "Scan a QR code to open weave+ on your phone and sign in on the same workspace.",
      },
      { property: "og:title", content: "QR for Mobile Login | weave+" },
      {
        property: "og:description",
        content: "A scannable code that opens the weave+ sign in screen on your mobile device.",
      },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [target, setTarget] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/auth`;
    setTarget(url);
    let active = true;
    import("qrcode")
      .then((mod) =>
        mod.toDataURL(url, {
          width: 512,
          margin: 1,
          color: { dark: "#0e0f2d", light: "#ffffff" },
        }),
      )
      .then((value) => {
        if (active) setDataUrl(value);
      })
      .catch(() => setDataUrl(null));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="QR for Mobile Login"
        description="Point your phone camera at the code. It opens the weave+ sign in screen, then your session continues on mobile."
      />
      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="flex flex-col items-center gap-4">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="QR code that opens the weave+ sign in screen"
              className="h-56 w-56 rounded-card-sm bg-snow-white p-2"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-card-sm bg-muted text-body-sm text-slate hairline">
              Generating…
            </div>
          )}
          <p className="break-all text-center text-caption text-slate">{target}</p>
        </Card>
        <Card>
          <h2 className="text-body font-medium text-snow-white">How it works</h2>
          <ol className="mt-4 flex flex-col gap-3 text-body-sm text-bone">
            <li>1. Open the camera app on your phone and scan the code.</li>
            <li>2. Sign in with the same email or Google account you use here.</li>
            <li>3. Courses, notes and the calendar stay in sync across both devices.</li>
          </ol>
          <EmptyState>
            The code carries no credentials. It only points to the sign in screen, so it is safe to
            show on a projector.
          </EmptyState>
        </Card>
      </div>
    </div>
  );
}
