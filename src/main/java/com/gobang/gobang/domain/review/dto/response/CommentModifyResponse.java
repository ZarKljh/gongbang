package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.ReviewComment;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentModifyResponse {
    private Long userId;
    private Long commentId;
    private String reviewComment;
    private String modifiedBy;
    private LocalDateTime modifiedDate;

    public CommentModifyResponse(ReviewComment comment) {
        this.userId = (comment.getSiteUser().getId());
        this.commentId = comment.getCommentId();
        this.reviewComment = comment.getReviewComment();
        this.modifiedBy = comment.getUpdatedBy();
        this.modifiedDate = comment.getModifiedDate();
    }
}
