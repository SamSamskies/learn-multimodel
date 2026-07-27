/**
 * Lesson 8 — Bridge-shaped OpenRouter provider (portable draft).
 * Requires OPENROUTER_API_KEY in .env (see .env.example).
 *
 * Mirrors Inference Bridge’s Provider contract (see inference-bridge
 * src/providers/openai.js). Smoke-tests streamChat; port this shape into
 * Bridge next (registry + host_permissions + Options key wiring).
 *
 * Optional: npm run practice -- 8 --model openrouter/free
 */
import "dotenv/config";

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error("Missing OPENROUTER_API_KEY. Copy .env.example → .env and add your key.");
  process.exit(1);
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Small curated list — Bridge OpenAI uses the same idea (not the full catalog). */
export const OPENROUTER_MODELS = Object.freeze([
  "openrouter/free",
  "openrouter/pareto-code",
  "openai/gpt-4o-mini",
  "google/gemini-2.5-flash",
  "anthropic/claude-sonnet-4",
]);

/**
 * @typedef {{
 *   id: string,
 *   label: string,
 *   requiresApiKey: boolean,
 *   defaultModel: string,
 *   models?: readonly string[],
 *   listModels?: (args?: { signal?: AbortSignal }) => Promise<string[]>,
 *   streamChat: (args: {
 *     apiKey?: string,
 *     model: string,
 *     messages: Array<{ role: string, content: string }>,
 *     signal: AbortSignal,
 *     onDelta: (content: string) => void,
 *   }) => Promise<{
 *     model: string,
 *     message: { role: "assistant", content: string },
 *     usage?: { inputTokens?: number, outputTokens?: number }
 *   }>
 * }} Provider
 */

/** @type {Provider} */
export const openrouterProvider = {
  id: "openrouter",
  label: "OpenRouter",
  requiresApiKey: true,
  models: OPENROUTER_MODELS,
  defaultModel: "openrouter/free",

  async streamChat({ apiKey: key, model, messages, signal, onDelta }) {
    let response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/SamSamskies/learn-multimodel",
          "X-OpenRouter-Title": "learn-multimodel",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          stream_options: { include_usage: true },
        }),
        signal,
      });
    } catch (err) {
      if (signal.aborted || (err && /** @type {Error} */ (err).name === "AbortError")) {
        const aborted = new Error("Request aborted");
        aborted.name = "InferenceError";
        /** @type {any} */ (aborted).code = "aborted";
        throw aborted;
      }
      const unavailable = new Error(
        err instanceof Error ? err.message : "Network error contacting OpenRouter",
      );
      unavailable.name = "InferenceError";
      /** @type {any} */ (unavailable).code = "unavailable";
      throw unavailable;
    }

    if (!response.ok) {
      let detail = `OpenRouter HTTP ${response.status}`;
      try {
        const body = await response.json();
        if (body?.error?.message) detail = body.error.message;
      } catch {
        // ignore
      }
      const error = new Error(detail);
      error.name = "InferenceError";
      /** @type {any} */ (error).code =
        response.status >= 500 ? "unavailable" : "provider_error";
      throw error;
    }

    if (!response.body) {
      const error = new Error("OpenRouter response had no body");
      error.name = "InferenceError";
      /** @type {any} */ (error).code = "provider_error";
      throw error;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let resolvedModel = model;
    /** @type {{ inputTokens?: number, outputTokens?: number } | undefined} */
    let usage;

    /**
     * @param {string} line
     */
    function handleLine(line) {
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data:")) return;
      const data = line.slice(5).trimStart();
      if (!data || data === "[DONE]") return;

      let parsed;
      try {
        parsed = JSON.parse(data);
      } catch {
        return;
      }

      if (typeof parsed.model === "string" && parsed.model) {
        resolvedModel = parsed.model;
      }

      if (parsed.usage) {
        usage = {
          inputTokens: parsed.usage.prompt_tokens,
          outputTokens: parsed.usage.completion_tokens,
        };
      }

      const delta = parsed.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta.length > 0) {
        content += delta;
        onDelta(delta);
      }
    }

    /**
     * @param {boolean} flushRemainder
     */
    function drainBuffer(flushRemainder) {
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        handleLine(line);
      }
      if (flushRemainder && buffer.length > 0) {
        const line = buffer;
        buffer = "";
        handleLine(line);
      }
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          drainBuffer(false);
        }
        if (done) {
          buffer += decoder.decode();
          drainBuffer(true);
          break;
        }
      }
    } catch (err) {
      if (signal.aborted || (err && /** @type {Error} */ (err).name === "AbortError")) {
        const aborted = new Error("Request aborted");
        aborted.name = "InferenceError";
        /** @type {any} */ (aborted).code = "aborted";
        throw aborted;
      }
      throw err;
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // ignore
      }
    }

    return {
      model: resolvedModel,
      message: { role: "assistant", content },
      usage,
    };
  },
};

function assertProviderShape(provider) {
  const required = ["id", "label", "requiresApiKey", "defaultModel", "streamChat"];
  for (const key of required) {
    if (provider[key] == null) {
      throw new Error(`Provider missing required field: ${key}`);
    }
  }
  if (!provider.models && typeof provider.listModels !== "function") {
    throw new Error("Provider needs models[] or listModels()");
  }
}

const modelEnv = process.env.OPENROUTER_MODEL?.trim();
const model =
  modelEnv && OPENROUTER_MODELS.includes(modelEnv)
    ? modelEnv
    : modelEnv || openrouterProvider.defaultModel;

console.log("Lesson 8: Bridge-shaped OpenRouter provider");
console.log("Mission: portable Provider you can drop into Inference Bridge.");
assertProviderShape(openrouterProvider);
console.log("shape:         ok (", openrouterProvider.id, "/", openrouterProvider.label, ")");
console.log("defaultModel: ", openrouterProvider.defaultModel);
console.log("models:       ", openrouterProvider.models?.join(", "));
console.log("calling:      ", model);
console.log("streaming:\n");

const controller = new AbortController();
const t0 = performance.now();
const result = await openrouterProvider.streamChat({
  apiKey,
  model,
  messages: [
    {
      role: "user",
      content: "Reply with exactly: bridge-ok",
    },
  ],
  signal: controller.signal,
  onDelta: (chunk) => process.stdout.write(chunk),
});
const latencyMs = Math.round(performance.now() - t0);

process.stdout.write("\n\n");
console.log("--- done ---");
console.log("model returned:", result.model);
console.log("latency_ms:    ", latencyMs);
console.log("usage:         ", result.usage ?? "(none)");
console.log(
  "\nPort checklist (Inference Bridge):\n" +
    "  1. Copy this Provider into src/providers/openrouter.js\n" +
    "  2. Register in src/providers/registry.js\n" +
    "  3. Add host_permissions for https://openrouter.ai/*\n" +
    "  4. Wire a dedicated openrouterApiKey (don’t silently reuse openaiApiKey forever)\n" +
    "  5. Leave window.inference / IPA chunks untouched\n",
);
