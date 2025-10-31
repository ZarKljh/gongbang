package com.gobang.gobang.domain.report.dto;

import com.gobang.gobang.domain.report.model.ReportReason;
import com.gobang.gobang.domain.report.model.ReportTargetType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReportRequest {

    @Email
    private String reporterEmail;

    @NotNull
    private ReportTargetType targetType;

    private String targetId;

    @NotNull
    private ReportReason reason;

    @NotBlank
    private String description;
}
