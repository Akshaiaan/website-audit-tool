# Website Audit Tool

An AI-powered website auditing tool built for Eight25Media. Enter any URL to get factual page metrics plus structured insights powered by AI.

---

## Live Demo

Run locally following the setup instructions below.

---

## Architecture Overview
```
React Frontend (port 3000)
        │
        │  POST /api/audit { url }
        ▼
Spring Boot Backend (port 8080)
        │
        ├── ScraperService   → Jsoup fetches HTML
        ├── MetricsService   → Deterministic DOM extraction
        └── AIService        → Groq LLM API (llama-3.3-70b)
                │
                ▼
        JSON response back to React
        (metrics + scores + AI insights + prompt log)
```

Three clean layers, each with a single responsibility:

- **Scraper** — Jsoup with a real browser user-agent, handles redirects and timeouts. Also tracks page load time.
- **Metrics** — Pure DOM computation, zero AI involvement. Deterministic and fast.
- **AI** — Receives structured metrics + truncated page text. Returns structured JSON insights.

---

## Metrics Extracted (Factual — No AI)

| Metric | Method |
|--------|--------|
| Word count | `doc.body().text().split("\\s+")` |
| H1 / H2 / H3 counts | `doc.select("h1")` etc. |
| CTA count | `<button>` elements + anchor links matching CTA keywords |
| Internal vs external links | Domain comparison against base URL |
| Image count | `doc.select("img")` |
| Images missing alt text | `doc.select("img:not([alt])")` |
| Meta title | `doc.title()` |
| Meta description | `doc.selectFirst("meta[name=description]")` |
| Page load time | Measured via `System.currentTimeMillis()` around the Jsoup fetch |

---

## Score Cards

After each audit, four scores are computed entirely on the frontend from the raw metrics — no AI involved:

- **SEO Score** — based on meta title, meta description, H1/H2 presence, word count
- **UX Score** — based on CTA count, alt text coverage, internal links, images
- **Content Score** — based on word count, heading hierarchy, external links
- **Performance Score** — based on page load time (green < 1s, orange < 3s, red > 3s)

---

## AI Design Decisions

### 1. Structured Prompt with Injected Metrics
The user prompt injects the `MetricsResponse.toString()` output directly into the message. This grounds the AI in real numbers and prevents hallucination — the model cannot invent metrics it was not given.

### 2. JSON-only Response Contract
The system prompt instructs the AI to respond **only** in a defined JSON schema. This makes parsing reliable and keeps the AI layer a clean data transformation step.

### 3. Content Truncation at 3,000 chars
The page's visible body text is truncated to 3,000 characters. This is intentional:
- Avoids exceeding context limits
- The most strategically important content is almost always near the top
- Keeps latency and cost predictable

### 4. System vs User Prompt Separation
The **system prompt** establishes the role and response contract. The **user prompt** contains the data. This separation makes it easy to tune behaviour without touching data injection logic.

---

## Trade-offs

| Decision | Reason |
|----------|--------|
| Single-page only | Scope constraint — multi-page crawl adds significant complexity |
| 3,000 char content cap | Balances context quality vs token cost and latency |
| No caching | Kept simple for the scope — real use case would cache by URL + TTL |
| Score cards computed on frontend | Keeps backend pure data, frontend handles presentation logic |
| Groq instead of OpenAI | Free tier available, llama-3.3-70b performs well for structured JSON tasks |

---

## What I Would Improve With More Time

1. **Lighthouse integration** — Pull real performance scores (LCP, CLS, FID) via Lighthouse CI API
2. **Multi-page crawl** — Follow internal links up to N hops, aggregate metrics across pages
3. **Caching layer** — Redis cache keyed on URL + date to avoid re-scraping
4. **Competitor comparison** — Audit two URLs side by side and diff the metrics
5. **Historical tracking** — Store audits in a database, show metric trends over time
6. **Better CTA detection** — Use CSS selector heuristics and link position scoring

---

## Setup & Running

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+
- Groq API key (free at https://console.groq.com)

### Backend
```bash
cd backend

# Set your Groq API key
$env:ANTHROPIC_API_KEY="gsk_your_groq_key_here"

# Run
mvn spring-boot:run
# Starts on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

### Test the API directly
```bash
curl -X POST http://localhost:8080/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## Project Structure
```
website-audit-tool/
├── README.md
├── PROMPT_LOGS.md
├── sample-prompt-log.json
├── backend/
│   └── src/main/java/com/audittool/
│       ├── controller/AuditController.java
│       ├── service/
│       │   ├── ScraperService.java
│       │   ├── MetricsService.java
│       │   └── AIService.java
│       ├── model/
│       │   ├── AuditRequest.java
│       │   ├── MetricsResponse.java
│       │   ├── AIResponse.java
│       │   ├── PromptLog.java
│       │   └── AuditResponse.java
│       └── config/CorsConfig.java
└── frontend/
    └── src/
        ├── App.js
        └── services/api.js
```

---

## Prompt Logs

Every audit response includes a `promptLog` field containing the full AI orchestration trace. See `PROMPT_LOGS.md` and `sample-prompt-log.json` for full details.