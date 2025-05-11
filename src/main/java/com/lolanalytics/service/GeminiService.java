package com.lolanalytics.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=%s";

    public String chatWithGemini(String prompt) {
        RestTemplate restTemplate = new RestTemplate();
        String url = String.format(GEMINI_URL, geminiApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));
        contents.add(content);
        requestBody.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            System.out.println("Gemini API error: " + response.getBody());
        }

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> message = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) message.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            } catch (Exception e) {
                return "Error parsing Gemini response: " + e.getMessage();
            }
        }
        return "No response from Gemini AI.";
    }
} 