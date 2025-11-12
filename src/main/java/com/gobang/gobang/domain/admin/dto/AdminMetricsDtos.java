package com.gobang.gobang.domain.admin.dto;

public class AdminMetricsDtos {
    public record MonthlyPoint(String month, long visitors) {}
}
