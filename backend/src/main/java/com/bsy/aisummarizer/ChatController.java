package com.bsy.aisummarizer;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ChatController {

    private final ChatRepository chatRepository;
    private final ChatSessionRepository sessionRepository;
    private final AiService aiService;

    @PostMapping("/chat")
    public ChatMessage handleChat(@RequestBody ChatRequest request, @RequestHeader("X-Device-Id") String deviceId) {
        ChatSession session;

        if (request.getSessionId() == null) {
            session = new ChatSession();
            session.setDeviceId(deviceId);
            session.setTitle(request.getMessage().length() > 20 ? request.getMessage().substring(0, 20) + "..." : request.getMessage());
            session = sessionRepository.save(session);
        } else {
            session = sessionRepository.findById(request.getSessionId()).orElseThrow();
        }

        String aiReply = aiService.generateSummary(request);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUserMessage(request.getMessage());
        chatMessage.setAiResponse(aiReply);
        chatMessage.setDeviceId(deviceId);
        chatMessage.setSession(session);
        return chatRepository.save(chatMessage);
    }

    @GetMapping("/sessions")
    public List<ChatSession> getSessions(@RequestHeader("X-Device-Id") String deviceId) {
        return sessionRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public List<ChatMessage> getSessionMessages(@PathVariable Long sessionId) {
        return chatRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    @PatchMapping("/sessions/{sessionId}")
    public ChatSession updateSessionTitle(@PathVariable Long sessionId, @RequestBody String newTitle) {
        ChatSession session = sessionRepository.findById(sessionId).orElseThrow();
        session.setTitle(newTitle);
        return sessionRepository.save(session);
    }

    @GetMapping("/history")
    public List<ChatMessage> getChatHistory(@RequestHeader(value = "X-Device-Id", defaultValue = "unknown") String deviceId) {
        return chatRepository.findByDeviceId(deviceId);
    }

    @GetMapping("/history/search")
    public List<ChatMessage> searchChatHistory(@RequestParam String keyword, @RequestHeader(value = "X-Device-Id", defaultValue = "unknown") String deviceId) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return chatRepository.findByDeviceId(deviceId);
        }
        return chatRepository.searchByDeviceIdAndKeyword(deviceId, keyword);
    }

    @DeleteMapping("/sessions/{sessionId}")
    public void deleteSession(@PathVariable Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }
}