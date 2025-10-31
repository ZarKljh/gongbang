package com.gobang.gobang.domain.metrics.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyVisitorsDto {
    private String month; // 월
    private long visitors; // 방문자 수
}
