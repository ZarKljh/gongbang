package com.gobang.gobang.domain.auth.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class LoginUserResponse {
    private String email;
    private String userName;
    private String mobilePhone;
    private String nickName;
    private String status;
    private String gender;
    private String role;
    private LocalDateTime birth;
    private LocalDateTime createdDate;


    public LoginUserResponse(SiteUser siteUser) {
        this.email = siteUser.getEmail();
        this.userName = siteUser.getUserName();
        this.mobilePhone = siteUser.getMobilePhone();
        this.nickName = siteUser.getNickName();
        this.status = siteUser.getStatus();
        this.gender = siteUser.getGender();
        this.birth = siteUser.getBirth();
        this.role = siteUser.getRole().name();
        this.createdDate = siteUser.getCreatedDate();
    }
}
