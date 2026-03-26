package com.audittool.model;

public class AuditRequest {
    private String url;

    public AuditRequest() {}
    public AuditRequest(String url) { this.url = url; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}