package com.gobang.gobang.domain.admin.dto;

import com.gobang.gobang.domain.auth.entity.Studio;

public record AdminShopListDto(Long id, String studioName, String studioEmail, Long categoryId,
                               String ownerUserName, String ownerEmail, String status,
                               java.time.LocalDateTime createdAt) {
    public static AdminShopListDto of(Studio s) {
        return new AdminShopListDto(
                s.getStudioId(),
                s.getStudioName(),
                s.getStudioEmail(),
                s.getCategoryId(),
                s.getSiteUser() != null ? s.getSiteUser().getUserName() : null,
                s.getSiteUser() != null ? s.getSiteUser().getEmail() : null,
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getCreatedDate()
        );
    }
}

