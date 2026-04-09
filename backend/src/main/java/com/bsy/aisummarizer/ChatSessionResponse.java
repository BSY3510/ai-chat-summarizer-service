package com.bsy.aisummarizer;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter @Setter
public class ChatSessionResponse {
    private Long id;
    private String title;
    private LocalDateTime createdAt;

    public static ChatSessionResponse from(ChatSession session) {
        ChatSessionResponse dto = new ChatSessionResponse();
        dto.setId(session.getId());
        dto.setTitle(session.getTitle());
        dto.setCreatedAt(session.getCreatedAt());
        return dto;
    }
}