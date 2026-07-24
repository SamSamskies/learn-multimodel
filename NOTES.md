# Notes

## Learner profile
- 10+ year frontend engineer; solo AI Product Engineer path
- Phase 0–3 done: Cursor, OpenAI platform, AI UX, evals (LocalLab harness)
- Prefers ~15–30 min, build-heavy lessons with a tangible win
- Budget-conscious; willing to pay small API top-ups

## Teaching preferences (carry forward)
- Cite primary docs; don’t invent API shapes
- Practice in this repo first, then land skills in Inference Bridge
- Quizzes: equal word counts on options; tight feedback loops
- Ask agent teacher when stuck

## Sequence
1. OpenRouter (gateway literacy, OpenAI-compatible drop-in)
2. Anthropic Messages / first-party Claude
3. PPQ.ai (alternate gateway — crypto / pay-per-use contrast)
4. Routstr (decentralized, Cashu, Nostr discovery)

## OpenRouter lesson sequence
- ✅ Lesson 1 — first OpenRouter call (SDK drop-in)
- ✅ Lesson 2 — `openrouter/free` vs `:free` pin
- ✅ / in progress Lesson 3 — `usage.cost` + client latency on every call
- **Next after 3:** list models API (catalog → Bridge model picker) OR provider preferences / fallbacks — then Fusion
- **`openrouter/fusion`** — multi-model deliberation (panel + judge + web tools); price = sum of underlying completions; Quality/Budget presets or override via fusion plugin. Reach for when cost-of-wrong > extra completions. Docs: https://openrouter.ai/docs/guides/features/plugins/fusion · catalog: https://openrouter.ai/openrouter/fusion
- Then: provider preferences / fallbacks → Inference Bridge OpenRouter adapter

## Teaching note (2026-07-24)
- User finds the lesson format fun — keep ~15–20 min, build-heavy, one tangible win
- Free catalog slugs churn hard (`:free` → paid-only 404). practice/0002 pins the router’s returned slug by default; `--model` / `OPENROUTER_FREE_PIN` for explicit live pins only
- Known stale examples: `meta-llama/llama-3.2-3b-instruct:free`, `tencent/hy3:free`

## Proving ground priorities
1. **Inference Bridge** providers (OpenRouter → Anthropic → Routstr; PPQ later)
2. Lightweight **benchmark** harness for model contrast
3. **Cursor + OpenRouter** exploration (BYOK; dedicated `/api/v1/cursor` endpoint per OpenRouter docs) — not a substitute for Pro Tab/Composer quirks; treat as a lab track

## Explicit non-goals
- LocalLab stays local (Ollama only) — do not route it through OpenRouter
- Don’t expand IPA normative surface casually; new Bridge capabilities may be experimental

## Open questions to revisit
- Soft budget ceiling for OpenRouter credits per month?
- When to spin the benchmark app vs keep scripts in this repo?
