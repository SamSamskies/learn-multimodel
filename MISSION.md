# Mission: Multi-Model Development for AI Product Engineering

## Why
Become an AI Product Engineer who chooses models with evidence — quality, latency, and $/resolved-task — not vibes or vendor habit. Phase 4 of the [AI Product Engineer roadmap](https://github.com/SamSamskies/ai-product-engineer-roadmap): leave single-provider defaults behind and build the judgment (and plumbing) to route across models and gateways.

## Capstone proving ground
**[Inference Bridge](https://github.com/SamSamskies/inference-bridge)** — add OpenRouter, Anthropic, and Routstr (and later PPQ.ai) as providers beside OpenAI and Ollama, keeping API keys in the extension.

## Secondary tracks (after the OpenRouter foundation)
- A small **model benchmark** harness (reuse Phase 3 eval habits) for comparing models on real tasks
- **Cursor ↔ OpenRouter** experiments: BYOK override, usage/limit tradeoffs vs Cursor Pro defaults, and what belongs in-editor vs in your own apps

## Success looks like
- Call many models through OpenRouter’s OpenAI-compatible API and read cost/latency signals on each call
- Ship OpenRouter (then Anthropic, PPQ.ai, Routstr) providers in Inference Bridge without breaking the IPA contract
- Compare models on a fixed task set and pick winners with Phase 3-style evidence, not demos
- Explain when to use a gateway (OpenRouter / PPQ), a first-party API (Anthropic), a decentralized router (Routstr), or local Ollama
- Know what OpenRouter-in-Cursor can and cannot replace in a Pro workflow

## Constraints
- Solo, self-directed; ~15–30 min lessons; build-heavy
- TypeScript / existing stacks preferred
- Budget-conscious API spend (small OpenRouter top-ups; set spend limits)
- Sequence: **OpenRouter → Anthropic → PPQ.ai → Routstr**

## Out of scope
- Putting OpenRouter (or other remote gateways) into **LocalLab** — that product stays Ollama/local for privacy
- Becoming an ML researcher or training/fine-tuning models
- Deep infra / multi-region serving
- Treating every new model release as mandatory curriculum — durable routing and evaluation skills first
