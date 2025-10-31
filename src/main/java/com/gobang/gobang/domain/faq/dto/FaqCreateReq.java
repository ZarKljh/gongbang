package com.gobang.gobang.domain.faq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

public record FaqCreateReq(
        @NotNull UUID categoryId,
        @NotBlank String question,
        @NotBlank String answer,
        @PositiveOrZero Integer orderNo,
        Boolean published
) {}
