package com.gobang.gobang.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SignupUserRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String confirmPassword;
    @NotBlank
    private String userName;
    @NotBlank
    private String mobilePhone;
    private String fullName;
    private String nickName;
    private String status;
    private String gender;
    private LocalDate birth;
}
