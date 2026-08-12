/**
 * Built-in AI provider.
 *
 * Chat answers out of the box: no user setup, no pasted keys. Calls run on the
 * workspace AI endpoint, and a self-hosted deployment can point the same code
 * at any OpenAI compatible provider by setting AI_BASE_URL, AI_API_KEY and
 * optionally AI_MODEL.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { SharedV4ProviderOptions } from "@ai-sdk/provider";

import { DEFAULT_EFFORT, DEFAULT_MODEL_ID, findModel, type AiEffort } from "@/lib/ai-models";

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";

export type ResolvedModel = {
  model: LanguageModel;
  modelId: string;
  effort: AiEffort;
  /** True when the call carries reasoning options on the Responses API. */
  reasoning: boolean;
  providerOptions: SharedV4ProviderOptions;
};

export const NO_ACCOUNT_HINT = "The AI service is not configured for this workspace yet.";

function selfHosted() {
  const apiKey = process.env["AI_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  const baseUrl = process.env["AI_BASE_URL"];
  if (!apiKey || !baseUrl) return null;
  return { apiKey, baseUrl, modelId: process.env["AI_MODEL"] ?? null };
}

/**
 * Resolves the model for one request. Nothing is user specific: everyone gets
 * a working model straight away.
 */
export function resolveModel(options?: {
  modelId?: string | null;
  effort?: AiEffort | null;
}): ResolvedModel {
  const effort = options?.effort ?? DEFAULT_EFFORT;

  // Self-hosted: one OpenAI compatible endpoint supplied through env.
  const direct = selfHosted();
  if (direct) {
    const provider = createOpenAICompatible({
      name: "lovable",
      baseURL: direct.baseUrl,
      headers: { Authorization: `Bearer ${direct.apiKey}` },
    });
    const modelId = direct.modelId ?? options?.modelId ?? "gpt-4o-mini";
    return { model: provider(modelId), modelId, effort, reasoning: false, providerOptions: {} };
  }

  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error(NO_ACCOUNT_HINT);

  const requested = findModel(options?.modelId) ?? findModel(DEFAULT_MODEL_ID)!;
  const headers = {
    "Lovable-API-Key": key,
    "X-Lovable-AIG-SDK": "vercel-ai-sdk",
  };

  if (requested.provider === "openai") {
    // OpenAI models are served by the gateway Responses API.
    const openai = createOpenAI({ baseURL: GATEWAY_BASE_URL, apiKey: key, headers });
    return {
      model: openai.responses(requested.id),
      modelId: requested.id,
      effort,
      reasoning: true,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: effort === "high" ? "high" : effort === "low" ? "low" : "medium",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    };
  }

  const provider = createOpenAICompatible({
    name: "lovable",
    baseURL: GATEWAY_BASE_URL,
    headers,
  });
  return {
    model: provider(requested.id),
    modelId: requested.id,
    effort,
    reasoning: false,
    providerOptions: {},
  };
}

/**
 * One shared system prompt so answers stay consistent across models, with a
 * short adapter for reasoning depth and answer length.
 */
export function buildSystemPrompt(options: {
  identity: string;
  context: string;
  modelId: string;
  effort: AiEffort;
}): string {
  const model = findModel(options.modelId);
  const depth = model?.reasoning
    ? options.effort === "high"
      ? "Think the problem through carefully before answering, then give the answer concisely."
      : options.effort === "low"
        ? "Answer directly with minimal deliberation."
        : "Think briefly, then answer concisely."
    : "Answer directly and keep it short.";

  const length =
    options.effort === "high"
      ? "Keep the answer under 300 words."
      : "Keep the answer under 160 words.";

  return `${options.identity}

RULES
- Use only the workspace data below. Never invent grades, deadlines or people.
- Cite note titles, course codes and dates when they support the answer.
- If the data does not contain the answer, say so plainly in one sentence.
- ${depth}
- ${length}

WORKSPACE DATA
${options.context}`;
}

/** Turns a provider failure into something worth showing a person. */
export function describeAiError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes(NO_ACCOUNT_HINT)) return NO_ACCOUNT_HINT;
  if (message.includes("429")) {
    return "The AI service is busy right now. Try again in a moment.";
  }
  if (/402|quota|insufficient/i.test(message)) {
    return "The workspace AI allowance is used up. Top it up to keep chatting.";
  }
  if (/401|403|invalid[_ ]api[_ ]key/i.test(message)) {
    return "The AI service rejected this request. An admin needs to check the setup.";
  }
  return "The agent could not answer right now.";
}
