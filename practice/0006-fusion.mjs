/**
 * Lesson 6 — Fusion (multi-model deliberation).
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Default: cheap single model vs openrouter/fusion with a 2-model budget panel.
 * Override outer/judge via: npm run practice -- 6 --model google/gemini-2.5-flash
 *
 * Ignore Lesson 1's OPENROUTER_MODEL=openrouter/free default so .env
 * does not turn the baseline into free-router practice.
 *
 * Cost note: Fusion bills the sum of panel + judge + outer completions.
 * This script uses a tiny panel of cheap models — still expect >1× baseline.
 */
import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const modelEnv = process.env.OPENROUTER_MODEL?.trim();
const baseline =
  modelEnv && modelEnv !== "openrouter/free" && modelEnv !== "openrouter/fusion"
    ? modelEnv
    : "google/gemini-2.5-flash";

/** Second panel seat — keep both cheap for practice. */
const panelPeer = "openai/gpt-4o-mini";

const prompt =
  "Compare ridge, lasso, and elastic-net regression in 4–6 sentences. Where does each shine?";

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
 * OpenRouter extends Chat Completions with `plugins`.
 * OpenAI SDK types omit them — pass via cast; they serialize on the wire.
 * @param {string} label
 * @param {Record<string, unknown>} body
 */
async function once(label, body) {
  const t0 = performance.now();
  const completion = await client.chat.completions.create(
    /** @type {import("openai").OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming} */ (
      {
        messages: [{ role: "user", content: prompt }],
        ...body,
      }
    ),
  );
  const latencyMs = Math.round(performance.now() - t0);
  const usage = readUsage(completion);
  const content = completion.choices[0]?.message?.content?.trim() ?? "(empty)";
  const preview = content.length > 220 ? `${content.slice(0, 220)}…` : content;

  console.log(`\n--- ${label} ---`);
  console.log("model returned: ", completion.model);
  console.log("latency_ms:     ", latencyMs);
  console.log("cost (credits): ", usage.cost ?? "(missing)");
  console.log("total_tokens:   ", usage.total_tokens);
  console.log("preview:        ", preview.replace(/\s+/g, " "));
  console.log(
    "audit:          ",
    `https://openrouter.ai/api/v1/generation?id=${completion.id}`,
  );

  return { model: completion.model, latencyMs, usage };
}

console.log("Lesson 6: Fusion — panel + judge + final answer");
console.log("Mission: multi-model when cost-of-wrong > sum of completions.");
console.log(`Baseline: ${baseline}`);
console.log(`Fusion panel: ${baseline} + ${panelPeer} (judge = ${baseline})`);
console.log("Prompt (compare/contrast — the kind that should invoke deliberation):\n ", prompt);

const single = await once("single model (no fusion)", {
  model: baseline,
});

const fusion = await once("openrouter/fusion + cheap panel", {
  model: "openrouter/fusion",
  plugins: [
    {
      id: "fusion",
      analysis_models: [baseline, panelPeer],
      model: baseline,
    },
  ],
});

console.log("\n--- compare ---");
console.log("single cost:  ", single.usage.cost ?? "?");
console.log("fusion cost:  ", fusion.usage.cost ?? "?");
if (single.usage.cost != null && fusion.usage.cost != null && single.usage.cost > 0) {
  console.log(
    "cost ratio:   ",
    `${(fusion.usage.cost / single.usage.cost).toFixed(1)}× baseline (expect >> 1)`,
  );
}
console.log("single latency:", single.latencyMs, "ms");
console.log("fusion latency:", fusion.latencyMs, "ms");
console.log(
  "\nHabit: Fusion is a product decision — use when wrong is expensive; else one model.",
);
console.log("Presets (general-budget / general-high / general-fast) are the lab’s shortcuts.");
console.log("Next mission step after this: Inference Bridge OpenRouter adapter.");
