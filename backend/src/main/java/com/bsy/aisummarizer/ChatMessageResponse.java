package com.bsy.aisummarizer;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class ChatMessageResponse {
    private Long id;
    private String userMessage;
    private String aiResponse;
    private LocalDateTime createdAt;
    private ChatSessionResponse session;

    public static ChatMessageResponse from(ChatMessage message) {
        ChatMessageResponse dto = new ChatMessageResponse();
        dto.setId(message.getId());
        dto.setUserMessage(message.getUserMessage());
        dto.setAiResponse(message.getAiResponse());
        dto.setCreatedAt(message.getCreatedAt());

        if (message.getSession() != null) {
            dto.setSession(ChatSessionResponse.from(message.getSession()));
        }
        return dto;
    }
}