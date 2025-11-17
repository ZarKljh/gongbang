package com.gobang.gobang.domain.admin.dto;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;

import java.time.LocalDateTime;

public record AdminUserDetailDto(
        Long id,
        String userName,
        String fullName,
        String email,
        String mobilePhone,
        String nickName,
        RoleType role,
        String status,
        String gender,
        LocalDateTime birth,
        LocalDateTime createdDate,
        LocalDateTime updatedDate,
        int studioCount,
        int orderCount
) {
    public static AdminUserDetailDto of(SiteUser u) {
        return new AdminUserDetailDto(
                u.getId(),
                u.getUserName(),
                u.getFullName(),
                u.getEmail(),
                u.getMobilePhone(),
                u.getNickName(),
                u.getRole(),
                u.getStatus(),
                u.getGender(),
                u.getBirth(),
                u.getCreatedDate(),
                u.getUpdatedDate(),
                u.getStudioList() != null ? u.getStudioList().size() : 0,
                u.getOrders() != null ? u.getOrders().size() : 0
        );
    }
}
