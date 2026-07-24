/**
 * Lesson 1 — first OpenRouter Chat Completions call via the OpenAI SDK.
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 */
import "dotenv/config";
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
    "X-OpenRouter-Title": "learn-multimodel",
  },
});

const completion = await client.chat.completions.create({
  model,
  messages: [
    {
      role: "user",
      content: "Say hello in exactly five words.",
    },
  ],
});

const choice = completion.choices[0];
console.log("model requested:", model);
console.log("model returned:", completion.model);
console.log("content:", choice?.message?.content);
console.log("usage:", completion.usage);
console.log("id:", completion.id);
