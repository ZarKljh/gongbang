package com.gobang.gobang.domain.review.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentCreateRequest {

    @NotNull(message = "리뷰 ID는 필수입니다.")
    @JsonProperty("review_id")
    private Long reviewId;

    @NotBlank(message = "댓글 내용을 입력해주세요.")
    @JsonProperty("review_comment")
    private String reviewComment;

    /// 나중에 옮길것
//    @Getter
//    @Setter
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class UpdateRequest {
//        @NotBlank(message = "수정할 내용을 입력해주세요.")
//        private String content;
//    }


}