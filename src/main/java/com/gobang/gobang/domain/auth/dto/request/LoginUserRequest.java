package com.gobang.gobang.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class LoginUserRequest {
    @NotBlank
    private String userName;
    @NotBlank
    private String password;
}
