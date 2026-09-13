# ART-004 — Product Manager / Technical Debt Negotiation

## The Scenario

Product manager: "We need the AI skin analysis feature live by next sprint. The competitor just launched theirs."

## My Response

"I understand the urgency. Let me walk you through what I'm seeing so we can make the right call together.

### The real cost of building it now

Right now, the skin analysis router has zero tests, uses the OpenAI API directly with no rate limiting, and stores analysis results in an unindexed JSONB column. If we ship it next sprint, here's what happens:

| Timeline     | Cost                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Week 1-2** | Users love it — 500 analyses/day                                                                                                            |
| **Week 3**   | OpenAI bill arrives — we're making unbounded API calls with no caching. Someone uploads a 20MB RAW file and our upload handler crashes.     |
| **Week 4**   | The JSONB column hits 100K rows. The 'recent analyses' query goes from 50ms to 3 seconds. We get our first 1-star review: 'تحميل بطيء جداً' |
| **Week 6**   | We're now firefighting instead of building. The competitor ships v2.                                                                        |

### My counter-proposal

Let me spend **3 days** this sprint on the foundation, then ship the full feature next sprint:

| What                     | Time                                                          | Value                           |
| ------------------------ | ------------------------------------------------------------- | ------------------------------- |
| **Sprint 1 (3 days)**    | Add rate limiting per user for OpenAI calls                   | Prevents $10K API bill surprise |
|                          | Add Redis cache for identical images (same SHA = same result) | 60% fewer API calls             |
|                          | Add a `skin_analyses` table with proper indexes               | The slow query never happens    |
| **Sprint 2 (remaining)** | Full feature: UI, image upload, results display               | Launch-ready, not launch-panic  |

### Trade-off

We ship 2 weeks later, but we ship ONCE — not once in a panic and then again in emergency mode. The competitor launched first, but their v1 will be buggy too if they cut the same corners. Our v1 will be reliable, and reliability is the feature that keeps users coming back.

If the 2-week delay is truly unacceptable, I can build a **gated beta** this sprint — available to 100 users behind a feature flag, with a 'Report Issue' button. This gives us real usage data without risking the entire user base.

What do you think?"
