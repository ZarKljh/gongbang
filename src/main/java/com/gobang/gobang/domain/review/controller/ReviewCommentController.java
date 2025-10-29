package com.gobang.gobang.domain.review.controller;

import com.gobang.gobang.domain.review.dto.request.CommentCreateRequest;
import com.gobang.gobang.domain.review.dto.response.CommentCreateResponse;
import com.gobang.gobang.domain.review.service.ReviewCommentService;
import com.gobang.gobang.global.RsData.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews/comments")
public class ReviewCommentController {

    private final ReviewCommentService reviewCommentService;

    // ✅ 댓글 등록
    @PostMapping("")
    public RsData<CommentCreateResponse> createComment(
            @Valid @RequestBody CommentCreateRequest createRequest
    ) {
        return reviewCommentService.createComment(createRequest)
                .map(comment -> RsData.of("200", "댓글 등록 성공", new CommentCreateResponse(comment)))
                .orElseGet(() -> RsData.of("404", "리뷰를 찾을 수 없습니다."));
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