import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";

import { PageHeader, Pill, EmptyState } from "@/components/kit";
import { CATEGORY_LABELS, INTEGRATIONS, type IntegrationCategory } from "@/lib/integrations";
import {
  CONNECTOR_BY_INTEGRATION,
  GOOGLE_CONNECTORS,
  type GoogleConnectorId,
} from "@/lib/google-connectors";
import {
  disconnectGoogleConnector,
  getGoogleConnections,
  startGoogleConnect,
} from "@/lib/google-connect.functions";
import { openOAuthPopup, waitForOAuthCompletion } from "@/lib/app-user-connector-client";
import { useEnabledPlugins } from "@/lib/plugins-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/plugins")({
  head: () => ({
    meta: [
      { title: "Integrations | weave+" },
      {
        name: "description",
        content:
          "Connect Drive, Gmail, Slack, Notion, Teams, GitHub and more so weave+ search and the agent can reach work outside the vault.",
      },
      { property: "og:title", content: "Integrations | weave+" },
      {
        property: "og:description",
        content:
          "Turn on the connectors your workspace needs. Each one becomes a source the agent can read.",
      },
    ],
  }),
  component: IntegrationsPage,
});

const FILTERS: (IntegrationCategory | "all")[] = [
  "all",
  "productivity",
  "communication",
  "storage",
  "development",
  "learning",
  "data",
];

