package com.gobang.gobang.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SignupUserRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String userName;
    @NotBlank
    private String mobilePhone;
    private String nickName;
    private String status;
    private String gender;
    private LocalDateTime birth;
}
