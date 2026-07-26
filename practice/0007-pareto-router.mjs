/**
 * Lesson 7 — Pareto Router (coding model by score tier).
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Compares low vs medium min_coding_score on the same coding prompt.
 * Optional: npm run practice -- 7 --model openrouter/pareto-code:nitro
 *
 * Ignore Lesson 1's OPENROUTER_MODEL=openrouter/free default.
 *
 * Cost note: you pay the underlying model only — high tiers can be pricey.
 * This script uses low + medium to stay budget-friendly.
 */
import "dotenv/config";
import OpenAI from "openai";
import { randomUUID } from "node:crypto";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const modelEnv = process.env.OPENROUTER_MODEL?.trim();
const routerSlug =
  modelEnv &&
  (modelEnv === "openrouter/pareto-code" ||
    modelEnv.startsWith("openrouter/pareto-code:"))
    ? modelEnv
    : "openrouter/pareto-code";

const prompt =
  "Write a TypeScript function `mergeSorted(a: number[], b: number[]): number[]` that merges two sorted arrays into one sorted array. No imports. Keep it short.";

const sessionId = `learn-mm-pareto-${randomUUID().slice(0, 8)}`;

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
    "X-OpenRouter-Title": "learn-multimodel",
  },
});

/**
 * @param {import("openai").OpenAI.Chat.Completions.ChatCompletion} completion
 */
function readUsage(completion) {
  const usage = /** @type {Record<string, unknown> | undefined} */ (completion.usage);
  return {
    prompt_tokens: Number(usage?.prompt_tokens ?? 0),
    completion_tokens: Number(usage?.completion_tokens ?? 0),
    total_tokens: Number(usage?.total_tokens ?? 0),
    cost: usage?.cost != null ? Number(usage.cost) : null,
  };
}

/**
 * @param {string} label
 * @param {number} minCodingScore
 * @param {import("openai").OpenAI.Chat.Completions.ChatCompletionMessageParam[]} messages
 */
async function once(label, minCodingScore, messages) {
  const t0 = performance.now();
  const completion = await client.chat.completions.create(
    /** @type {import("openai").OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming} */ (
      {
        model: routerSlug,
        messages,
        session_id: sessionId,
        plugins: [{ id: "pareto-router", min_coding_score: minCodingScore }],
      }
    ),
  );
  const latencyMs = Math.round(performance.now() - t0);
  const usage = readUsage(completion);
  const content = completion.choices[0]?.message?.content?.trim() ?? "(empty)";
  const preview = content.length > 200 ? `${content.slice(0, 200)}…` : content;

  console.log(`\n--- ${label} ---`);
  console.log("min_coding_score:", minCodingScore);
  console.log("router slug:    ", routerSlug);
  console.log("model returned: ", completion.model);
  console.log("latency_ms:     ", latencyMs);
  console.log("cost (credits): ", usage.cost ?? "(missing)");
  console.log("total_tokens:   ", usage.total_tokens);
  console.log("preview:        ", preview.replace(/\s+/g, " "));
  console.log(
    "audit:          ",
    `https://openrouter.ai/api/v1/generation?id=${completion.id}`,
  );

  return { model: completion.model, latencyMs, usage, content };
}

console.log("Lesson 7: Pareto Router — coding score → cheapest (or :nitro) in tier");
console.log("Mission: pick coding strength without pinning a forever-slug.");
console.log(`Router: ${routerSlug}`);
console.log(`session_id (stickiness): ${sessionId}`);
console.log("Prompt:\n ", prompt);

const low = await once("tier low (score 0.2)", 0.2, [
  { role: "user", content: prompt },
]);

const medium = await once("tier medium (score 0.5)", 0.5, [
  { role: "user", content: prompt },
]);

const sticky = await once("same session + medium (stickiness check)", 0.5, [
  { role: "user", content: prompt },
  { role: "assistant", content: medium.content },
  { role: "user", content: "Add JSDoc to that function only. No other changes." },
]);

console.log("\n--- compare ---");
console.log("low model:   ", low.model, " cost:", low.usage.cost ?? "?");
console.log("medium model:", medium.model, " cost:", medium.usage.cost ?? "?");
console.log("sticky model:", sticky.model, " (expect same as medium if stickiness held)");
if (medium.model === sticky.model) {
  console.log("stickiness:  matched — same model for follow-up in session");
} else {
  console.log("stickiness:  differed — check docs; shortlist/errors can re-route");
}
console.log(
  "\nHabit: openrouter/pareto-code for coding floors; openrouter/free for free lottery; pin a slug when you need a fixed eval target.",
);
console.log("Next mission step after this: Inference Bridge OpenRouter adapter.");
