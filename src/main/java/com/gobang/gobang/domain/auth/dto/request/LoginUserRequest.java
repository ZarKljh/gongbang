package com.gobang.gobang.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class LoginUserRequest {
    @NotBlank
    @Size(min = 4, max = 20, message = "아이디는 4~20자 이내여야 합니다.")
    private String userName;
    @NotBlank
    @Size(min = 4, max = 100, message = "비밀번호는 4자 이상이어야 합니다.")
    private String password;
}
