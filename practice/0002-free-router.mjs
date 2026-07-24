/**
 * Lesson 2 — Free Models Router vs pinned :free variant.
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Override the pinned free model with:
 *   npm run practice -- 2 --model some/slug:free
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
 * Pin for the third call. Ignore OPENROUTER_MODEL when it is the Lesson 1
 * router default so .env does not turn the pin into another router call.
 * Override: npm run practice -- 2 --model some/slug:free
 * or OPENROUTER_FREE_PIN in .env
 */
const modelEnv = process.env.OPENROUTER_MODEL;
const pinnedFree =
  process.env.OPENROUTER_FREE_PIN ??
  (modelEnv && modelEnv !== "openrouter/free" ? modelEnv : undefined) ??
  "meta-llama/llama-3.2-3b-instruct:free";

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

const first = await once("router call A", "openrouter/free");
const second = await once("router call B", "openrouter/free");
const pinned = await once("pinned :free", pinnedFree);

console.log("\n--- compare ---");
console.log("router A returned:", first);
console.log("router B returned:", second);
console.log(
  "same upstream both times?",
  first === second ? "yes (possible — random can repeat)" : "no (expected often)",
);
console.log("pinned returned:  ", pinned);
console.log(
  "\nIf the pinned call failed, pick a live :free slug from https://openrouter.ai/models?q=free",
);
console.log("and rerun: npm run practice -- 2 --model provider/model:free");
