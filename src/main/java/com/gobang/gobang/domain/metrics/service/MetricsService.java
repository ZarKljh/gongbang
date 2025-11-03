// src/main/java/com/gobang/gobang/domain/metrics/service/MetricsService.java
package com.gobang.gobang.domain.metrics.service;

import com.gobang.gobang.domain.metrics.dto.MonthlyVisitorsDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MetricsService {
    // 간단한 Xorshift 기반 결정론 난수
    private static int next(int x) {
        x ^= (x << 13);
        x ^= (x >>> 17);
        x ^= (x << 5);
        return x;
    }



    // 대시보드 테스트용 임시 데이터
    public List<MonthlyVisitorsDto> getMonthlyVisitors(int year) {
        int seed = year * 1315423911; // 연도 기반 시드
        int x = seed;
        List<MonthlyVisitorsDto> out = new ArrayList<>(12);

        for (int i = 1; i <= 12; i++) {
            x = next(x);
            int noise = Math.abs(x) % 1000; // 0~999
            long base = 3000 + (i - 1) * 250; // 월 증가 트렌드
            long visitors = Math.max(0, base + noise - 500); // 대략 2500~6000
            String month = String.format("%04d-%02d", year, i);
            out.add(new MonthlyVisitorsDto(month, visitors));
        }
        return out;
    }
}
