package com.gobang.gobang.domain.faq.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record FaqCategoryReorderReq(
        @NotEmpty List<IdOrderItem> items
) {}
