package com.bsy.aisummarizer;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ChatController {

    private final ChatRepository chatRepository;
    private final ChatSessionRepository sessionRepository;
    private final AiService aiService;

    @PostMapping("/chat")
    public ChatMessageResponse handleChat(@RequestBody ChatRequest request, @RequestHeader(value = "X-Device-Id", defaultValue = "unknown") String deviceId) {
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

        ChatMessage savedMessage = chatRepository.save(chatMessage);

        return ChatMessageResponse.from(savedMessage);
    }

    @GetMapping("/sessions")
    public List<ChatSessionResponse> getSessions(@RequestHeader(value = "X-Device-Id", defaultValue = "unknown") String deviceId) {
        return sessionRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId)
            .stream()
            .map(ChatSessionResponse::from)
            .collect(Collectors.toList());
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public List<ChatMessageResponse> getSessionMessages(@PathVariable Long sessionId) {
        return chatRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
            .stream()
            .map(ChatMessageResponse::from)
            .collect(Collectors.toList());
    }

    @PatchMapping("/sessions/{sessionId}")
    public ChatSessionResponse updateSessionTitle(@PathVariable Long sessionId, @RequestBody String newTitle) {
        ChatSession session = sessionRepository.findById(sessionId).orElseThrow();
        session.setTitle(newTitle);
        ChatSession updatedSession = sessionRepository.save(session);

        return ChatSessionResponse.from(updatedSession);
    }

    @DeleteMapping("/sessions/{sessionId}")
    public void deleteSession(@PathVariable Long sessionId) {
        sessionRepository.deleteById(sessionId);
    }
}