package com.gobang.gobang.domain.faq.dto;

import com.gobang.gobang.domain.faq.entity.FaqCategory;
import java.time.Instant;
import java.util.UUID;

public record FaqCategoryRes(
        UUID id,
        String name,
        String slug,
        int orderNo,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static FaqCategoryRes from(FaqCategory c) {
        return new FaqCategoryRes(
                c.getId(), c.getName(), c.getSlug(), c.getOrderNo(), c.isActive(),
                c.getCreatedAt(), c.getUpdatedAt()
        );
    }
}
