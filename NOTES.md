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

## Future OpenRouter lessons (queued)
- **`openrouter/free`** — free-models router (capability filter + random free pick); also teach `:free` variant for pinning a specific free model. Docs: https://openrouter.ai/docs/guides/routing/routers/free-router
- **`openrouter/fusion`** — multi-model deliberation (panel + judge + web tools); price = sum of underlying completions; Quality/Budget presets or override via fusion plugin. Reach for when cost-of-wrong > extra completions. Docs: https://openrouter.ai/docs/guides/features/plugins/fusion · catalog: https://openrouter.ai/openrouter/fusion
- Suggested order after Lesson 1: free router (cheap exploration) → then Fusion (when comparing/routing judgment matters)

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
