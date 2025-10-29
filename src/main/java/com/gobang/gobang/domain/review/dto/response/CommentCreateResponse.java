package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.ReviewComment;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentCreateResponse {
    private Long commentId;
    private String content;
    private String createdBy;
    private Long reviewId;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    public CommentCreateResponse(ReviewComment comment) {
        this.commentId = comment.getCommentId();
        this.content = comment.getReviewComment();
        this.createdBy = comment.getCreatedBy();
        this.reviewId = comment.getReview() != null ? comment.getReview().getReviewId() : null; // ✅ 핵심
        this.createdDate = comment.getCreatedDate();
        this.modifiedDate = comment.getModifiedDate();
    }
}