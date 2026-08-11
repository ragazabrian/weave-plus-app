/**
 * Curated plugin + integration catalogue, modelled on the Obsidian community
 * plugin directory (categories: integrations, files, visualization, commands).
 * Everything here is free, matching the free-pricing filter.
 */

export type PluginCategory = "integrations" | "files" | "visualization" | "commands";

export type Plugin = {
  id: string;
  name: string;
  author: string;
  summary: string;
  categories: PluginCategory[];
  installs: string;
  enabledByDefault?: boolean;
};

export const CATEGORY_LABELS: Record<PluginCategory, string> = {
  integrations: "Integrations",
  files: "Files",
  visualization: "Visualization",
  commands: "Commands",
};

export const PLUGINS: Plugin[] = [
  {
    id: "dataview",
    name: "Dataview",
    author: "Michael Brenan",
    summary:
      "Query your vault like a database. Build live tables and lists from note frontmatter and tags.",
    categories: ["visualization", "files"],
    installs: "1.6M",
    enabledByDefault: true,
  },
  {
    id: "templater",
    name: "Templater",
    author: "SilentVoid",
    summary:
      "Templates with variables, dates and scripting , insert a full lecture or assignment scaffold in one command.",
    categories: ["commands", "files"],
    installs: "1.2M",
    enabledByDefault: true,
  },
  {
    id: "excalidraw",
    name: "Excalidraw",
    author: "Zsolt Viczián",
    summary: "Hand-drawn style whiteboards stored as notes, linkable from anywhere in the vault.",
    categories: ["visualization", "files"],
    installs: "980K",
  },
  {
    id: "kanban",
    name: "Kanban",
    author: "mgmeyers",
    summary: "Markdown-backed boards. Turn an assignment queue into drag-and-drop columns.",
    categories: ["visualization", "commands"],
    installs: "910K",
  },
  {
    id: "calendar",
    name: "Calendar",
    author: "Liam Cain",
    summary: "A month grid beside your notes for daily notes and deadline navigation.",
    categories: ["visualization"],
    installs: "870K",
    enabledByDefault: true,
  },
  {
    id: "advanced-tables",
    name: "Advanced Tables",
    author: "Tony Grosinger",
    summary: "Auto-formatting, navigation and formulas for markdown tables , gradebooks included.",
    categories: ["commands", "files"],
    installs: "760K",
  },
  {
    id: "obsidian-git",
    name: "Git",
    author: "Vinzent",
    summary: "Version and back up the whole vault to a Git remote on a schedule or on demand.",
    categories: ["integrations", "files"],
    installs: "690K",
  },
  {
    id: "readwise",
    name: "Readwise Official",
    author: "Readwise",
    summary: "Sync highlights from books, articles and PDFs straight into linked notes.",
    categories: ["integrations", "files"],
    installs: "540K",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    author: "YukiGasai",
    summary: "Two-way sync between course deadlines and your Google Calendar events.",
    categories: ["integrations"],
    installs: "310K",
  },
  {
    id: "notion-importer",
    name: "Notion Importer",
    author: "Obsidian",
    summary: "Bring a Notion workspace across with pages, databases and links intact.",
    categories: ["integrations", "files"],
    installs: "280K",
  },
  {
    id: "zotero-integration",
    name: "Zotero Integration",
    author: "mgmeyers",
    summary: "Pull citations, annotations and bibliographies from Zotero into your notes.",
    categories: ["integrations", "files"],
    installs: "260K",
  },
  {
    id: "importer",
    name: "Importer",
    author: "Obsidian",
    summary: "Import from Evernote, Roam, Bear, HTML and plain markdown archives.",
    categories: ["files", "integrations"],
    installs: "240K",
  },
  {
    id: "quickadd",
    name: "QuickAdd",
    author: "Christian B. B. Houmann",
    summary: "One-keystroke capture macros , new note, append to a log, run a script.",
    categories: ["commands"],
    installs: "480K",
  },
  {
    id: "commander",
    name: "Commander",
    author: "jsmorabito & phibr0",
    summary: "Put any command anywhere: ribbon, title bar, status bar or page header.",
    categories: ["commands"],
    installs: "220K",
  },
  {
    id: "graph-analysis",
    name: "Graph Analysis",
    author: "SkepticMystic",
    summary:
      "Similarity, co-citation and link-prediction scores over your graph to surface hidden relationships.",
    categories: ["visualization"],
    installs: "170K",
  },
  {
    id: "juggl",
    name: "Juggl",
    author: "Emile van Krieken",
    summary: "A live, interactive graph you can style, filter and expand node by node.",
    categories: ["visualization"],
    installs: "150K",
  },
  {
    id: "mind-map",
    name: "Mind Map",
    author: "James Lynch",
    summary: "Render any note's heading structure as a collapsible mind map.",
    categories: ["visualization"],
    installs: "190K",
  },
  {
    id: "charts",
    name: "Charts",
    author: "Phibr0",
    summary: "Chart.js blocks inside notes , plot cohort progress or grade distributions.",
    categories: ["visualization"],
    installs: "160K",
  },
  {
    id: "file-explorer-note-count",
    name: "File Explorer Note Count",
    author: "Ozan Tellioglu",
    summary: "Counts of notes per folder, right in the file tree.",
    categories: ["files"],
    installs: "130K",
  },
  {
    id: "recent-files",
    name: "Recent Files",
    author: "Tony Grosinger",
    summary: "A pinned list of what you touched last, with quick reopen.",
    categories: ["files"],
    installs: "410K",
  },
  {
    id: "omnisearch",
    name: "Omnisearch",
    author: "Simon Cambier",
    summary: "Fuzzy, relevance-ranked search across notes, PDFs and images with OCR.",
    categories: ["files", "commands"],
    installs: "350K",
  },
  {
    id: "smart-connections",
    name: "Smart Connections",
    author: "Brian Petro",
    summary: "Embedding-based related notes and chat over your own vault contents.",
    categories: ["integrations", "visualization"],
    installs: "300K",
  },
  {
    id: "slack-bridge",
    name: "Slack Bridge",
    author: "community",
    summary: "Post announcements to a Slack channel and pull threads back as notes.",
    categories: ["integrations", "commands"],
    installs: "90K",
  },
  {
    id: "google-drive-sync",
    name: "Google Drive Sync",
    author: "stravo",
    summary: "Mirror attachments and exports to a Drive folder in the background.",
    categories: ["integrations", "files"],
    installs: "120K",
  },
];

export const INTEGRATION_LOGOS = [
  "Google Drive",
  "Notion",
  "Slack",
  "GitHub",
  "Zotero",
  "Readwise",
  "Google Calendar",
  "Linear",
];
