package com.bsy.aisummarizer;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class ChatController {

    private final ChatRepository chatRepository;
    private final AiService aiService;

    @PostMapping("/chat")
    public String handleChat(@RequestBody String message, @RequestHeader("X-Device-Id") String deviceId) {
        String aiReply = aiService.generateSummary(message);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUserMessage(message);
        chatMessage.setAiResponse(aiReply);
        chatMessage.setDeviceId(deviceId);
        chatRepository.save(chatMessage);

        return aiReply;
    }

    @GetMapping("/history")
    public List<ChatMessage> getChatHistory(@RequestHeader("X-Device-Id") String deviceId) {
        return chatRepository.findByDeviceId(deviceId);
    }

    @GetMapping("/history/search")
    public List<ChatMessage> searchChatHistory(@RequestParam String keyword, @RequestHeader("X-Device-Id") String deviceId) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return chatRepository.findByDeviceId(deviceId);
        }
        return chatRepository.searchByDeviceIdAndKeyword(deviceId, keyword);
    }
}