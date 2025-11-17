package com.gobang.gobang.domain.admin.dto;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;

import java.time.LocalDateTime;

public record AdminRecentShopDto(
        Long id,
        String studioName,
        String studioEmail,
        Long categoryId,
        String status,
        LocalDateTime createdAt
) {
    public static AdminRecentShopDto of(Studio s) {
        return new AdminRecentShopDto(
                s.getStudioId(),
                s.getStudioName(),
                s.getStudioEmail(),
                s.getCategoryId(),
                s.getStatus() != null ? s.getStatus().name() : "PENDING",
                s.getCreatedDate()
        );
    }
}

