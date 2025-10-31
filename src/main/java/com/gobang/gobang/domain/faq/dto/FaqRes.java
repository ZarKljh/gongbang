package com.gobang.gobang.domain.faq.dto;

import com.gobang.gobang.domain.faq.entity.Faq;
import java.time.Instant;
import java.util.UUID;

public record FaqRes(
        UUID id,
        UUID categoryId,
        String categoryName,
        String categorySlug,
        String question,
        String answer,
        int orderNo,
        boolean published,
        Instant createdAt,
        Instant updatedAt
) {
    public static FaqRes from(Faq f) {
        var c = f.getCategory();
        return new FaqRes(
                f.getId(),
                c.getId(),
                c.getName(),
                c.getSlug(),
                f.getQuestion(),
                f.getAnswer(),
                f.getOrderNo(),
                f.isPublished(),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }
}
