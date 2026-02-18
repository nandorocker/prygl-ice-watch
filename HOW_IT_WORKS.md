# How Prygl Ice Watch Works

A plain-language explanation of the data pipeline: where the skating conditions come from, how AI fits in, and what triggers each step.

---

## The Full Flow

```
[Vercel Cron]
    │
    │  6:00 AM UTC every day
    ▼
[/api/status handler]
    │
    ├─ 1. Fetch raw HTML from prygl.net  (free)
    ├─ 2. Strip HTML → plain text        (free)
    └─ 3. Send text to OpenRouter AI     (costs money)
              │
              │  Returns: EN + CS summary, YES/NO/UNSURE verdict
              ▼
         [JSON report]
              │
              ▼
    [Vercel CDN cache]  ◄── cached for 24 hours (s-maxage=86400)
              │
              │  All site visitors during those 24 hours
              │  get the cached response — no AI is called again
              ▼
    [Visitor's browser]
              │
              └─ localStorage check: do we already have today's result?
                    ├─ YES → use it immediately, no network call
                    └─ NO  → fetch from API (hits CDN cache)
```

---

## Step-by-Step

### 1. Cron job (trigger)

Vercel runs the `/api/status` endpoint automatically once a day at **6:00 AM UTC**. This is configured in `vercel.json` and is included in Vercel's free plan — no separate scheduler needed.

### 2. Fetching the source data

The API handler fetches the HTML of **prygl.net** and strips all the tags to get plain text. This step is free — it's just an HTTP request to a public webpage, the same as opening it in a browser.

### 3. AI call (the expensive bit)

The plain text (capped at ~8,000 characters) is sent to **OpenRouter**, which routes the request to the `minimax/minimax-m2.5` model. The prompt asks the AI to:

- Summarise the skating conditions in **English** and **Czech**
- Give a **YES / NO / UNSURE** verdict on whether skating is possible

The AI returns a structured JSON response containing those fields, which the handler packages into the final report.

### 4. CDN cache (24-hour window)

The API response is cached at Vercel's edge network for **24 hours** (`Cache-Control: s-maxage=86400`). Any visitor who loads the site during that window gets the cached response. The AI is not called again until the cache expires and the next cron job runs.

### 5. Browser cache (localStorage)

When a visitor's browser fetches the report, the app stores the result in `localStorage` tagged with today's date. On subsequent visits within the same day, the app reads from localStorage directly — no network request is made at all.

---

## Fallback: When prygl.net Is Unreachable

If the fetch of prygl.net fails (site is down, unreachable, etc.), the handler falls back to asking the AI to do its own **web search** via the OpenRouter web plugin. This means the AI searches for current information about Prygl skating conditions itself.

This fallback path results in **2 AI calls** instead of 1 (one for the search, one for the summary).

---

## What Costs Money

Only **OpenRouter API calls** cost money. Everything else (Vercel cron, CDN cache, localStorage) is free.

| Scenario | AI calls | Notes |
|---|---|---|
| Normal day | 1 | Cron fires at 6am, CDN serves everyone else |
| prygl.net is down | 2 | Fallback web search adds a second call |
| Force refresh (debug panel) | 1–2 | Bypasses all caches; hits the AI again |

In a typical month with no outages and no debug use, the cost is **~30 AI calls**.

---

## Is the AI Strictly Necessary?

The AI handles two things that would otherwise require more code:

1. **Reading an unstructured webpage** and turning it into a short, human-readable summary — without knowing in advance exactly which HTML elements contain the relevant text.
2. **Making the YES/NO/UNSURE call** from that text, in two languages.

**Alternative without AI:** scrape specific HTML elements from prygl.net and apply regex rules to detect keywords like "open", "closed", "ice conditions". This would be cheaper (free), but fragile — any redesign of prygl.net's page layout would break the scraper.

The AI approach is more resilient to page changes at the cost of a small per-day API fee.
