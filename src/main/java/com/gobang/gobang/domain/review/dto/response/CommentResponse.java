package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.ReviewComment;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Optional;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {
    private Long userId;
    private Long commentId;
    private String reviewComment;
    private String createdBy;
    private Long reviewId;

    public CommentResponse(ReviewComment comment) {
        this.userId = (comment.getSiteUser().getId());
        this.commentId = comment.getCommentId();
        this.reviewComment = comment.getReviewComment();
        this.createdBy = comment.getCreatedBy();
        this.reviewId = comment.getReview() != null ? comment.getReview().getReviewId() : null;
    }
}