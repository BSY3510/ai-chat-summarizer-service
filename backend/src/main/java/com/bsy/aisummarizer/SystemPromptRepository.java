package com.bsy.aisummarizer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SystemPromptRepository extends JpaRepository<SystemPrompt, Long> {
    Optional<SystemPrompt> findByIsActiveTrue();
}