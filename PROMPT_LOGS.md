# Prompt Logs & AI Reasoning Trace

This document provides full visibility into how the AI layer is structured and orchestrated.

> API keys have been redacted. All other content is unmodified.

---

## Overview: How the AI Layer Works
```
1. SYSTEM PROMPT   → Establishes role, rules, and response contract (JSON schema)
2. USER PROMPT     → Injects real URL + factual metrics + truncated page content
3. RESPONSE PARSE  → Extracts structured fields; raw output preserved before parsing
```

---

## 1. System Prompt

Sent as the `system` role in every API request.
```
You are an expert SEO and UX analyst for a high-performing web agency.
Your job is to audit webpages and provide specific, actionable insights grounded in real data.

CRITICAL RULES:
- Every insight MUST reference specific numbers from the provided metrics
- Never give generic advice — tie everything to the actual data
- Be direct and specific, like a senior consultant giving a client brief
- Do NOT invent metrics or hallucinate data

You MUST respond with ONLY valid JSON in this exact structure (no markdown, no preamble):
{
  "seoAnalysis": "string",
  "messagingClarity": "string",
  "ctaAnalysis": "string",
  "contentDepth": "string",
  "uxConcerns": "string",
  "recommendations": [
    {
      "priority": 1,
      "title": "string",
      "reasoning": "string",
      "action": "string"
    }
  ]
}

Provide 3-5 recommendations ordered by priority (1 = highest impact).
```

**Design rationale:**
- JSON-only response eliminates unreliable text parsing
- CRITICAL RULES block prevents generic filler advice
- Schema is explicit — no ambiguity about field names or types
- Role framing shifts the AI tone from helpful assistant to critical analyst

---

## 2. User Prompt (Constructed at Runtime)

Assembled in `AIService.java` from the target URL, serialised `MetricsResponse`, and a 3,000-char content snippet.

**Example (real audit of https://example.com):**
```
Audit this webpage: https://example.com

=== EXTRACTED METRICS (factual, use these as the basis for your analysis) ===
- Word Count: 218
- H1 Tags: 1
- H2 Tags: 0
- H3 Tags: 0
- CTAs (buttons/primary links): 1 (samples: More information...)
- Internal Links: 1
- External Links: 2
- Images: 0
- Images Missing Alt Text: 0 (0.0%)
- Meta Title: Example Domain
- Meta Description: MISSING
- Page Load Time: 312ms

=== PAGE CONTENT SNIPPET (first 3000 chars of visible text) ===
Example Domain
This domain is for use in illustrative examples in documents.
You may use this domain in literature without prior coordination or asking for permission.
More information...

Provide a structured JSON audit report following the system prompt schema.
```

---

## 3. Structured Input Data
```json
{
  "wordCount": 218,
  "h1Count": 1,
  "h2Count": 0,
  "h3Count": 0,
  "ctaCount": 1,
  "ctaSamples": ["More information..."],
  "internalLinks": 1,
  "externalLinks": 2,
  "imageCount": 0,
  "missingAltCount": 0,
  "missingAltPercent": 0.0,
  "metaTitle": "Example Domain",
  "metaDescription": null,
  "pageLoadMs": 312
}
```

---

## 4. Raw Model Output (Before Parsing)
```json
{
  "seoAnalysis": "The page has a single H1 tag ('Example Domain') which is correct SEO practice, but the complete absence of a meta description is a significant gap. With only 218 words and no H2 or H3 tags, the page has no heading hierarchy, limiting keyword targeting and content scannability for crawlers.",
  "messagingClarity": "The primary message is clear in its brevity. However, with 218 words and a single CTA ('More information...'), there is no value proposition, no audience targeting, and no persuasive structure.",
  "ctaAnalysis": "Only 1 CTA detected: 'More information...' — a vague, low-intent label. With 1 internal link and 2 external links on a 218-word page, the page offers minimal navigation options.",
  "contentDepth": "At 218 words with no H2 or H3 sub-sections, this page has extremely shallow content depth. Pages under 300 words are typically considered thin content by SEO standards.",
  "uxConcerns": "The page has 0 images, limiting visual engagement. The absence of a meta description means the SERP preview will be unpredictable. With only 1 CTA and 218 words, a real user would have no clear next action.",
  "recommendations": [
    {
      "priority": 1,
      "title": "Add a meta description",
      "reasoning": "Meta description is currently MISSING. This directly reduces click-through rates from search results.",
      "action": "Write a 150-160 character meta description that summarises the page purpose and includes a primary keyword."
    },
    {
      "priority": 2,
      "title": "Expand content depth past 300 words",
      "reasoning": "At 218 words with zero H2/H3 tags, this page is classified as thin content by SEO standards.",
      "action": "Add at least 2 H2 sections with supporting paragraph content targeting relevant keywords."
    },
    {
      "priority": 3,
      "title": "Replace vague CTA with a specific action",
      "reasoning": "The single CTA 'More information...' is low-intent. 1 CTA on 218 words is insufficient for conversion.",
      "action": "Replace with a specific, benefit-driven CTA such as 'View Full Documentation'."
    }
  ]
}
```

---

## 5. Full API Request Structure
```json
{
  "model": "llama-3.3-70b-versatile",
  "max_tokens": 2048,
  "messages": [
    {
      "role": "system",
      "content": "... system prompt above ..."
    },
    {
      "role": "user",
      "content": "... user prompt above ..."
    }
  ]
}
```

**Headers:**
```
Authorization: Bearer gsk_[REDACTED]
Content-Type:  application/json
```

---

## 6. Where Prompt Logs Are Captured

In `AIService.java`, the full trace is stored in a `PromptLog` object before any parsing:
```java
PromptLog promptLog = new PromptLog(
    SYSTEM_PROMPT,   // exact system prompt sent
    userPrompt,      // constructed user prompt with injected metrics
    metrics.toString(), // raw metrics input
    aiJsonText,      // raw model output before parsing
    model            // model name
);
```

This is returned in every `AuditResponse` as the `promptLog` field.