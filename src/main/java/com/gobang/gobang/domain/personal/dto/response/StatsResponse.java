package com.gobang.gobang.domain.personal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsResponse {
    private Long totalPoints;
    private Long totalReviews;
    private String membershipLevel;
}