/** Real company mark from the Simple Icons CDN, with initials as the fallback. */
function LogoMark({ id, name }: { id: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const slug = id.replace(/[^a-z0-9]/g, "");
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-card-sm bg-muted hairline">
      {failed ? (
        <span aria-hidden className="text-caption font-medium text-snow-white">
          {name.slice(0, 2).toUpperCase()}
        </span>
      ) : (
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt={`${name} logo`}
          loading="lazy"
          className="h-5 w-5 object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function IntegrationsPage() {
  const [filter, setFilter] = useState<IntegrationCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { enabled, toggle } = useEnabledPlugins();
  const queryClient = useQueryClient();

  const connections = useQuery({
    queryKey: ["google-connections"],
    queryFn: () => getGoogleConnections(),
  });

  const stateFor = (connectorId: GoogleConnectorId) =>
    connections.data?.find((row) => row.connectorId === connectorId) ?? null;

  // Keep the sidebar's enabled list in step with the real connections.
  useEffect(() => {
    if (!connections.data) return;
    for (const row of connections.data) {
      const integrationId = GOOGLE_CONNECTORS[row.connectorId].integrationId;
      if (row.connected !== enabled.has(integrationId)) toggle(integrationId);
    }
  }, [connections.data]);

  const disconnect = useMutation({
    mutationFn: (connectorId: GoogleConnectorId) =>
      disconnectGoogleConnector({ data: { connectorId } }),
    onSuccess: () => {
      toast.success("Disconnected");
      void queryClient.invalidateQueries({ queryKey: ["google-connections"] });
    },
    onError: (error: unknown) =>
      toast.error(error instanceof Error ? error.message : "Could not disconnect"),
  });

  async function connect(connectorId: GoogleConnectorId) {
    setBusy(connectorId);
    let popup: Window | null = null;
    try {
      popup = openOAuthPopup();
      const { authorizationUrl } = await startGoogleConnect({ data: { connectorId } });
      const completion = waitForOAuthCompletion(popup, connectorId);
      popup.location.href = authorizationUrl;
      await completion;
      toast.success(`${GOOGLE_CONNECTORS[connectorId].label} connected`);
      await queryClient.invalidateQueries({ queryKey: ["google-connections"] });
    } catch (error) {
      popup?.close();
      toast.error(error instanceof Error ? error.message : "Could not start the connection");
    } finally {
      setBusy(null);
    }
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTEGRATIONS.filter(
      (item) =>
        (filter === "all" || item.categories.includes(filter)) &&
        (q === "" ||
          item.name.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.vendor.toLowerCase().includes(q)),
    );
  }, [filter, query]);

  const connectedCount = connections.data?.filter((row) => row.connected).length ?? 0;
  const connectableCount = Object.keys(GOOGLE_CONNECTORS).length;

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Google connections are live: sign in with your own Google account and weave+ reads only what you approve. The rest of the catalogue is on the way."
        action={
          <Pill tone="mist">
            {connectedCount} of {connectableCount} connected
          </Pill>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-pill px-4 py-2 hairline">
          <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.6} className="text-slate" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search integrations"
            className="w-full bg-transparent text-body-sm text-snow-white outline-none placeholder:text-slate"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={cn(
                "min-h-11 rounded-pill px-4 py-2 text-body-sm font-medium transition-colors",
                filter === item
                  ? "bg-snow-white text-graphite-surface"
                  : "text-smoke hairline hover:bg-muted hover:text-snow-white",
              )}
            >
              {item === "all" ? "All" : CATEGORY_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState>No integrations match that search.</EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.map((item) => {
            const connectorId = CONNECTOR_BY_INTEGRATION[item.id];
            const live = connectorId ? stateFor(connectorId) : null;
            const on = Boolean(live?.connected);
            const pending =
              busy === connectorId ||
              (disconnect.isPending && disconnect.variables === connectorId);
            const setupNeeded = Boolean(connectorId) && live !== null && !live.available;
            return (
              <article
                key={item.id}
                id={item.id}
                className={cn(
                  "flex h-full flex-col rounded-card p-6 frost transition-transform duration-300 ease-out",
                  connectorId ? "hover:-translate-y-0.5" : "opacity-70",
                )}
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <LogoMark id={item.id} name={item.name} />
                    <div className="min-w-0">
                      <p className="truncate text-body font-medium text-snow-white">{item.name}</p>
                      <p className="text-caption text-slate">{item.vendor}</p>
                    </div>
                  </div>
                  {on ? (
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      size={18}
                      strokeWidth={1.6}
                      className="shrink-0 text-snow-white"
                      aria-label="Connected"
                    />
                  ) : null}
                </div>

                <div className="flex-1">
                  <p className="mt-4 text-body-sm text-ash">{item.summary}</p>

                  {on && live?.account ? (
                    <p className="mt-3 text-caption text-smoke">Connected as {live.account}</p>
                  ) : null}
                  {on && live?.error ? (
                    <p className="mt-3 text-caption text-slate">
                      Connected, but the last read failed. Try reconnecting.
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded-pill px-2.5 py-0.5 text-caption text-slate hairline"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: categories on top, the action always bottom right */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {item.categories.map((category) => (
                    <span key={category} className="text-caption text-slate">
                      {CATEGORY_LABELS[category]}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  {connectorId ? (
                    <button
                      onClick={() =>
                        on ? disconnect.mutate(connectorId) : void connect(connectorId)
                      }
                      aria-pressed={on}
                      disabled={pending || connections.isLoading || setupNeeded}
                      title={
                        setupNeeded
                          ? "A workspace owner still needs to finish the Google connector setup."
                          : undefined
                      }
                      className={cn(
                        "min-h-11 shrink-0 rounded-pill px-4 py-1.5 text-body-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                        on
                          ? "text-smoke hairline hover:bg-muted hover:text-snow-white"
                          : "bg-snow-white text-graphite-surface hover:bg-bone",
                      )}
                    >
                      {pending
                        ? on
                          ? "Disconnecting..."
                          : "Connecting..."
                        : setupNeeded
                          ? "Setup needed"
                          : on
                            ? "Disconnect"
                            : "Connect"}
                    </button>
                  ) : (
                    <span className="flex min-h-11 shrink-0 items-center rounded-pill px-4 py-1.5 text-body-sm font-medium text-slate hairline">
                      Coming soon
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-caption text-slate">
        Connected sources also show under Integrations in the sidebar.{" "}
        <Link to="/agent" search={{}} className="text-smoke underline-offset-4 hover:underline">
          Ask the agent
        </Link>{" "}
        to use one of them.
      </p>
    </div>
  );
}
