package com.gobang.gobang.domain.review.controller;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.review.dto.request.CommentCreateRequest;
import com.gobang.gobang.domain.review.dto.request.CommentModifyRequest;
import com.gobang.gobang.domain.review.dto.request.ReviewModifyRequest;
import com.gobang.gobang.domain.review.dto.response.*;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewComment;
import com.gobang.gobang.domain.review.service.ReviewCommentService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.rq.Rq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reviews")
public class ReviewCommentController {

    private final ReviewCommentService reviewCommentService;
    private final Rq rq;

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
    @PatchMapping("/{reviewId}/comments/{commentId}")
    public RsData<CommentModifyResponse> modifyComment(
            @PathVariable Long reviewId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentModifyRequest req
    ) {
        Optional<ReviewComment> optComment = reviewCommentService.findByCommentId(commentId);

        if (optComment.isEmpty()) {
            return RsData.of("404", "%d번 댓글이 존재하지 않습니다.".formatted(commentId));
        }

        // ✅ 수정 권한 체크 (작성자 본인만 수정 가능)
        SiteUser currentUser = rq.getSiteUser();
        ReviewComment comment = optComment.get();
        if (currentUser == null || !comment.getCreatedBy().equals(currentUser.getUserName())) {
            return RsData.of("403", "수정 권한이 없습니다.");
        }

        // ✅ 실제 수정 처리
        RsData<ReviewComment> modifyRs = reviewCommentService.modifyComment(comment, req.getReviewComment());

        return RsData.of(
                modifyRs.getResultCode(),
                modifyRs.getMsg(),
                new CommentModifyResponse(modifyRs.getData())
        );
    }

    // 댓글 삭제
    @DeleteMapping("/{reviewId}/comments/{commentId}")
    public RsData<?> deleteComment(
            @PathVariable Long reviewId,
            @PathVariable Long commentId
    ) {
        SiteUser currentUser = rq.getSiteUser();
        if (currentUser == null) {
            return RsData.of("401", "로그인이 필요합니다.");
        }

        // ✅ 현재 사용자 역할이 SELLER인지 확인
        if (currentUser.getRole() != RoleType.SELLER) {
            return RsData.of("403", "댓글 삭제 권한이 없습니다. (SELLER만 가능)");
        }

        RsData<Void> deleteRs = reviewCommentService.deleteComment(reviewId, commentId);
        return RsData.of(deleteRs.getResultCode(), deleteRs.getMsg());
    }
}