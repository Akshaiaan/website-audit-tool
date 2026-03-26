package com.audittool.model;

import java.util.List;

public class AIResponse {
    private String seoAnalysis;
    private String messagingClarity;
    private String ctaAnalysis;
    private String contentDepth;
    private String uxConcerns;
    private List<Recommendation> recommendations;
    private String rawOutput;

    public AIResponse() {}

    public static class Recommendation {
        private int priority;
        private String title;
        private String reasoning;
        private String action;

        public Recommendation() {}
        public Recommendation(int priority, String title, String reasoning, String action) {
            this.priority = priority;
            this.title = title;
            this.reasoning = reasoning;
            this.action = action;
        }

        public int getPriority() { return priority; }
        public void setPriority(int priority) { this.priority = priority; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getReasoning() { return reasoning; }
        public void setReasoning(String reasoning) { this.reasoning = reasoning; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
    }

    public String getSeoAnalysis() { return seoAnalysis; }
    public void setSeoAnalysis(String seoAnalysis) { this.seoAnalysis = seoAnalysis; }
    public String getMessagingClarity() { return messagingClarity; }
    public void setMessagingClarity(String messagingClarity) { this.messagingClarity = messagingClarity; }
    public String getCtaAnalysis() { return ctaAnalysis; }
    public void setCtaAnalysis(String ctaAnalysis) { this.ctaAnalysis = ctaAnalysis; }
    public String getContentDepth() { return contentDepth; }
    public void setContentDepth(String contentDepth) { this.contentDepth = contentDepth; }
    public String getUxConcerns() { return uxConcerns; }
    public void setUxConcerns(String uxConcerns) { this.uxConcerns = uxConcerns; }
    public List<Recommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<Recommendation> recommendations) { this.recommendations = recommendations; }
    public String getRawOutput() { return rawOutput; }
    public void setRawOutput(String rawOutput) { this.rawOutput = rawOutput; }
}