package com.bsy.aisummarizer;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatRepository chatRepository;

    @PostMapping("/chat")
    public String handleChat(@RequestBody String message) {
        // 실제 AI 연동 전, 통신 확인을 위한 더미(Dummy) 로직
        String aiReply = "AI 봇 응답: [" + message + "]에 대한 분석을 시작합니다.";

        // DB 저장 테스트
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUserMessage(message);
        chatMessage.setAiResponse(aiReply);
        chatRepository.save(chatMessage);

        return aiReply;
    }
}