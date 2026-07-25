/**
 * Lesson 4 — discover models via GET /api/v1/models (Bridge picker shape).
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Optional search: npm run practice -- 4 --model gemini
 * (maps to the `q` query param)
 *
 * Ignore Lesson 1's OPENROUTER_MODEL=openrouter/free default so .env
 * does not turn every run into a useless `q=openrouter/free` search.
 */
import "dotenv/config";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const modelEnv = process.env.OPENROUTER_MODEL?.trim();
const searchQ =
  modelEnv && modelEnv !== "openrouter/free" ? modelEnv : null;

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
  "X-OpenRouter-Title": "learn-multimodel",
};

/**
 * @param {Record<string, string | number | undefined>} params
 */
async function listModels(params = {}) {
  const url = new URL("https://openrouter.ai/api/v1/models");
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GET ${url.pathname}${url.search} → ${res.status}: ${body.slice(0, 400)}`);
  }
  return /** @type {{ data: Array<Record<string, unknown>>; total_count?: number }} */ (
    await res.json()
  );
}

/** Catalog prices are USD per token (string). Show familiar $/M. */
function perMillion(priceStr) {
  if (priceStr == null || priceStr === "") return null;
  const n = Number(priceStr);
  if (Number.isNaN(n)) return null;
  return n * 1e6;
}

function isFree(model) {
  const pricing = /** @type {Record<string, string> | undefined} */ (model.pricing);
  return pricing?.prompt === "0" && pricing?.completion === "0";
}

function hasTools(model) {
  const params = /** @type {string[] | undefined} */ (model.supported_parameters);
  return Array.isArray(params) && params.includes("tools");
}

function row(model) {
  const pricing = /** @type {Record<string, string>} */ (model.pricing ?? {});
  const promptM = perMillion(pricing.prompt);
  const completionM = perMillion(pricing.completion);
  return {
    id: String(model.id ?? ""),
    name: String(model.name ?? ""),
    context: Number(model.context_length ?? 0),
    prompt_per_M: promptM,
    completion_per_M: completionM,
    free: isFree(model),
    tools: hasTools(model),
  };
}

function printTable(label, models, limit = 8) {
  console.log(`\n--- ${label} (showing ${Math.min(limit, models.length)} of ${models.length}) ---`);
  const slice = models.slice(0, limit);
  for (const m of slice) {
    const price =
      m.free
        ? "$0 free"
        : `$${m.prompt_per_M?.toFixed(4) ?? "?"}/M in · $${m.completion_per_M?.toFixed(4) ?? "?"}/M out`;
    const flags = [m.tools ? "tools" : null].filter(Boolean).join(", ") || "—";
    console.log(`${m.id}`);
    console.log(`  ${m.name} · ctx ${m.context} · ${price} · ${flags}`);
  }
}

console.log("Lesson 4: GET /api/v1/models — live catalog for a Bridge-style picker");
console.log("Mission: choose models with evidence (price + capabilities) before you call.");
if (searchQ) console.log(`Search q=${JSON.stringify(searchQ)}`);

const free = await listModels({
  max_price: 0,
  sort: "pricing-low-to-high",
  limit: 20,
  ...(searchQ ? { q: searchQ } : {}),
});

const cheapTools = await listModels({
  supported_parameters: "tools",
  sort: "pricing-low-to-high",
  limit: 15,
  ...(searchQ ? { q: searchQ } : {}),
});

const freeRows = (free.data ?? []).map(row).filter((m) => m.free);
const toolRows = (cheapTools.data ?? []).map(row);
const freeWithTools = toolRows.filter((m) => m.free);

printTable("free (max_price=0)", freeRows);
printTable("cheapest with tools", toolRows);
printTable("free + tools (from tools query)", freeWithTools, 5);

console.log("\n--- summary ---");
console.log("free total_count:", free.total_count ?? freeRows.length);
console.log("tools query total_count:", cheapTools.total_count ?? toolRows.length);
console.log("free+tools in this page:", freeWithTools.length);
console.log(
  "\nHabit for Bridge: fetch catalog → show id, $/M, context, capabilities → then complete.",
);
console.log("Browse UI twin: https://openrouter.ai/models");
