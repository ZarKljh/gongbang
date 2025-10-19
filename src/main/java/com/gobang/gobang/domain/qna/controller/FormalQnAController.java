package com.gobang.gobang.domain.qna.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/formal-qna")
public class FormalQnAController {

    // 문의 등록 API (양식형)
    @PostMapping("")
    public ResponseEntity<String> createFormalQuestion(/* DTO for question data */) {
        // TODO: Implement question creation logic
        return ResponseEntity.ok("Formal question created successfully.");
    }

    // 특정 문의 조회 API (양식형)
    @GetMapping("/{questionId}")
    public ResponseEntity<String> getFormalQuestion(@PathVariable Long questionId) {
        // TODO: Implement question retrieval logic
        return ResponseEntity.ok("Returning formal question with ID: " + questionId);
    }

    // 문의에 대한 답변 등록 API
    @PostMapping("/{questionId}/answers")
    public ResponseEntity<String> createFormalAnswer(@PathVariable Long questionId /*, DTO for answer data */) {
        // TODO: Implement answer creation logic
        return ResponseEntity.ok("Answer for formal question " + questionId + " created successfully.");
    }
}