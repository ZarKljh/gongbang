package com.gobang.gobang.domain.review.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentModifyRequest {
    @NotBlank(message = "수정할 댓글 내용을 입력해주세요.")
    @JsonProperty("review_comment")
    private String reviewComment;
}