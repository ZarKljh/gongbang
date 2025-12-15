package com.gobang.gobang.domain.personal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsResponse {
    private long totalQna;
    private long totalReviews;
    private long preparing;
    private long shipping;
    private long completed;
}