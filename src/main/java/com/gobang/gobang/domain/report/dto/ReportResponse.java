package com.gobang.gobang.domain.report.dto;

import com.gobang.gobang.domain.report.entity.Report;
import com.gobang.gobang.domain.report.model.ReportReason;
import com.gobang.gobang.domain.report.model.ReportStatus;
import com.gobang.gobang.domain.report.model.ReportTargetType;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        String reporterUserName,
        String reporterEmail,
        ReportTargetType targetType,
        String targetId,
        ReportReason reason,
        String description,
        ReportStatus status,
        Long handledByAdminId,
        LocalDateTime handledAt,
        LocalDateTime createdAt
) {
    public static ReportResponse from(Report r) {
        return new ReportResponse(
                r.getId(),
                r.getReporterUserName(),
                r.getReporterEmail(),
                r.getTargetType(),
                r.getTargetId(),
                r.getReason(),
                r.getDescription(),
                r.getStatus(),
                r.getHandledByAdminId(),
                r.getHandledAt(),
                r.getCreatedAt()
        );
    }
}
