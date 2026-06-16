import {
  EVALUATION_PROFILES,
  type EvaluationCriteria,
  getEvaluationFilters,
} from "../config/evaluation";
import { logger } from "../logger";
import { getClient } from "../services/llm";
import { llmRateLimiter } from "../concurrency";
import type { TokenTracker } from "../services/tokenTracker";
import type { JobListing } from "../types";

export interface JobEvaluation {
  pass: boolean;
  reason: string;
  profileName?: string;
}

const log = logger.child({ component: "evaluate" });

// Gemini doesn't reliably honor forced function/tool calls via the OpenAI
// compatibility layer. Plain JSON prompt is more reliable and cheaper.
const JSON_INSTRUCTION = `
Respond with ONLY a valid JSON object. No markdown, no code fences, no explanation.
Keep the reason field under 20 words.
Example format:
{"pass": true, "reason": "Strong match for digital marketing manager role with SEO focus"}
`;

export async function evaluateSingle(
  job: JobListing,
  criteria: EvaluationCriteria,
  apiKey: string,
  tracker?: TokenTracker,
  options?: { temperature?: number; model?: string },
): Promise<JobEvaluation> {
  const client = getClient(apiKey);
  const model = options?.model ?? "gemini-2.5-flash";

  const userMessage = `Job Title: ${job.title}
Company: ${job.company}
Source: ${job.source}
URL: ${job.url}

Description:
${job.description}

${JSON_INSTRUCTION}`;

  // Wrap the actual API call in the rate limiter so it throttles correctly
  const response = await llmRateLimiter.run(() =>
    client.chat.completions.create({
      model,
      max_tokens: 512,
      stream: false,
      temperature: options?.temperature ?? 0,
      messages: [
        { role: "system", content: criteria.prompt },
        { role: "user", content: userMessage },
      ],
    }),
  );

  if (response.usage) {
    tracker?.add(response.model ?? model, "evaluation", {
      input_tokens: response.usage.prompt_tokens,
      output_tokens: response.usage.completion_tokens,
    });
  } else {
    log.warn({ model }, "no usage data in response");
  }

  const raw = response.choices[0]?.message?.content ?? "";

  // Strip markdown fences if Gemini adds them anyway
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as { pass: boolean; reason: string };
    return { pass: Boolean(parsed.pass), reason: parsed.reason ?? "" };
  } catch {
    log.warn({ raw, cleaned }, "could not parse evaluation response — defaulting to reject");
    return { pass: false, reason: `Parse error: ${cleaned.slice(0, 120)}` };
  }
}

export async function evaluateJob(
  job: JobListing,
  apiKey: string,
  deps?: {
    filters?: EvaluationCriteria[];
    profiles?: EvaluationCriteria[];
    evaluate?: typeof evaluateSingle;
    tracker?: TokenTracker;
    temperature?: number;
    model?: string;
  },
): Promise<JobEvaluation> {
  const filters = deps?.filters ?? getEvaluationFilters();
  const profiles = deps?.profiles ?? EVALUATION_PROFILES;
  const evaluate = deps?.evaluate ?? evaluateSingle;
  const tracker = deps?.tracker;
  const tempOpts =
    deps?.temperature !== undefined || deps?.model !== undefined
      ? { temperature: deps.temperature, model: deps.model }
      : undefined;

  // Phase 1: AND filters — all must pass
  if (filters.length > 0) {
    const filterResults = await Promise.allSettled(
      filters.map((filter) => evaluate(job, filter, apiKey, tracker, tempOpts)),
    );
    for (const result of filterResults) {
      if (result.status === "rejected") {
        throw result.reason;
      }
      if (!result.value.pass) {
        return { pass: false, reason: result.value.reason };
      }
    }
  }

  // Phase 2: OR profiles — any must pass
  if (profiles.length === 0) {
    return filters.length > 0
      ? { pass: true, reason: "Passed all filters" }
      : { pass: false, reason: "No profiles configured" };
  }

  const results = await Promise.allSettled(
    profiles.map((profile) => evaluate(job, profile, apiKey, tracker, tempOpts)),
  );

  let lastRejection: JobEvaluation = { pass: false, reason: "No profiles matched" };

  for (const [i, result] of results.entries()) {
    if (result.status === "fulfilled" && result.value.pass) {
      return { pass: true, reason: result.value.reason, profileName: profiles[i]?.name };
    }
    if (result.status === "fulfilled") {
      lastRejection = { pass: false, reason: result.value.reason };
    }
  }

  const firstError = results.find((r) => r.status === "rejected");
  if (lastRejection.reason === "No profiles matched" && firstError?.status === "rejected") {
    throw firstError.reason;
  }

  return lastRejection;
}
