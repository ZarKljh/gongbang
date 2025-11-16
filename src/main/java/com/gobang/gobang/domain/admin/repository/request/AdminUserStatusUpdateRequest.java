package com.gobang.gobang.domain.admin.repository.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AdminUserStatusUpdateRequest {
    private String status; // 예: ACTIVE / BLOCKED / DELETED 등

    public AdminUserStatusUpdateRequest(String status) {
        this.status = status;
    }
}
