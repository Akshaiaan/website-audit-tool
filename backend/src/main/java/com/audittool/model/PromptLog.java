package com.audittool.model;

public class PromptLog {
    private String systemPrompt;
    private String userPrompt;
    private String inputData;
    private String rawOutput;
    private String model;
    private int inputTokensEstimate;

    public PromptLog() {}

    public PromptLog(String systemPrompt, String userPrompt, String inputData,
                     String rawOutput, String model) {
        this.systemPrompt = systemPrompt;
        this.userPrompt = userPrompt;
        this.inputData = inputData;
        this.rawOutput = rawOutput;
        this.model = model;
        this.inputTokensEstimate = (systemPrompt.length() + userPrompt.length()) / 4;
    }

    public String getSystemPrompt() { return systemPrompt; }
    public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }
    public String getUserPrompt() { return userPrompt; }
    public void setUserPrompt(String userPrompt) { this.userPrompt = userPrompt; }
    public String getInputData() { return inputData; }
    public void setInputData(String inputData) { this.inputData = inputData; }
    public String getRawOutput() { return rawOutput; }
    public void setRawOutput(String rawOutput) { this.rawOutput = rawOutput; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public int getInputTokensEstimate() { return inputTokensEstimate; }
    public void setInputTokensEstimate(int inputTokensEstimate) { this.inputTokensEstimate = inputTokensEstimate; }
}
