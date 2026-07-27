# Lesson 7 complete — Pareto coding router

User finished Lesson 7: `openrouter/pareto-code` + `min_coding_score` sets an AA coding-percentile floor, then picks cheapest (or `:nitro`) in-tier; `session_id` sticks model/provider for multi-turn, not response cache. Also corrected: “cheapest in tier” is rate, not guaranteed lowest bill — verbose/reasoning-heavy low-tier models can outspend a tighter medium completion. Floor for next sessions: land a Bridge-shaped OpenRouter `Provider` adapter (clone `openai.js` stream path; leave IPA page contract untouched).
