import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { completeGoogleConnect } from "@/lib/google-connect.functions";

export const Route = createFileRoute("/oauth/google/return")({
  head: () => ({
    meta: [
      { title: "Finishing your Google connection | weave+" },
      {
        name: "description",
        content:
          "weave+ is saving your Google connection. This window closes automatically once it is done.",
      },
      { property: "og:title", content: "Finishing your Google connection | weave+" },
      {
        property: "og:description",
        content: "weave+ is saving your Google connection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OAuthReturn,
});

function OAuthReturn() {
  const [message, setMessage] = useState("Finishing your connection...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectorId = params.get("connector_id") ?? "";
    const notifyOpenerAndClose = (
      type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed",
    ) => {
      window.opener?.postMessage({ type, connectorId }, window.location.origin);
      window.close();
    };

    const code = params.get("code");
    const state = params.get("state");
    // Direct Google OAuth lands here with just code and state; the managed
    // gateway adds success=true. Both end in the same server exchange.
    const directRedirect = Boolean(code && state && !params.has("success"));

    if (!directRedirect && params.get("success") !== "true") {
      setMessage(params.get("error") ?? "The connection did not complete.");
      notifyOpenerAndClose("appUserConnectorOAuthFailed");
      return;
    }

    if (!code) {
      if (params.get("offline_access_allowed") === "false") {
        notifyOpenerAndClose("appUserConnectorOAuthComplete");
        return;
      }
      setMessage("The connection finished without an exchange code.");
      notifyOpenerAndClose("appUserConnectorOAuthFailed");
      return;
    }

    void completeGoogleConnect({ data: { code, ...(state ? { state } : {}) } })
      .then(() => notifyOpenerAndClose("appUserConnectorOAuthComplete"))
      .catch(() => {
        setMessage("We could not save the connection. Close this window and try again.");
        notifyOpenerAndClose("appUserConnectorOAuthFailed");
      });
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p className="text-body-sm text-ash">{message}</p>
    </main>
  );
}
