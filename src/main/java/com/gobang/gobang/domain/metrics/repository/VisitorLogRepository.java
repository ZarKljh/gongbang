package com.gobang.gobang.domain.metrics.repository;

import com.gobang.gobang.domain.metrics.entity.VisitorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface VisitorLogRepository extends JpaRepository<VisitorLog, UUID> {

    boolean existsByUserIdAndVisitedDate(UUID userId, LocalDate visitedDate);
    boolean existsByVisitorIdAndVisitedDate(String visitorId, LocalDate visitedDate);

    /** 지정 연도의 월별 방문 수 집계 (1~12) */
    @Query("""
        select extract(month from v.visitedAt) as m,
               count(v.id) as cnt
        from VisitorLog v
        where extract(year from v.visitedAt) = :year
        group by extract(month from v.visitedAt)
        order by m
    """)
    List<Object[]> countMonthlyByYear(int year);
}
