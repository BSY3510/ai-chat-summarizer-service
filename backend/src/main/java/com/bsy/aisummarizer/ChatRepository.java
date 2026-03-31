package com.bsy.aisummarizer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByDeviceId(String deviceId);

    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(Long sessionId);

    @Query("SELECT c FROM ChatMessage c WHERE c.deviceId = :deviceId AND " +
        "(LOWER(c.userMessage) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(c.aiResponse) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ChatMessage> searchByDeviceIdAndKeyword(@Param("deviceId") String deviceId, @Param("keyword") String keyword);
}