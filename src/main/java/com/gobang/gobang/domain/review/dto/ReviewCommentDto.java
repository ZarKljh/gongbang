package com.gobang.gobang.domain.review.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewComment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class ReviewCommentDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "리뷰 ID는 필수입니다.")
        @JsonProperty("review_id")
        private Long reviewId;

        @NotBlank(message = "댓글 내용을 입력해주세요.")
        @JsonProperty("review_comment")
        private String reviewComment;
    }

//    @Getter
//    @Setter
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class UpdateRequest {
//        @NotBlank(message = "수정할 내용을 입력해주세요.")
//        private String content;
//    }

    @Getter
    @AllArgsConstructor
    public static class Response {
        private Long commentId;
        private String content;
        private String createdBy;
        private Long reviewId;

        public Response(ReviewComment comment) {
            this.commentId = comment.getCommentId();
            this.content = comment.getReviewComment();
            this.createdBy = comment.getCreatedBy();
            this.reviewId = comment.getReview() != null ? comment.getReview().getReviewId() : null; // ✅ 핵심
        }
    }
}
