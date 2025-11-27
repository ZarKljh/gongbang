package com.gobang.gobang.domain.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class ReviewPopularProductResponse {
    private Long productId;
    private String name;
    private int price;
    private double rating;
    private long reviewCount;
}