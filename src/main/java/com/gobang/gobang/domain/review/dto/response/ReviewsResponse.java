package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
@Builder
public class ReviewsResponse {
    private final List<ReviewResponse> reviews;
    private final int currentPage;
    private final int totalPages;
    private final long totalElements;

    public static ReviewsResponse fromPage(Page<Review> page) {
        List<ReviewResponse> reviewResponses = page.getContent()
                .stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());

        return new ReviewsResponse(
                reviewResponses,
                page.getNumber(),
                page.getTotalPages(),
                page.getTotalElements()
        );
    }
}

