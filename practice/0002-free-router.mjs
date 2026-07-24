/**
 * Lesson 2 — Free Models Router vs pinned :free variant.
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Default: pin whatever the router just returned (free catalogs churn).
 * Override: npm run practice -- 2 --model some/slug:free
 * or OPENROUTER_FREE_PIN in .env
 */
import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

/**
 * Explicit pin override. Ignore OPENROUTER_MODEL when it is the Lesson 1
 * router default so .env does not turn the pin into another router call.
 */
const modelEnv = process.env.OPENROUTER_MODEL;
const pinOverride =
  process.env.OPENROUTER_FREE_PIN ??
  (modelEnv && modelEnv !== "openrouter/free" ? modelEnv : undefined);

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
    "X-OpenRouter-Title": "learn-multimodel",
  },
});

async function once(label, model) {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: "Reply with exactly three words naming a color.",
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim() ?? "(empty)";
  console.log(`\n--- ${label} ---`);
  console.log("model requested:", model);
  console.log("model returned: ", completion.model);
  console.log("content:        ", content);
  console.log("usage:          ", completion.usage);
  return completion.model;
}

console.log("Lesson 2: router vs pinned :free");
console.log("Watch requested vs returned — openrouter/free is a router, not a model.");
console.log("Free :free slugs come and go; we pin a live slug from the router by default.");

const first = await once("router call A", "openrouter/free");
const second = await once("router call B", "openrouter/free");

const pinnedFree = pinOverride ?? first;
if (!pinOverride) {
  console.log(`\n(no pin override — reusing router A's returned slug as the pin)`);
} else {
  console.log(`\n(using pin override: ${pinOverride})`);
}

const pinned = await once("pinned :free", pinnedFree);

console.log("\n--- compare ---");
console.log("router A returned:", first);
console.log("router B returned:", second);
console.log(
  "same upstream both times?",
  first === second ? "yes (possible — random can repeat)" : "no (expected often)",
);
console.log("pin requested:    ", pinnedFree);
console.log("pin returned:     ", pinned);
console.log(
  "pin matched request?",
  pinned === pinnedFree
    ? "yes — you asked for a specific free model and got it"
    : "check returned slug (aliases / routing can differ slightly)",
);
console.log(
  "\nOptional: pin a catalog slug yourself — npm run practice -- 2 --model provider/model:free",
);
console.log("Browse live free models: https://openrouter.ai/models?q=free");
