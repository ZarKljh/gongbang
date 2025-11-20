package com.gobang.gobang.domain.auth.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SignupUserResponse {
    private Long id;
    private String email;
    private String userName;
    private String fullName;
    private String mobilePhone;
    private String nickName;
    private String status;
    private String gender;
    private LocalDateTime birth;
    private LocalDateTime createdDate;


    public SignupUserResponse(SiteUser siteUser) {
        this.id = siteUser.getId();
        this.email = siteUser.getEmail();
        this.userName = siteUser.getUserName();
        this.fullName = siteUser.getFullName();
        this.mobilePhone = siteUser.getMobilePhone();
        this.nickName = siteUser.getNickName();
        this.status = siteUser.getStatus();
        this.gender = siteUser.getGender();
        this.birth = siteUser.getBirth();
        this.createdDate = siteUser.getCreatedDate();
    }
}
