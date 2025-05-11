package com.lolanalytics.controller;

import com.lolanalytics.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gemini")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public String chat(@RequestBody String prompt) {
        return geminiService.chatWithGemini(prompt);
    }
} 