/**
 * Browser-side popup helper for App User Connector OAuth. Secret free.
 */

export function waitForOAuthCompletion(popup: Window, connectorId: string) {
  return new Promise<void>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.connectorId !== connectorId ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") {
        resolve();
        return;
      }
      popup.close();
      reject(new Error("The connection was not completed."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("The connection window closed before it finished."));
    }, 500);
  });
}

export function openOAuthPopup() {
  const popup = window.open("", "weave-oauth", "width=600,height=720");
  if (!popup) throw new Error("Popup blocked. Allow popups and try again.");
  return popup;
}
