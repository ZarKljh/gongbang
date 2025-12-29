package com.gobang.gobang.domain.metrics.service;

import com.gobang.gobang.domain.metrics.dto.RecordVisitRequest;
import com.gobang.gobang.domain.metrics.entity.VisitorLog;
import com.gobang.gobang.domain.metrics.repository.VisitorLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VisitRecordService {

    private final VisitorLogRepository visitorLogRepository;
    private final Clock clock;

    @Transactional
    public void recordDailyUniqueVisit(RecordVisitRequest req) {
        LocalDate today = LocalDate.now(clock);

        UUID userId = req.userId();
        String visitorId = normalize(req.visitorId());

        // 로그인: userId + date
        if (userId != null) {
            if (visitorLogRepository.existsByUserIdAndVisitedDate(userId, today)) return;

            visitorLogRepository.save(VisitorLog.builder()
                    .visitedDate(today)
                    .path(req.path())
                    .referrer(req.referrer())
                    .userId(userId)
                    .visitorId(null)
                    .build());
            return;
        }

        // 비로그인: visitorId + date
        if (visitorId == null) return;
        if (visitorLogRepository.existsByVisitorIdAndVisitedDate(visitorId, today)) return;

        visitorLogRepository.save(VisitorLog.builder()
                .visitedDate(today)
                .path(req.path())
                .referrer(req.referrer())
                .userId(null)
                .visitorId(visitorId)
                .build());
    }

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }


}
