package com.audittool.model;

import java.util.List;

public class MetricsResponse {
    private int wordCount;
    private int h1Count;
    private int h2Count;
    private int h3Count;
    private int ctaCount;
    private int internalLinks;
    private int externalLinks;
    private int imageCount;
    private int missingAltCount;
    private double missingAltPercent;
    private String metaTitle;
    private String metaDescription;
    private List<String> ctaSamples;
    private long pageLoadMs;

    public MetricsResponse() {}

    public MetricsResponse(int wordCount, int h1Count, int h2Count, int h3Count,
                           int ctaCount, int internalLinks, int externalLinks,
                           int imageCount, int missingAltCount,
                           String metaTitle, String metaDescription,
                           List<String> ctaSamples) {
        this.wordCount = wordCount;
        this.h1Count = h1Count;
        this.h2Count = h2Count;
        this.h3Count = h3Count;
        this.ctaCount = ctaCount;
        this.internalLinks = internalLinks;
        this.externalLinks = externalLinks;
        this.imageCount = imageCount;
        this.missingAltCount = missingAltCount;
        this.missingAltPercent = imageCount > 0
                ? Math.round((missingAltCount * 100.0 / imageCount) * 10) / 10.0
                : 0.0;
        this.metaTitle = metaTitle;
        this.metaDescription = metaDescription;
        this.ctaSamples = ctaSamples;
    }

    @Override
    public String toString() {
        return String.format(
                "- Word Count: %d\n" +
                        "- H1 Tags: %d\n" +
                        "- H2 Tags: %d\n" +
                        "- H3 Tags: %d\n" +
                        "- CTAs (buttons/primary links): %d (samples: %s)\n" +
                        "- Internal Links: %d\n" +
                        "- External Links: %d\n" +
                        "- Images: %d\n" +
                        "- Images Missing Alt Text: %d (%s%%)\n" +
                        "- Meta Title: %s\n" +
                        "- Meta Description: %s\n" +
                        "- Page Load Time: %dms\n",
                wordCount, h1Count, h2Count, h3Count,
                ctaCount, ctaSamples != null ? String.join(", ", ctaSamples) : "none",
                internalLinks, externalLinks,
                imageCount, missingAltCount, missingAltPercent,
                metaTitle != null ? metaTitle : "MISSING",
                metaDescription != null ? metaDescription : "MISSING",
                pageLoadMs);
    }

    public int getWordCount() { return wordCount; }
    public void setWordCount(int wordCount) { this.wordCount = wordCount; }
    public int getH1Count() { return h1Count; }
    public void setH1Count(int h1Count) { this.h1Count = h1Count; }
    public int getH2Count() { return h2Count; }
    public void setH2Count(int h2Count) { this.h2Count = h2Count; }
    public int getH3Count() { return h3Count; }
    public void setH3Count(int h3Count) { this.h3Count = h3Count; }
    public int getCtaCount() { return ctaCount; }
    public void setCtaCount(int ctaCount) { this.ctaCount = ctaCount; }
    public int getInternalLinks() { return internalLinks; }
    public void setInternalLinks(int internalLinks) { this.internalLinks = internalLinks; }
    public int getExternalLinks() { return externalLinks; }
    public void setExternalLinks(int externalLinks) { this.externalLinks = externalLinks; }
    public int getImageCount() { return imageCount; }
    public void setImageCount(int imageCount) { this.imageCount = imageCount; }
    public int getMissingAltCount() { return missingAltCount; }
    public void setMissingAltCount(int missingAltCount) { this.missingAltCount = missingAltCount; }
    public double getMissingAltPercent() { return missingAltPercent; }
    public void setMissingAltPercent(double missingAltPercent) { this.missingAltPercent = missingAltPercent; }
    public String getMetaTitle() { return metaTitle; }
    public void setMetaTitle(String metaTitle) { this.metaTitle = metaTitle; }
    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }
    public List<String> getCtaSamples() { return ctaSamples; }
    public void setCtaSamples(List<String> ctaSamples) { this.ctaSamples = ctaSamples; }
    public long getPageLoadMs() { return pageLoadMs; }
    public void setPageLoadMs(long pageLoadMs) { this.pageLoadMs = pageLoadMs; }
}