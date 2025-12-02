package com.gobang.gobang.domain.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@AllArgsConstructor
@Setter
public class ReviewPopularProductResponse {
    private Long productId;
    private String name;
    private int price;
    private double rating;
    private long reviewCount;
    private String thumbnail;
}