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

    @Column(name = "path")
    private String path;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "referrer")
    private String referrer;
}
