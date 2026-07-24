# Free `:free` catalog slugs churn

Hardcoded free pins go stale: `meta-llama/llama-3.2-3b-instruct:free` and earlier `tencent/hy3:free` both 404’d as “unavailable for free” while paid slugs remained. Lesson 2 practice now pins the slug returned by `openrouter/free` (or an explicit live override) instead of a baked-in free id. Implication: never treat a free catalog entry as a durable Bridge default without a freshness check.
