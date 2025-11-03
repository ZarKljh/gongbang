package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.ReviewComment;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentCreateResponse {
    private Long commentId;
    private String reviewComment;
    private String createdBy;
    private String updatedBy;
    private Long reviewId;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    public CommentCreateResponse(ReviewComment comment) {
        this.commentId = comment.getCommentId();
        this.reviewComment = comment.getReviewComment();
        this.createdBy = comment.getCreatedBy();
        this.updatedBy = comment.getUpdatedBy();
        this.reviewId = comment.getReview() != null ? comment.getReview().getReviewId() : null; // ✅ 핵심
        this.createdDate = comment.getCreatedDate();
        this.modifiedDate = comment.getModifiedDate();
    }
}