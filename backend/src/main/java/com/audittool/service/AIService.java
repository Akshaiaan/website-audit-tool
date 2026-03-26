package com.audittool.service;

import com.audittool.model.AIResponse;
import com.audittool.model.MetricsResponse;
import com.audittool.model.PromptLog;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class AIService {

    private static final Logger log = LoggerFactory.getLogger(AIService.class);

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.api.url}")
    private String apiUrl;

    @Value("${anthropic.model}")
    private String model;

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
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
            """;

    public AIServiceResult generateInsights(MetricsResponse metrics, String url, String content) {

        String contentSnippet = content.length() > 3000
                ? content.substring(0, 3000) + "\n... [content truncated at 3000 chars]"
                : content;

        String userPrompt = """
                Audit this webpage: %s

                === EXTRACTED METRICS (factual, use these as the basis for your analysis) ===
                %s

                === PAGE CONTENT SNIPPET (first 3000 chars of visible text) ===
                %s

                Provide a structured JSON audit report following the system prompt schema.
                """.formatted(url, metrics.toString(), contentSnippet);

        // Build Groq request body (OpenAI-compatible format)
        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(new java.util.HashMap<>() {{
                put("model", model);
                put("max_tokens", 2048);
                put("messages", List.of(
                        new java.util.HashMap<>() {{
                            put("role", "system");
                            put("content", SYSTEM_PROMPT);
                        }},
                        new java.util.HashMap<>() {{
                            put("role", "user");
                            put("content", userPrompt);
                        }}
                ));
            }});
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize API request", e);
        }

        Request request = new Request.Builder()
                .url(apiUrl)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .post(RequestBody.create(requestBody, MediaType.get("application/json")))
                .build();

        String rawOutput;
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "no body";
                log.error("Groq API error {}: {}", response.code(), errorBody);
                throw new RuntimeException("Groq API returned " + response.code() + ": " + errorBody);
            }
            rawOutput = response.body().string();
        } catch (IOException e) {
            throw new RuntimeException("Failed to call Groq API: " + e.getMessage(), e);
        }

        log.debug("Raw Groq response: {}", rawOutput);

        // Extract text from OpenAI-compatible response format
        String aiJsonText;
        try {
            JsonNode root = objectMapper.readTree(rawOutput);
            aiJsonText = root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from Groq response: " + e.getMessage(), e);
        }

        AIResponse aiResponse = parseAIResponse(aiJsonText);
        aiResponse.setRawOutput(aiJsonText);

        PromptLog promptLog = new PromptLog(
                SYSTEM_PROMPT,
                userPrompt,
                metrics.toString(),
                aiJsonText,
                model
        );

        return new AIServiceResult(aiResponse, promptLog);
    }

    private AIResponse parseAIResponse(String jsonText) {
        AIResponse response = new AIResponse();
        try {
            String clean = jsonText.trim();
            if (clean.startsWith("```")) {
                clean = clean.replaceAll("```json\\n?", "").replaceAll("```", "").trim();
            }

            JsonNode node = objectMapper.readTree(clean);

            response.setSeoAnalysis(node.path("seoAnalysis").asText("No SEO analysis available."));
            response.setMessagingClarity(node.path("messagingClarity").asText("No messaging analysis available."));
            response.setCtaAnalysis(node.path("ctaAnalysis").asText("No CTA analysis available."));
            response.setContentDepth(node.path("contentDepth").asText("No content depth analysis available."));
            response.setUxConcerns(node.path("uxConcerns").asText("No UX concerns identified."));

            List<AIResponse.Recommendation> recs = new ArrayList<>();
            JsonNode recsNode = node.path("recommendations");
            if (recsNode.isArray()) {
                for (JsonNode rec : recsNode) {
                    recs.add(new AIResponse.Recommendation(
                            rec.path("priority").asInt(recs.size() + 1),
                            rec.path("title").asText(""),
                            rec.path("reasoning").asText(""),
                            rec.path("action").asText("")
                    ));
                }
            }
            response.setRecommendations(recs);

        } catch (Exception e) {
            log.error("Failed to parse AI JSON response: {}", e.getMessage());
            response.setSeoAnalysis("Parse error — see raw output in prompt log.");
            response.setRawOutput(jsonText);
        }
        return response;
    }

    public record AIServiceResult(AIResponse aiResponse, PromptLog promptLog) {}
}