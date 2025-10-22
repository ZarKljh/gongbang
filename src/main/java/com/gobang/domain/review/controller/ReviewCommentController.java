package com.gobang.domain.review.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews/{reviewId}/comments")
public class ReviewCommentController {

//    private final ReviewCommentService reviewCommentService;
//
//    @GetMapping
//    public ResponseEntity<List<ReviewComment>> getComments(@PathVariable Long reviewId) {
//        return ResponseEntity.ok(reviewCommentService.getCommentsByReview(reviewId));
//    }
//
//    @PostMapping
//    public ResponseEntity<?> createComment(@PathVariable Long reviewId, @RequestBody ReviewComment comment) {
//        return reviewCommentService.createComment(reviewId, comment)
//                .map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @PatchMapping("/{commentId}")
//    public ResponseEntity<?> updateComment(@PathVariable Long commentId, @RequestBody String content) {
//        return reviewCommentService.updateComment(commentId, content)
//                .map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @DeleteMapping("/{commentId}")
//    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
//        boolean deleted = reviewCommentService.deleteComment(commentId);
//        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
//    }
}