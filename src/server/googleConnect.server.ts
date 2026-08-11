/**
 * Server-only implementation for per-user Google connections.
 *
 * Two interchangeable paths, chosen from the environment:
 *   1. Direct Google OAuth owned by this repo (GOOGLE_OAUTH_CLIENT_ID and
 *      GOOGLE_OAUTH_CLIENT_SECRET). Preferred, portable, no gateway.
 *   2. The managed connector gateway used by the hosted preview, only when no
 *      Google OAuth client is configured.
 */
import {
  authorizeAppUserOAuth,
  callAsAppUser,
  disconnectAppUser,
  exchangeAppUserOAuthCode,
} from "@/integrations/lovable/appUserConnector";
import {
  buildAuthorizationUrl,
  callGoogleAsUser,
  decodeState,
  exchangeCode,
  isDirectCredential,
  isDirectGoogleMode,
  packCredential,
  revokeCredential,
} from "@/server/googleDirectOAuth.server";
import {
  GOOGLE_CONNECTORS,
  GOOGLE_CONNECTOR_IDS,
  isGoogleConnectorId,
  type GoogleConnectorId,
} from "@/lib/google-connectors";
import {
  deleteConnectionForUser,
  getConnectionKeyForUser,
  listConnectedConnectorIds,
  saveConnectionKeyForUser,
} from "@/server/appUserConnections.server";

export const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

export type GoogleConnectionState = {
  connectorId: GoogleConnectorId;
  connected: boolean;
  /** True when OAuth credentials exist, so connecting is possible. */
  available: boolean;
  account: string | null;
  error: string | null;
};

function requireConnector(connectorId: string): GoogleConnectorId {
  if (!isGoogleConnectorId(connectorId)) {
    throw new Error(`${connectorId} is not a supported Google connector`);
  }
  return connectorId;
}

function clientApiKey(connectorId: GoogleConnectorId): string | null {
  return process.env[GOOGLE_CONNECTORS[connectorId].clientApiKeyEnvVar] ?? null;
}

function returnUrl(requestUrl: string): string {
  return new URL("/oauth/google/return", requestUrl).toString();
}

export async function startConnect(userId: string, rawConnectorId: string, requestUrl: string) {
  const connectorId = requireConnector(rawConnectorId);
  const config = GOOGLE_CONNECTORS[connectorId];

  if (isDirectGoogleMode()) {
    return { authorizationUrl: buildAuthorizationUrl(connectorId, returnUrl(requestUrl)) };
  }

  const key = clientApiKey(connectorId);
  if (!key) {
    throw new Error(
      `${config.label} is not set up yet. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to connect Google directly.`,
    );
  }

  // Reconnect: pass the stored key so the gateway can confirm ownership.
  const existing = await getConnectionKeyForUser(userId, connectorId);

  const { authorizationUrl } = await authorizeAppUserOAuth({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectorId,
    appUserId: userId,
    clientAPIKey: key,
    returnUrl: returnUrl(requestUrl),
    ...(existing ? { connectionAPIKey: existing } : {}),
    credentialsConfiguration: { scopes: config.scopes },
  });

  return { authorizationUrl };
}

export async function completeConnect(
  userId: string,
  code: string,
  options?: { state?: string; requestUrl?: string },
) {
  if (isDirectGoogleMode() && options?.state) {
    const connectorId = decodeState(options.state);
    if (!connectorId || !isGoogleConnectorId(connectorId)) {
      throw new Error("The Google redirect did not say which product it was for.");
    }
    const redirectUri = returnUrl(options.requestUrl ?? "http://localhost");
    const { refreshToken } = await exchangeCode(code, redirectUri);
    await saveConnectionKeyForUser(userId, connectorId, packCredential(refreshToken));
    return { ok: true as const, connectorId };
  }

  const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(GATEWAY_BASE_URL, code);
  const checked = requireConnector(connectorId);
  await saveConnectionKeyForUser(userId, checked, connectionAPIKey);
  return { ok: true as const, connectorId: checked };
}

async function probe(credential: string, connectorId: GoogleConnectorId): Promise<Response> {
  const path = GOOGLE_CONNECTORS[connectorId].probePath;
  if (isDirectCredential(credential)) return callGoogleAsUser(credential, path);
  return callAsAppUser({
    gatewayBaseUrl: GATEWAY_BASE_URL,
    connectionAPIKey: credential,
    connectorId,
    path,
  });
}

async function describeAccount(
  userId: string,
  connectorId: GoogleConnectorId,
): Promise<{ account: string | null; error: string | null }> {
  try {
    const credential = await getConnectionKeyForUser(userId, connectorId);
    if (!credential) return { account: null, error: null };
    const res = await probe(credential, connectorId);
    if (!res.ok) {
      const body = await res.text();
      return { account: null, error: `Google returned ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as Record<string, any>;
    const account =
      data?.["user"]?.emailAddress ?? data?.["emailAddress"] ?? data?.["items"]?.[0]?.id ?? null;
    return { account: typeof account === "string" ? account : null, error: null };
  } catch (error) {
    return { account: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function listConnections(userId: string): Promise<GoogleConnectionState[]> {
  const connected = new Set(await listConnectedConnectorIds(userId));
  const directMode = isDirectGoogleMode();
  return Promise.all(
    GOOGLE_CONNECTOR_IDS.map(async (connectorId) => {
      const isConnected = connected.has(connectorId);
      const detail = isConnected
        ? await describeAccount(userId, connectorId)
        : { account: null, error: null };
      return {
        connectorId,
        connected: isConnected,
        available: directMode || Boolean(clientApiKey(connectorId)),
        account: detail.account,
        error: detail.error,
      };
    }),
  );
}

export async function removeConnection(userId: string, rawConnectorId: string) {
  const connectorId = requireConnector(rawConnectorId);
  const credential = await getConnectionKeyForUser(userId, connectorId);
  if (credential) {
    if (isDirectCredential(credential)) {
      await revokeCredential(credential);
    } else {
      await disconnectAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey: credential,
        connectorId,
      });
    }
  }
  await deleteConnectionForUser(userId, connectorId);
  return { ok: true as const };
}
