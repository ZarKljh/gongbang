package com.gobang.gobang.domain.personal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsResponse {
    private int totalPoints;
    private int totalReviews;
    private String membershipLevel;
}