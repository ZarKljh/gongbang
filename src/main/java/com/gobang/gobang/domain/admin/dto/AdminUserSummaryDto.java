package com.gobang.gobang.domain.admin.dto;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AdminUserSummaryDto {

    private Long id;
    private String userName;
    private String email;
    private String role;
    private String status;
    private LocalDateTime createdDate;

    public static AdminUserSummaryDto of(SiteUser u) {
        return new AdminUserSummaryDto(
                u.getId(),
                u.getUserName(),
                u.getEmail(),
                u.getRole() != null ? u.getRole().name() : null,
                u.getStatus(),
                u.getCreatedDate()
        );
    }
}
