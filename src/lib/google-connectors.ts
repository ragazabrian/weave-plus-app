/**
 * The Google products weave+ can genuinely connect through per-user OAuth.
 * Everything else in the integration catalogue is marked as coming soon.
 *
 * Client-safe: ids, labels and OAuth scopes only, no secrets.
 */

export type GoogleConnectorId = "google_drive" | "google_mail" | "google_calendar";

const BASE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export type GoogleConnectorConfig = {
  connectorId: GoogleConnectorId;
  /** Catalogue entry id in src/lib/integrations.ts */
  integrationId: string;
  label: string;
  clientApiKeyEnvVar: string;
  scopes: string[];
  /** Lightweight call used to show the connected account details. */
  probePath: string;
};

export const GOOGLE_CONNECTORS: Record<GoogleConnectorId, GoogleConnectorConfig> = {
  google_drive: {
    connectorId: "google_drive",
    integrationId: "google-drive",
    label: "Google Drive",
    clientApiKeyEnvVar: "GOOGLE_DRIVE_APP_USER_CONNECTOR_CLIENT_API_KEY",
    scopes: [...BASE_SCOPES, "https://www.googleapis.com/auth/drive.readonly"],
    probePath: "/drive/v3/about?fields=user(displayName,emailAddress),storageQuota(usage)",
  },
  google_mail: {
    connectorId: "google_mail",
    integrationId: "gmail",
    label: "Gmail",
    clientApiKeyEnvVar: "GOOGLE_MAIL_APP_USER_CONNECTOR_CLIENT_API_KEY",
    scopes: [...BASE_SCOPES, "https://www.googleapis.com/auth/gmail.readonly"],
    probePath: "/gmail/v1/users/me/profile",
  },
  google_calendar: {
    connectorId: "google_calendar",
    integrationId: "google-calendar",
    label: "Google Calendar",
    clientApiKeyEnvVar: "GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY",
    scopes: [...BASE_SCOPES, "https://www.googleapis.com/auth/calendar.readonly"],
    probePath: "/calendar/v3/users/me/calendarList?maxResults=1",
  },
};

export const GOOGLE_CONNECTOR_IDS = Object.keys(GOOGLE_CONNECTORS) as GoogleConnectorId[];

/** Maps a catalogue integration id to a real connector, when one exists. */
export const CONNECTOR_BY_INTEGRATION: Record<string, GoogleConnectorId> = Object.fromEntries(
  GOOGLE_CONNECTOR_IDS.map((id) => [GOOGLE_CONNECTORS[id].integrationId, id]),
);

export function isGoogleConnectorId(value: string): value is GoogleConnectorId {
  return GOOGLE_CONNECTOR_IDS.includes(value as GoogleConnectorId);
}
