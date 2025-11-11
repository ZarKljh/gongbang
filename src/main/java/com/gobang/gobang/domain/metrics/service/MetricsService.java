package com.gobang.gobang.domain.metrics.service;

import com.gobang.gobang.domain.admin.dto.AdminMetricsDtos.MonthlyPoint;
import com.gobang.gobang.domain.metrics.repository.VisitorLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MetricsService {
    private final VisitorLogRepository visitorLogRepository;

    public List<MonthlyPoint> monthlyVisitors(int year) {
        var raw = visitorLogRepository.countMonthlyByYear(year); // [ [m, cnt], ... ]
        long[] buckets = new long[12];
        for (Object[] r : raw) {
            int m = ((Number) r[0]).intValue();   // 1~12
            long c = ((Number) r[1]).longValue();
            if (m >= 1 && m <= 12) buckets[m - 1] = c;
        }
        List<MonthlyPoint> out = new ArrayList<>(12);
        for (int i = 1; i <= 12; i++) {
            out.add(new MonthlyPoint(String.format("%d-%02d", year, i), buckets[i - 1]));
        }
        return out;
    }
}
