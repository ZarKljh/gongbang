package com.gobang.gobang.domain.auth.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SignupUserResponse {
    private final String email;
    private final String userName;
    private final String mobilePhone;
    private final String nickName;
    private final String status;
    private final String gender;
    private final LocalDateTime birth;
    private final LocalDateTime createdDate;


    public SignupUserResponse(SiteUser siteUser) {
        this.email = siteUser.getEmail();
        this.userName = siteUser.getUserName();
        this.mobilePhone = siteUser.getMobilePhone();
        this.nickName = siteUser.getNickName();
        this.status = siteUser.getStatus();
        this.gender = siteUser.getGender();
        this.birth = siteUser.getBirth();
        this.createdDate = siteUser.getCreatedDate();
    }
}
