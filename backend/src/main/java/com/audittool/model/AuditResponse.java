package com.audittool.model;

public class AuditResponse {
    private String url;
    private MetricsResponse metrics;
    private AIResponse ai;
    private PromptLog promptLog;
    private long processingTimeMs;

    public AuditResponse() {}

    public AuditResponse(String url, MetricsResponse metrics, AIResponse ai,
                         PromptLog promptLog, long processingTimeMs) {
        this.url = url;
        this.metrics = metrics;
        this.ai = ai;
        this.promptLog = promptLog;
        this.processingTimeMs = processingTimeMs;
    }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public MetricsResponse getMetrics() { return metrics; }
    public void setMetrics(MetricsResponse metrics) { this.metrics = metrics; }
    public AIResponse getAi() { return ai; }
    public void setAi(AIResponse ai) { this.ai = ai; }
    public PromptLog getPromptLog() { return promptLog; }
    public void setPromptLog(PromptLog promptLog) { this.promptLog = promptLog; }
    public long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(long processingTimeMs) { this.processingTimeMs = processingTimeMs; }
}