/**
 * Direct per-user Google OAuth, owned by this repo.
 *
 * Set these in the server environment and the app talks to Google itself, with
 * no third-party gateway in the path:
 *
 *   GOOGLE_OAUTH_CLIENT_ID
 *   GOOGLE_OAUTH_CLIENT_SECRET
 *
 * Authorized redirect URI to register on the OAuth client:
 *   https://your-domain/oauth/google/return
 *
 * Server-only: never import this from browser code.
 */
import { GOOGLE_CONNECTORS, type GoogleConnectorId } from "@/lib/google-connectors";

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://www.googleapis.com";
const REVOKE_URL = "https://oauth2.googleapis.com/revoke";

/** Marks a stored credential as a Google refresh token held by this app. */
const PREFIX = "gdirect:";

export function isDirectGoogleMode(): boolean {
  return Boolean(
    process.env["GOOGLE_OAUTH_CLIENT_ID"] && process.env["GOOGLE_OAUTH_CLIENT_SECRET"],
  );
}

export function isDirectCredential(value: string): boolean {
  return value.startsWith(PREFIX);
}

export function packCredential(refreshToken: string): string {
  return `${PREFIX}${refreshToken}`;
}

function unpackCredential(value: string): string {
  return value.slice(PREFIX.length);
}

function credentials() {
  const clientId = process.env["GOOGLE_OAUTH_CLIENT_ID"];
  const clientSecret = process.env["GOOGLE_OAUTH_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth is not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.",
    );
  }
  return { clientId, clientSecret };
}

export function encodeState(connectorId: GoogleConnectorId): string {
  return btoa(JSON.stringify({ connectorId })).replace(/=+$/, "");
}

export function decodeState(state: string): GoogleConnectorId | null {
  try {
    const parsed = JSON.parse(atob(state)) as { connectorId?: string };
    return (parsed.connectorId as GoogleConnectorId) ?? null;
  } catch {
    return null;
  }
}

export function buildAuthorizationUrl(connectorId: GoogleConnectorId, redirectUri: string): string {
  const { clientId } = credentials();
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", GOOGLE_CONNECTORS[connectorId].scopes.join(" "));
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("state", encodeState(connectorId));
  return url.toString();
}

/** Swaps the redirect code for a long-lived refresh token. */
export async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<{ refreshToken: string }> {
  const { clientId, clientSecret } = credentials();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Google token exchange failed [${res.status}]: ${text}`);
  const body = JSON.parse(text) as { refresh_token?: string };
  if (!body.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Remove the app from your Google account permissions and connect again.",
    );
  }
  return { refreshToken: body.refresh_token };
}

async function accessTokenFor(refreshToken: string): Promise<string> {
  const { clientId, clientSecret } = credentials();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Google token refresh failed [${res.status}]: ${text}`);
  const body = JSON.parse(text) as { access_token?: string };
  if (!body.access_token) throw new Error("Google refresh returned no access token");
  return body.access_token;
}

/** Calls a Google API path such as "/gmail/v1/users/me/profile" as the user. */
export async function callGoogleAsUser(
  credential: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await accessTokenFor(unpackCredential(credential));
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return fetch(`${API_BASE}${normalized}`, { ...init, headers });
}

/** Best effort: tells Google to forget the grant when the user disconnects. */
export async function revokeCredential(credential: string): Promise<void> {
  try {
    await fetch(REVOKE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: unpackCredential(credential) }),
    });
  } catch (error) {
    console.error("Google revoke failed", error);
  }
}
