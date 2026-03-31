package com.bsy.aisummarizer;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByUserMessageContainingIgnoreCaseOrAiResponseContainingIgnoreCase(String userKeyword, String aiKeyword);
}