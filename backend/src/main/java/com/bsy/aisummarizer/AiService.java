package com.bsy.aisummarizer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${ai.api.key}")
    private String apiKey;

    private final SystemPromptRepository promptRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void initDefaultPrompt() {
        if (promptRepository.findByIsActiveTrue().isEmpty()) {
            SystemPrompt defaultPrompt = new SystemPrompt();
            defaultPrompt.setPromptContent("너는 친절하고 명확하게 답변하는 미니 챗봇이자 텍스트 요약 전문가야. 사용자의 질문에 답하거나, 긴 글이 주어지면 핵심을 마크다운 형식으로 요약해줘.");
            defaultPrompt.setActive(true);
            defaultPrompt.setDescription("기본 시스템 프롬프트 v1");
            promptRepository.save(defaultPrompt);
        }
    }

    public String generateSummary(ChatRequest request) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        SystemPrompt activePrompt = promptRepository.findByIsActiveTrue()
            .orElseThrow(() -> new RuntimeException("활성화된 시스템 프롬프트가 없습니다."));

        Map<String, Object> systemInstruction = Map.of(
            "parts", List.of(Map.of("text", activePrompt.getPromptContent()))
        );

        List<Map<String, Object>> contents = new ArrayList<>();

        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            for (ChatRequest.MessageLog log : request.getHistory()) {
                String role = log.getSender().equals("user") ? "user" : "model";
                contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", log.getMessage()))
                ));
            }
        }

        contents.add(Map.of(
            "role", "user",
            "parts", List.of(Map.of("text", request.getMessage()))
        ));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("systemInstruction", systemInstruction);
        requestBody.put("contents", contents);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);

        try {
            String response = restTemplate.postForObject(url, httpEntity, String.class);
            JsonNode rootNode = objectMapper.readTree(response);
            return rootNode.path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "AI 서버와 통신 중 오류가 발생했습니다.";
        }
    }
}