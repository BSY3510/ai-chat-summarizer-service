package com.bsy.aisummarizer;

import java.util.List;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatRepository chatRepository;
    private final AiService aiService;

    @PostMapping("/chat")
    public String handleChat(@RequestBody String message) {
        String aiReply = aiService.generateSummary(message);

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUserMessage(message);
        chatMessage.setAiResponse(aiReply);
        chatRepository.save(chatMessage);

        return aiReply;
    }

    @GetMapping("/history")
    public List<ChatMessage> getChatHistory() {
        return chatRepository.findAll();
    }

    @GetMapping("/history/search")
    public List<ChatMessage> searchChatHistory(@RequestParam String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return chatRepository.findAll();
        }
        return chatRepository.findByUserMessageContainingIgnoreCaseOrAiResponseContainingIgnoreCase(keyword, keyword);
    }
}