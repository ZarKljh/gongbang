package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@AllArgsConstructor
public class ReviewsResponse {
    private final List<Review> reviews;
    private final int currentPage;
    private final int totalPages;
    private final long totalElements;

    public ReviewsResponse(Page<Review> page) {
        this.reviews = page.getContent();
        this.currentPage = page.getNumber();
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
    }
}

