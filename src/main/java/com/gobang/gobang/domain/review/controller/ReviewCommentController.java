package com.gobang.gobang.domain.review.controller;

import com.gobang.gobang.domain.review.dto.request.CommentCreateRequest;
import com.gobang.gobang.domain.review.dto.response.CommentCreateResponse;
import com.gobang.gobang.domain.review.dto.response.CommentResponse;
import com.gobang.gobang.domain.review.entity.ReviewComment;
import com.gobang.gobang.domain.review.service.ReviewCommentService;
import com.gobang.gobang.global.RsData.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews")
public class ReviewCommentController {

    private final ReviewCommentService reviewCommentService;

    // ✅ 댓글 등록
    @PostMapping("/{reviewId}/comments")
    public RsData<CommentCreateResponse> createComment(
            @PathVariable Long reviewId,
            @Valid @RequestBody CommentCreateRequest createRequest
    ) {
        return reviewCommentService.createComment(createRequest)
                .map(comment -> RsData.of("200", "댓글 등록 성공", new CommentCreateResponse(comment)))
                .orElseGet(() -> RsData.of("404", "리뷰를 찾을 수 없습니다."));
    }

//    @GetMapping("/{reviewId}/comments")
//    public RsData<?> getComments(@PathVariable Long reviewId) {
//        List<ReviewComment> comments = reviewCommentService.findByReviewId(reviewId);
//
//        List<CommentResponse> result = comments.stream()
//                .map(c -> new CommentResponse(c.getCommentId(), c.getContent(), c.getCreatedBy()))
//                .toList();
//
//        return RsData.of("200", "성공", result);
//    }

    @GetMapping("/{reviewId}/comments")
    public RsData<CommentResponse> getComments(@PathVariable Long reviewId) {
        return reviewCommentService.getCommentByReviewId(reviewId)
                .map(comment -> RsData.of("200", "댓글 조회 성공", new CommentResponse(comment)))
                .orElseGet(() -> RsData.of("404", "댓글이 존재하지 않습니다."));
    }

    // ✅ 댓글 수정
//    @PatchMapping("/{commentId}")
//    public RsData<ReviewCommentDto.Response> updateComment(
//            @PathVariable Long commentId,
//            @Valid @RequestBody ReviewCommentDto.UpdateRequest updateRequest
//    ) {
//        return reviewCommentService.updateComment(commentId, updateRequest.getContent())
//                .map(comment -> RsData.of("200", "댓글 수정 성공", new ReviewCommentDto.Response(comment)))
//                .orElseGet(() -> RsData.of("404", "댓글을 찾을 수 없습니다."));
//    }
//
//    // ✅ 댓글 삭제
//    @DeleteMapping("/{commentId}")
//    public RsData<?> deleteComment(@PathVariable Long commentId) {
//        boolean deleted = reviewCommentService.deleteComment(commentId);
//        return deleted
//                ? RsData.of("200", "댓글 삭제 성공")
//                : RsData.of("404", "댓글을 찾을 수 없습니다.");
//    }
}