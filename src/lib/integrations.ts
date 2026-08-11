/**
 * weave+ integration catalogue. These are the connectors a workspace can turn
 * on so the agent and search can reach content that lives outside the vault.
 * Enabling one here records the choice for the workspace and surfaces it in
 * navigation, agent sources and the integration picker.
 */

export type IntegrationCategory =
  "productivity" | "storage" | "communication" | "development" | "learning" | "data";

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  productivity: "Productivity",
  storage: "Files and storage",
  communication: "Communication",
  development: "Development",
  learning: "Learning",
  data: "Data and analytics",
};

export type Integration = {
  id: string;
  name: string;
  vendor: string;
  summary: string;
  categories: IntegrationCategory[];
  /** What the agent may do once the connector is on. */
  scopes: string[];
  enabledByDefault?: boolean;
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    vendor: "Google",
    summary:
      "Index docs, slides and sheets so the agent can cite course material that still lives in Drive.",
    categories: ["storage", "productivity"],
    scopes: ["Read files", "Search file content"],
  },
  {
    id: "gmail",
    name: "Gmail",
    vendor: "Google",
    summary:
      "Cut through the noise: summarise threads, surface student questions and draft replies.",
    categories: ["communication"],
    scopes: ["Read threads", "Draft replies"],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    vendor: "Google",
    summary:
      "Merge lecture slots and office hours into the weave+ calendar next to assignment deadlines.",
    categories: ["productivity"],
    scopes: ["Read events", "Create events"],
  },
  {
    id: "google-meet",
    name: "Google Meet",
    vendor: "Google",
    summary:
      "Pull recordings and transcripts of a session so the agent can list action points afterwards.",
    categories: ["communication", "learning"],
    scopes: ["Read transcripts"],
  },
  {
    id: "slack",
    name: "Slack",
    vendor: "Slack",
    summary:
      "Answer from channel history and post announcements to a cohort channel from a course.",
    categories: ["communication"],
    scopes: ["Read channels", "Post messages"],
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    vendor: "Microsoft",
    summary: "Summarise meetings and bring team chat context into the agent's answers.",
    categories: ["communication"],
    scopes: ["Read chats", "Read meeting transcripts"],
  },
  {
    id: "outlook",
    name: "Outlook",
    vendor: "Microsoft",
    summary: "Mail and calendar for workspaces that run on Microsoft 365.",
    categories: ["communication", "productivity"],
    scopes: ["Read mail", "Read calendar"],
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    vendor: "Microsoft",
    summary: "Index department sites and document libraries as a read-only knowledge source.",
    categories: ["storage"],
    scopes: ["Read sites", "Read documents"],
  },
  {
    id: "onedrive",
    name: "OneDrive",
    vendor: "Microsoft",
    summary: "Personal and shared file storage for staff who draft outside the vault.",
    categories: ["storage"],
    scopes: ["Read files"],
  },
  {
    id: "notion",
    name: "Notion",
    vendor: "Notion",
    summary: "Sync selected databases and pages into notes so existing handbooks stay reachable.",
    categories: ["productivity", "storage"],
    scopes: ["Read pages", "Read databases"],
  },
  {
    id: "confluence",
    name: "Confluence",
    vendor: "Atlassian",
    summary: "Bring space content and policy pages into search and agent answers.",
    categories: ["productivity", "storage"],
    scopes: ["Read spaces"],
  },
  {
    id: "jira",
    name: "Jira",
    vendor: "Atlassian",
    summary: "Track project work alongside coursework and let the agent open issues.",
    categories: ["development", "productivity"],
    scopes: ["Read issues", "Create issues"],
  },
  {
    id: "github",
    name: "GitHub",
    vendor: "GitHub",
    summary: "Read repositories and pull requests so code assignments can be reviewed in context.",
    categories: ["development"],
    scopes: ["Read repositories", "Read pull requests"],
  },
  {
    id: "linear",
    name: "Linear",
    vendor: "Linear",
    summary: "Turn agent findings into tracked issues for the teaching team.",
    categories: ["development", "productivity"],
    scopes: ["Read issues", "Create issues"],
  },
  {
    id: "zoom",
    name: "Zoom",
    vendor: "Zoom",
    summary: "Import session recordings and transcripts into the matching module.",
    categories: ["communication", "learning"],
    scopes: ["Read recordings", "Read transcripts"],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    vendor: "Dropbox",
    summary: "Index shared folders of readings, datasets and media.",
    categories: ["storage"],
    scopes: ["Read files"],
  },
  {
    id: "box",
    name: "Box",
    vendor: "Box",
    summary: "Governed file storage for institutions that standardise on Box.",
    categories: ["storage"],
    scopes: ["Read files"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    vendor: "Salesforce",
    summary:
      "Read records for programme enrolment and partner relationships, and update opportunities.",
    categories: ["data", "productivity"],
    scopes: ["Read records", "Update records"],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    vendor: "HubSpot",
    summary: "Contact and pipeline context for admissions and partnership outreach.",
    categories: ["data"],
    scopes: ["Read contacts", "Read deals"],
  },
  {
    id: "zendesk",
    name: "Zendesk",
    vendor: "Zendesk",
    summary: "Answer support tickets from vault content and route what needs a human.",
    categories: ["communication", "data"],
    scopes: ["Read tickets", "Draft replies"],
  },
  {
    id: "servicenow",
    name: "ServiceNow",
    vendor: "ServiceNow",
    summary: "Service requests and knowledge base articles as an answer source.",
    categories: ["data"],
    scopes: ["Read requests", "Read knowledge"],
  },
  {
    id: "asana",
    name: "Asana",
    vendor: "Asana",
    summary: "Project plans and task ownership for course build work.",
    categories: ["productivity"],
    scopes: ["Read tasks", "Create tasks"],
  },
  {
    id: "snowflake",
    name: "Snowflake",
    vendor: "Snowflake",
    summary: "Query warehoused cohort data so the agent can plot progress and drop-off.",
    categories: ["data"],
    scopes: ["Run read queries"],
  },
  {
    id: "workday",
    name: "Workday",
    vendor: "Workday",
    summary: "People data for staff records, roles and reporting lines.",
    categories: ["data"],
    scopes: ["Read worker records"],
  },
];

export const INTEGRATION_LOGOS = [
  "Google Drive",
  "Gmail",
  "Slack",
  "Notion",
  "Microsoft Teams",
  "GitHub",
  "Salesforce",
  "Zoom",
];
