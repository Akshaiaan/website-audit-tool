package com.audittool.controller;

import com.audittool.model.*;
import com.audittool.service.*;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuditController {

    private static final Logger log = LoggerFactory.getLogger(AuditController.class);

    private final ScraperService scraperService;
    private final MetricsService metricsService;
    private final AIService aiService;

    public AuditController(ScraperService scraperService,
                           MetricsService metricsService,
                           AIService aiService) {
        this.scraperService = scraperService;
        this.metricsService = metricsService;
        this.aiService = aiService;
    }

    @PostMapping("/audit")
    public ResponseEntity<?> audit(@RequestBody AuditRequest request) {
        long startTime = System.currentTimeMillis();

        String url = request.getUrl();
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }

        log.info("Starting audit for: {}", url);

        try {
            // Track page load time separately
            long scrapeStart = System.currentTimeMillis();
            Document doc = scraperService.fetchDocument(url);
            long pageLoadMs = System.currentTimeMillis() - scrapeStart;

            String bodyText = doc.body() != null ? doc.body().text() : "";

            MetricsResponse metrics = metricsService.extractMetrics(doc, url);
            metrics.setPageLoadMs(pageLoadMs);

            log.info("Metrics extracted: {} words, {} images, pageLoad={}ms",
                    metrics.getWordCount(), metrics.getImageCount(), pageLoadMs);

            AIService.AIServiceResult aiResult = aiService.generateInsights(metrics, url, bodyText);

            long duration = System.currentTimeMillis() - startTime;
            AuditResponse response = new AuditResponse(
                    url, metrics, aiResult.aiResponse(), aiResult.promptLog(), duration);

            log.info("Audit complete for {} in {}ms", url, duration);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Audit failed for {}: {}", url, e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Audit failed: " + e.getMessage(), "url", url));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "website-audit-tool"));
    }
}