package com.gobang.gobang.domain.report.entity;

import com.gobang.gobang.domain.report.model.ReportReason;
import com.gobang.gobang.domain.report.model.ReportStatus;
import com.gobang.gobang.domain.report.model.ReportTargetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true, length = 120)
    private String reporterEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 30)
    private ReportTargetType targetType;

    @Column(nullable = true, length = 100)
    private String targetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportReason reason;

    @Lob
    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status;

    private Long handledByAdminId;
    private LocalDateTime handledAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = ReportStatus.PENDING;
    }

}
