# Multi-Model Development Resources

## Knowledge

- [OpenRouter Quickstart](https://openrouter.ai/docs/quickstart)
  Official entry point: Chat Completions, OpenAI SDK drop-in (`baseURL`), optional attribution headers. Use for: first calls and Integration Bridge adapter shape.
- [OpenRouter Models](https://openrouter.ai/models)
  Live catalog with pricing and provider metadata. Use for: picking cheap practice models and reading `$` before you call.
- [Models API guide](https://openrouter.ai/docs/guides/overview/models)
  `GET /api/v1/models` schema, filters (`sort`, `supported_parameters`, `max_price`, …), pagination, single-model lookup. Use for: Lesson 4 — Bridge model picker from live catalog.
- [List models API reference](https://openrouter.ai/docs/api/api-reference/models/list-all-models-and-their-properties)
  OpenAPI for query params and response shapes. Use for: confirming filter names when coding.
- [Free Models Router (`openrouter/free`)](https://openrouter.ai/docs/guides/routing/routers/free-router)
  Router that picks an available free model (capability-aware). Contrast with `:free` variant on a specific slug. Use for: Lesson 2.
- [Free Variant (`:free`)](https://openrouter.ai/docs/guides/routing/model-variants/free)
  Append `:free` to pin a specific free catalog entry. Use for: Lesson 2 practice pin + Bridge defaults that must stay reproducible.
- [Usage Accounting](https://openrouter.ai/docs/guides/administration/usage-accounting)
  Per-response `usage` (tokens, `cost`, optional details). Always on; include flags deprecated. Use for: Lesson 3 — budget literacy before Fusion.
- [API reference — ResponseUsage](https://openrouter.ai/docs/api/reference/overview)
  Typed shape for `usage` fields including `cost` / `cost_details`. Use for: confirming field names in practice scripts.
- [Generation metadata](https://openrouter.ai/docs/api/api-reference/generations/get-request-&-usage-metadata-for-a-generation)
  `GET /api/v1/generation?id=` for post-hoc cost/latency/provider stats. Use for: auditing after a call when the completion body isn’t enough.
- [Fusion (`openrouter/fusion`)](https://openrouter.ai/docs/guides/features/plugins/fusion)
  Multi-model deliberation (panel + judge); also available as plugin/server tool. Billed as sum of underlying completions. Catalog page: [openrouter/fusion](https://openrouter.ai/openrouter/fusion). Use for: future Fusion lesson when single-model calls feel limiting.
- [OpenRouter API Keys](https://openrouter.ai/settings/keys)
  Key creation and credit management. Use for: setup before Lesson 1 practice.
- [OpenRouter + Cursor integration](https://openrouter.ai/docs/cookbook/coding-agents/cursor-integration)
  Dedicated base URL `https://openrouter.ai/api/v1/cursor` and BYOK caveats (Tab/Composer vs chat). Use for: Cursor lab track — not Lesson 1.
- [PayPerQ (ppq.ai) docs / llms.txt](https://ppq.ai/llms.txt)
  OpenAI-compatible gateway with crypto top-ups and Responses API support. Use for: gateway contrast after OpenRouter literacy.
- [Routstr](https://routstr.com/)
  Decentralized OpenAI-compatible router (Cashu / Nostr). Use for: late Phase 4 after centralized gateways make sense.
- [Inference Bridge README](https://github.com/SamSamskies/inference-bridge)
  Provider adapter pattern (`src/providers/*`, registry). Use for: where OpenRouter skills land in product code.
- [AI Product Engineer roadmap — Phase 4](https://github.com/SamSamskies/ai-product-engineer-roadmap/blob/main/README.md)
  North-star phase goals (routing, cost, benchmarking with evals). Use for: sequencing and success criteria.

## Wisdom (Communities)

- [OpenRouter Discord](https://discord.gg/openrouter) (linked from openrouter.ai)
  High-signal for model availability, provider quirks, and outages. Use for: “is this model dead today?” and routing edge cases.
- [Cursor Forum — BYOK / base URL threads](https://forum.cursor.com/)
  Real-world reports on Override OpenAI Base URL + OpenRouter. Use for: Cursor lab track when docs and forum disagree.

## Gaps

- First-party Anthropic Messages deep-dive resources — add when that arc starts
- Routstr protocol docs depth — add before Routstr lessons
- Formal multi-model eval harness patterns beyond LocalLab Level 1 — pull from learn-evals when benchmarking track starts
