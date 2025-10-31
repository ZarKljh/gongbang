package com.gobang.gobang.domain.faq.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.UUID;

public record IdOrderItem(
        @NotNull UUID id,
        @PositiveOrZero int orderNo
) {}
