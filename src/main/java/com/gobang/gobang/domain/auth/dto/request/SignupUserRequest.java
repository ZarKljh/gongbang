package com.gobang.gobang.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SignupUserRequest {
    @NotBlank
    private final String email;
    @NotBlank
    private final String password;
    @NotBlank
    private final String userName;
    @NotBlank
    private final String mobilePhone;
    private final String nickName;
    private final String status;
    private final String gender;
    private final LocalDateTime birth;
}
