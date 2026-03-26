package com.audittool.service;

import com.audittool.model.MetricsResponse;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
public class MetricsService {

    private static final String[] CTA_KEYWORDS = {
            "get started", "contact", "book", "schedule", "request", "demo",
            "free", "sign up", "signup", "register", "subscribe", "download",
            "try", "start", "buy", "order", "shop", "learn more", "get a quote",
            "talk to us", "hire", "apply", "join", "access"
    };

    public MetricsResponse extractMetrics(Document doc, String baseUrl) {

        String bodyText = doc.body() != null ? doc.body().text() : "";
        int wordCount = bodyText.isBlank() ? 0 : bodyText.trim().split("\\s+").length;

        int h1 = doc.select("h1").size();
        int h2 = doc.select("h2").size();
        int h3 = doc.select("h3").size();

        Elements images = doc.select("img");
        int imageCount = images.size();
        int missingAlt = 0;
        for (Element img : images) {
            String alt = img.attr("alt").trim();
            if (alt.isEmpty()) missingAlt++;
        }

        String baseDomain = extractDomain(baseUrl);
        Elements allLinks = doc.select("a[href]");
        int internalLinks = 0;
        int externalLinks = 0;

        for (Element link : allLinks) {
            String href = link.attr("abs:href");
            if (href.isBlank() || href.startsWith("mailto:") || href.startsWith("tel:")) {
                internalLinks++;
            } else {
                String linkDomain = extractDomain(href);
                if (linkDomain.equalsIgnoreCase(baseDomain)) {
                    internalLinks++;
                } else {
                    externalLinks++;
                }
            }
        }

        Elements buttons = doc.select("button, [role='button'], input[type='submit'], input[type='button']");
        int ctaCount = buttons.size();
        List<String> ctaSamples = new ArrayList<>();

        for (Element btn : buttons) {
            String text = btn.text().trim();
            if (!text.isBlank() && ctaSamples.size() < 5) {
                ctaSamples.add(text);
            }
        }

        for (Element link : allLinks) {
            String text = link.text().toLowerCase().trim();
            for (String keyword : CTA_KEYWORDS) {
                if (text.contains(keyword)) {
                    ctaCount++;
                    if (ctaSamples.size() < 5 && !link.text().isBlank()) {
                        ctaSamples.add(link.text().trim());
                    }
                    break;
                }
            }
        }

        String metaTitle = doc.title();
        if (metaTitle == null || metaTitle.isBlank()) {
            metaTitle = null;
        }

        String metaDesc = null;
        Element metaDescEl = doc.selectFirst("meta[name=description]");
        if (metaDescEl != null) {
            metaDesc = metaDescEl.attr("content").trim();
            if (metaDesc.isBlank()) metaDesc = null;
        }

        return new MetricsResponse(
                wordCount, h1, h2, h3,
                ctaCount, internalLinks, externalLinks,
                imageCount, missingAlt,
                metaTitle, metaDesc,
                ctaSamples
        );
    }

    private String extractDomain(String url) {
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            if (host == null) return "";
            return host.startsWith("www.") ? host.substring(4) : host;
        } catch (Exception e) {
            return "";
        }
    }
}