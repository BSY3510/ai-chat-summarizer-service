package com.bsy.aisummarizer;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter @Setter
public class ChatRequest {
    private String message;
    private List<MessageLog> history;
    private Long sessionId;

    @Getter @Setter
    public static class MessageLog {
        private String sender;
        private String message;
    }
}