package com.gobang.gobang.domain.metrics.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "visitor_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VisitorLog {
    @Id @GeneratedValue
    private UUID id;


    @CreationTimestamp
    @Column(name = "visited_at", nullable = false)
    private OffsetDateTime visitedAt;

    /** 선택: 페이지 경로 */
    @Column(name = "path")
    private String path;

    /** 선택: 사용자 식별 (로그인 사용 시) */
    @Column(name = "user_id")
    private UUID userId;

    /** 선택: referrer, UA 등 추후 확장 */
    @Column(name = "referrer")
    private String referrer;
}
