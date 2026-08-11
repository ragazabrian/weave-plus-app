/**
 * Portable AI provider.
 *
 * The app talks to any OpenAI-compatible endpoint, so it runs the same from
 * this repo on your own hosting as it does here. Configure whichever you use:
 *
 *   AI_API_KEY   (or OPENAI_API_KEY)  the key sent as `Authorization: Bearer`
 *   AI_BASE_URL  defaults to https://api.openai.com/v1
 *   AI_MODEL     defaults to gpt-4o-mini
 *
 * If none of those are set, and only then, it falls back to the managed
 * gateway that the hosted preview provides through LOVABLE_API_KEY.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const DEFAULT_DIRECT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_DIRECT_MODEL = "gpt-4o-mini";
const MANAGED_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_MANAGED_MODEL = "google/gemini-3.6-flash";

export type AiRuntime = {
  /** Ready to hand to generateText / streamText. */
  model: ReturnType<ReturnType<typeof createOpenAICompatible>>;
  modelId: string;
  /** "direct" means your own API key, no third-party gateway in the path. */
  mode: "direct" | "managed";
  baseUrl: string;
};

/** Returns null when no AI credentials are configured at all. */
export function getAiRuntime(): AiRuntime | null {
  const directKey = process.env["AI_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  if (directKey) {
    const baseUrl = process.env["AI_BASE_URL"] ?? DEFAULT_DIRECT_BASE_URL;
    const modelId = process.env["AI_MODEL"] ?? DEFAULT_DIRECT_MODEL;
    const provider = createOpenAICompatible({
      name: "weave-ai",
      baseURL: baseUrl,
      headers: { Authorization: `Bearer ${directKey}` },
    });
    return { model: provider(modelId), modelId, mode: "direct", baseUrl };
  }

  const managedKey = process.env["LOVABLE_API_KEY"];
  if (managedKey) {
    const modelId = process.env["AI_MODEL"] ?? DEFAULT_MANAGED_MODEL;
    const provider = createOpenAICompatible({
      name: "lovable",
      baseURL: MANAGED_BASE_URL,
      headers: {
        "Lovable-API-Key": managedKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });
    return { model: provider(modelId), modelId, mode: "managed", baseUrl: MANAGED_BASE_URL };
  }

  return null;
}

export const AI_SETUP_HINT =
  "AI is not configured. Set AI_API_KEY (and optionally AI_BASE_URL and AI_MODEL) in the server environment.";
