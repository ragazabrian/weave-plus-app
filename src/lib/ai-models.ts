/**
 * Client-safe model catalogue.
 *
 * Chat works out of the box: every model here runs on the workspace AI
 * endpoint, so nobody has to connect an account or paste a key. A self-hosted
 * deployment can point the same code at any OpenAI compatible provider through
 * AI_BASE_URL / AI_API_KEY / AI_MODEL.
 */

export type AiProviderId = "openai" | "google";

export type AiProviderInfo = {
  id: AiProviderId;
  /** Product family name users recognise. */
  label: string;
};

export const AI_PROVIDERS: AiProviderInfo[] = [
  { id: "openai", label: "GPT" },
  { id: "google", label: "Gemini" },
];

export type AiModelInfo = {
  /** Gateway model id, sent verbatim. */
  id: string;
  provider: AiProviderId;
  label: string;
  blurb: string;
  /** Reasoning models take the effort setting seriously. */
  reasoning: boolean;
};

export const AI_MODELS: AiModelInfo[] = [
  {
    id: "openai/gpt-5.6-sol",
    provider: "openai",
    label: "GPT-5.6 Sol",
    blurb: "Deepest reasoning for hard questions",
    reasoning: true,
  },
  {
    id: "openai/gpt-5.6-terra",
    provider: "openai",
    label: "GPT-5.6 Terra",
    blurb: "Balanced for everyday work",
    reasoning: true,
  },
  {
    id: "openai/gpt-5.6-luna",
    provider: "openai",
    label: "GPT-5.6 Luna",
    blurb: "Fast and light for quick asks",
    reasoning: true,
  },
  {
    id: "google/gemini-3.1-pro-preview",
    provider: "google",
    label: "Gemini 3.1 Pro",
    blurb: "Long context and strong analysis",
    reasoning: true,
  },
  {
    id: "google/gemini-3.6-flash",
    provider: "google",
    label: "Gemini 3.6 Flash",
    blurb: "Balanced speed and quality",
    reasoning: true,
  },
  {
    id: "google/gemini-3.1-flash-lite",
    provider: "google",
    label: "Gemini 3.1 Flash Lite",
    blurb: "Cheapest for simple asks",
    reasoning: false,
  },
];

export const EFFORTS = ["low", "medium", "high"] as const;
export type AiEffort = (typeof EFFORTS)[number];

export const DEFAULT_MODEL_ID = "openai/gpt-5.6-sol";
export const DEFAULT_EFFORT: AiEffort = "medium";
/** Cheap model used for background work such as the priority feed. */
export const FEED_MODEL_ID = "google/gemini-3.6-flash";

export function findModel(id: string | null | undefined): AiModelInfo | undefined {
  return AI_MODELS.find((m) => m.id === id);
}

export function providerLabel(id: AiProviderId): string {
  return AI_PROVIDERS.find((p) => p.id === id)?.label ?? id;
}

export function modelsByProvider(provider: AiProviderId): AiModelInfo[] {
  return AI_MODELS.filter((m) => m.provider === provider);
}
