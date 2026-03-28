package com.bsy.aisummarizer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${ai.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateSummary(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String systemInstruction = "너는 친절하고 명확하게 답변하는 미니 챗봇이자 텍스트 요약 전문가야. 사용자의 질문에 답하거나, 긴 글이 주어지면 핵심만 요약해줘.\n\n사용자 입력: ";
        String fullPrompt = systemInstruction + prompt;

        Map<String, Object> part = new HashMap<>();
        part.put("text", fullPrompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            String response = restTemplate.postForObject(url, request, String.class);

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
            return "AI 서버와 통신 중 오류가 발생했습니다. (API Key나 네트워크를 확인해주세요)";
        }
    }
}