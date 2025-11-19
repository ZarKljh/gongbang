package com.gobang.gobang.domain.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PhotoReviewResponse {
    private Long reviewId;
    private String imageUrl;
    private String content;
}
