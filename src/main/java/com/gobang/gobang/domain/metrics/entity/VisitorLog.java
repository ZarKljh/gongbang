package com.gobang.gobang.domain.metrics.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Entity
@Table(
        name = "visitor_log",
        indexes = {
                @Index(name = "idx_visitorlog_visited_date", columnList = "visited_date"),
                @Index(name = "idx_visitorlog_user_date", columnList = "user_id, visited_date"),
                @Index(name = "idx_visitorlog_visitor_date", columnList = "visitor_id, visited_date")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorLog {
    @Id @GeneratedValue
    private UUID id;

    @CreationTimestamp
    @Column(name = "visited_at", nullable = false, updatable = false)
    private OffsetDateTime visitedAt;

    // “하루 1회” 중복 방지 기준(UTC/서버 TZ 기준으로 계산)
    @Column(name = "visited_date", nullable = false)
    private LocalDate visitedDate;

    @Column(name = "path")
    private String path;

    @Column(name = "user_id")
    private UUID userId;

    // 비로그인 방문자 식별자(프론트에서 UUID 생성해 전달)
    @Column(name = "visitor_id", length = 64)
    private String visitorId;

    @Column(name = "referrer")
    private String referrer;

    @PrePersist
    void prePersist() {
        if (this.visitedDate == null) {
            this.visitedDate = LocalDate.now(ZoneId.of("Asia/Seoul"));
        }
    }
}
