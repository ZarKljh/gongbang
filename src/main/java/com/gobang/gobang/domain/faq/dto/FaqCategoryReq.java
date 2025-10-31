package com.gobang.gobang.domain.faq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;

public record FaqCategoryReq(
        @NotBlank String name,
        @Pattern(regexp = "^[a-z0-9-]{2,64}$") String slug,
        @PositiveOrZero Integer orderNo,
        Boolean active
) {}
