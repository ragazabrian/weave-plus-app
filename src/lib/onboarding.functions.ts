import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  SHEETS_SETUP_HINT,
  sheetsFetch,
  sheetsMode,
  spreadsheetId,
} from "@/lib/google-sheets.server";

/** One tab per role in the demo intake spreadsheet. */
const TAB_GID: Record<"admin" | "lecturer" | "student", number> = {
  student: 0,
  admin: 760602549,
  lecturer: 109521882,
};

const schema = z.object({
  role: z.enum(["admin", "lecturer", "student"]),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  profession: z.string().trim().max(120).optional(),
  subject: z.string().trim().max(120).optional(),
  department: z.string().trim().max(120).optional(),
  school: z.string().trim().max(160).optional(),
  contact: z.string().trim().max(40).optional(),
  program: z.string().trim().max(160).optional(),
  yearLevel: z.string().trim().max(40).optional(),
});

export type OnboardingInput = z.infer<typeof schema>;

function rowFor(data: OnboardingInput) {
  const stamp = new Date().toISOString();
  if (data.role === "admin")
    return [
      stamp,
      data.firstName,
      data.lastName,
      data.profession ?? "",
      data.department ?? "",
      data.school ?? "",
      data.contact ?? "",
      data.email,
    ];
  if (data.role === "lecturer")
    return [
      stamp,
      data.firstName,
      data.lastName,
      data.profession ?? "",
      data.subject ?? "",
      data.department ?? "",
      data.school ?? "",
      data.contact ?? "",
      data.email,
    ];
  return [
    stamp,
    data.firstName,
    data.lastName,
    data.email,
    data.school ?? "",
    data.program ?? "",
    data.yearLevel ?? "",
  ];
}

export const SHEET_URL = `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/edit`;

export type SheetsStatus = {
  state: "connected" | "not-connected" | "error";
  detail: string;
  sheetUrl: string;
  /** How the server reaches Google, so the setup steps can be exact. */
  mode: "service-account" | "managed" | "unconfigured";
};

/**
 * Reports whether the intake spreadsheet can be reached, so onboarding can say
 * plainly what will happen to the answers instead of failing quietly.
 */
export const getSheetsStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<SheetsStatus> => {
    const mode = sheetsMode();
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/edit`;
    if (mode === "unconfigured") {
      return {
        state: "not-connected",
        detail: SHEETS_SETUP_HINT,
        sheetUrl,
        mode,
      };
    }
    try {
      const response = await sheetsFetch(`/spreadsheets/${spreadsheetId()}`);
      if (!response.ok) {
        const body = await response.text();
        console.error(`Sheets status failed [${response.status}]: ${body}`);
        return {
          state: "error",
          detail: `The Google credentials cannot open the intake sheet (HTTP ${response.status}). Share it with the service account as an Editor.`,
          sheetUrl,
          mode,
        };
      }
      const meta = (await response.json()) as { properties?: { title?: string } };
      return {
        state: "connected",
        detail: `Writing to "${meta.properties?.title ?? "the intake sheet"}".`,
        sheetUrl,
        mode,
      };
    } catch (error) {
      console.error("Sheets status threw", error);
      return {
        state: "error",
        detail: error instanceof Error ? error.message : "Google Sheets is unreachable.",
        sheetUrl,
        mode,
      };
    }
  },
);

export const saveOnboarding = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data }) => {
    if (sheetsMode() === "unconfigured") {
      return { saved: false as const, reason: SHEETS_SETUP_HINT };
    }

    const id = spreadsheetId();
    try {
      const metaResponse = await sheetsFetch(`/spreadsheets/${id}`);
      if (!metaResponse.ok) {
        const body = await metaResponse.text();
        console.error(`Sheets metadata failed [${metaResponse.status}]: ${body}`);
        return { saved: false as const, reason: "Could not open the intake sheet." };
      }
      const meta = (await metaResponse.json()) as {
        sheets?: { properties?: { sheetId?: number; title?: string } }[];
      };
      const gid = TAB_GID[data.role];
      const title =
        meta.sheets?.find((sheet) => sheet.properties?.sheetId === gid)?.properties?.title ??
        meta.sheets?.[0]?.properties?.title;
      if (!title) return { saved: false as const, reason: "No matching tab found." };

      const appendResponse = await sheetsFetch(
        `/spreadsheets/${id}/values/${title}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        { method: "POST", body: JSON.stringify({ values: [rowFor(data)] }) },
      );
      if (!appendResponse.ok) {
        const body = await appendResponse.text();
        console.error(`Sheets append failed [${appendResponse.status}]: ${body}`);
        return { saved: false as const, reason: "Could not write to the intake sheet." };
      }
      return { saved: true as const, tab: title };
    } catch (error) {
      console.error("Sheets append threw", error);
      return {
        saved: false as const,
        reason: error instanceof Error ? error.message : "The intake sheet is unreachable.",
      };
    }
  });
