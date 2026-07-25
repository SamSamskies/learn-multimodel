/**
 * Lesson 5 — provider preferences + model fallbacks.
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Default primary: openai/gpt-4o-mini (multi-provider; cheap).
 * Override: npm run practice -- 5 --model google/gemini-2.5-flash
 *
 * Ignore Lesson 1's OPENROUTER_MODEL=openrouter/free default so .env
 * does not turn this into free-router practice.
 */
import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const modelEnv = process.env.OPENROUTER_MODEL?.trim();
const primary =
  modelEnv && modelEnv !== "openrouter/free" ? modelEnv : "openai/gpt-4o-mini";
/** Cheap floor for the models[] chain — only used if primary errors. */
const floor = "google/gemini-2.5-flash";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
    "X-OpenRouter-Title": "learn-multimodel",
  },
});

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
  "X-OpenRouter-Title": "learn-multimodel",
};

/**
 * OpenRouter extends Chat Completions with `provider` / `models`.
 * OpenAI SDK types omit them — pass via cast; they serialize on the wire.
 * @param {string} label
 * @param {Record<string, unknown>} body
 */
async function once(label, body) {
  const t0 = performance.now();
  const completion = await client.chat.completions.create(
    /** @type {import("openai").OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming} */ (
      {
        messages: [{ role: "user", content: "Reply with exactly one word: ok" }],
        ...body,
      }
    ),
  );
  const latencyMs = Math.round(performance.now() - t0);
  const usage = /** @type {Record<string, unknown> | undefined} */ (completion.usage);
  const meta = await fetchGeneration(completion.id);

  console.log(`\n--- ${label} ---`);
  console.log("model returned: ", completion.model);
  console.log("provider_name:  ", meta?.provider_name ?? "(generation lookup failed)");
  console.log("latency_ms:     ", latencyMs);
  console.log("cost (credits): ", usage?.cost ?? "(missing)");
  console.log(
    "audit:          ",
    `https://openrouter.ai/api/v1/generation?id=${completion.id}`,
  );

  return { model: completion.model, provider: meta?.provider_name, latencyMs };
}

/**
 * @param {string} id
 * @returns {Promise<{ provider_name?: string; model?: string } | null>}
 */
async function fetchGeneration(id) {
  const url = new URL("https://openrouter.ai/api/v1/generation");
  url.searchParams.set("id", id);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.warn(`generation lookup ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const json = /** @type {{ data?: Record<string, unknown> }} */ (await res.json());
  return {
    provider_name: json.data?.provider_name != null ? String(json.data.provider_name) : undefined,
    model: json.data?.model != null ? String(json.data.model) : undefined,
  };
}

console.log("Lesson 5: provider preferences + model fallbacks");
console.log("Mission: reliability is configured — same model across providers, then across models.");
console.log(`Primary: ${primary}`);
console.log(`Floor:   ${floor} (models[] last resort)`);

const def = await once("default load-balance (no provider prefs)", {
  model: primary,
});

const byLatency = await once('provider.sort = "latency"', {
  model: primary,
  provider: { sort: "latency" },
});

const withModels = await once("models[] primary + floor (fallback on error only)", {
  model: primary,
  models: [floor],
});

console.log("\n--- compare ---");
console.log("default provider: ", def.provider ?? "?");
console.log("latency provider: ", byLatency.provider ?? "?");
console.log("default latency:  ", def.latencyMs);
console.log("sorted latency:   ", byLatency.latencyMs);
console.log("models[] returned:", withModels.model);
console.log(
  "same model both prefs?",
  def.model === byLatency.model ? "yes — provider changed or stayed; model slug stable" : "slug differed (unexpected)",
);
console.log(
  "\nHabit for Bridge: shape provider + models[]; audit provider_name via GET /generation.",
);
console.log("Provider failover is on by default; models[] is opt-in across models.");
