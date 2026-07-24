/**
 * Lesson 3 — read usage.cost + latency on every OpenRouter call.
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Default: free router vs a cheap paid model (tiny prompts).
 * Override paid slug: npm run practice -- 3 --model openai/gpt-4o-mini
 */
import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const freeModel = "openrouter/free";
/** Ignore Lesson 1's openrouter/free default so .env doesn't make both calls free. */
const modelEnv = process.env.OPENROUTER_MODEL;
const paidModel =
  modelEnv && modelEnv !== "openrouter/free" ? modelEnv : "openai/gpt-4o-mini";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
    "X-OpenRouter-Title": "learn-multimodel",
  },
});

/**
 * OpenRouter extends OpenAI's usage object with `cost` (credits).
 * The SDK may not type it — read from the live response.
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

async function once(label, model) {
  const t0 = performance.now();
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: "Reply with exactly one word: ok",
      },
    ],
  });
  const latencyMs = Math.round(performance.now() - t0);
  const usage = readUsage(completion);
  const content = completion.choices[0]?.message?.content?.trim() ?? "(empty)";

  console.log(`\n--- ${label} ---`);
  console.log("model requested:", model);
  console.log("model returned: ", completion.model);
  console.log("content:        ", content);
  console.log("id:             ", completion.id);
  console.log("latency_ms:     ", latencyMs);
  console.log("prompt_tokens:  ", usage.prompt_tokens);
  console.log("completion_tok: ", usage.completion_tokens);
  console.log("total_tokens:   ", usage.total_tokens);
  console.log(
    "cost (credits): ",
    usage.cost == null ? "(missing — unexpected; check raw usage)" : usage.cost,
  );

  return { model: completion.model, latencyMs, usage, id: completion.id };
}

console.log("Lesson 3: usage.cost + latency on every call");
console.log("Mission habit: quality, latency, and $/resolved-task — start with the last two.");
console.log(`Free: ${freeModel}`);
console.log(`Paid: ${paidModel} (override with --model or OPENROUTER_MODEL)`);

const free = await once("free router", freeModel);
const paid = await once("cheap paid", paidModel);

console.log("\n--- compare ---");
console.log(
  "free cost ≈ 0?",
  free.usage.cost == null
    ? "unknown"
    : free.usage.cost === 0
      ? "yes — free upstream billed $0"
      : `got ${free.usage.cost} (router can land on a paid? unusual — inspect model)`,
);
console.log(
  "paid cost > 0?",
  paid.usage.cost == null
    ? "unknown"
    : paid.usage.cost > 0
      ? `yes — ${paid.usage.cost} credits`
      : "got 0 (check model / promo)",
);
console.log("free latency_ms:", free.latencyMs);
console.log("paid latency_ms:", paid.latencyMs);
console.log(
  "\nHabit for Bridge: log model, tokens, cost, latency_ms on every completion.",
);
console.log(
  "Optional audit: GET https://openrouter.ai/api/v1/generation?id=<completion.id>",
);
