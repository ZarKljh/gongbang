package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ReviewsResponse {
    private final List<Review> reviews;
}

