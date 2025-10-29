package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReviewResponse {
    private final Review review;
}
