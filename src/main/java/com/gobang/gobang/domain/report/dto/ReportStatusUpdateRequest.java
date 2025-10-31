package com.gobang.gobang.domain.report.dto;

import com.gobang.gobang.domain.report.model.ReportStatus;
import jakarta.validation.constraints.NotNull;

public record ReportStatusUpdateRequest(
        @NotNull ReportStatus status,
        Long handledByAdminId,
        String note // 필요 시 확장(지금은 사용 안함)
) {}
