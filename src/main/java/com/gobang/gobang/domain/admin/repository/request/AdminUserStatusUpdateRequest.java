package com.gobang.gobang.domain.admin.repository.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminUserStatusUpdateRequest {
    private String status;

    public AdminUserStatusUpdateRequest(String status) {
        this.status = status;
    }
}
