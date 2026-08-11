/**
 * Portable Google Sheets access.
 *
 * Primary path: a Google service account you own, so this repo works anywhere
 * with no third-party gateway involved. Set either
 *
 *   GOOGLE_SERVICE_ACCOUNT_JSON   the whole downloaded key file, or
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 *
 * and share the spreadsheet with that service account address as an Editor.
 * Optional: GOOGLE_SHEETS_SPREADSHEET_ID to point at your own copy.
 *
 * Fallback path: the managed connector gateway used by the hosted preview
 * (LOVABLE_API_KEY + GOOGLE_SHEETS_API_KEY). Only used when no service
 * account is configured.
 */

const SHEETS_API = "https://sheets.googleapis.com/v4";
const MANAGED_GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export const DEFAULT_SPREADSHEET_ID = "1j3XNnmtZgeQkQQHFls1y8HO7jT71q1CZo6vtDyFBAlo";

export function spreadsheetId(): string {
  return process.env["GOOGLE_SHEETS_SPREADSHEET_ID"] ?? DEFAULT_SPREADSHEET_ID;
}

export type SheetsMode = "service-account" | "managed" | "unconfigured";

type ServiceAccount = { clientEmail: string; privateKey: string };

function serviceAccount(): ServiceAccount | null {
  const raw = process.env["GOOGLE_SERVICE_ACCOUNT_JSON"];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string };
      if (parsed.client_email && parsed.private_key) {
        return { clientEmail: parsed.client_email, privateKey: parsed.private_key };
      }
    } catch {
      console.error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
    }
  }
  const clientEmail = process.env["GOOGLE_SERVICE_ACCOUNT_EMAIL"];
  const privateKey = process.env["GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"];
  if (clientEmail && privateKey) return { clientEmail, privateKey };
  return null;
}

export function sheetsMode(): SheetsMode {
  if (serviceAccount()) return "service-account";
  if (process.env["LOVABLE_API_KEY"] && process.env["GOOGLE_SHEETS_API_KEY"]) return "managed";
  return "unconfigured";
}

function base64url(bytes: Uint8Array | string): string {
  const binary =
    typeof bytes === "string"
      ? bytes
      : Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function accessToken(account: ServiceAccount): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.clientEmail,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const signingInput = `${header}.${claims}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(account.privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput)),
  );
  const assertion = `${signingInput}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Google token request failed [${res.status}]: ${text}`);
  const body = JSON.parse(text) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("Google token response had no access_token");

  cachedToken = {
    token: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

/**
 * Calls the Sheets API. `path` starts after the API version, for example
 * `/spreadsheets/{id}/values/Student!A1:append`.
 */
export async function sheetsFetch(path: string, init?: RequestInit): Promise<Response> {
  const account = serviceAccount();
  if (account) {
    const token = await accessToken(account);
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${SHEETS_API}${path}`, { ...init, headers });
  }

  const managedKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!managedKey || !connectionKey) {
    throw new Error("Google Sheets is not configured on the server.");
  }
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${managedKey}`);
  headers.set("X-Connection-Api-Key", connectionKey);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${MANAGED_GATEWAY}${path}`, { ...init, headers });
}

export const SHEETS_SETUP_HINT =
  "Set GOOGLE_SERVICE_ACCOUNT_JSON (or GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) and share the spreadsheet with that service account as an Editor.";
