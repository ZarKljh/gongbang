package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class SiteUserResponse {
    private Long id;
    private String userName;
    private String email;
    private String mobilePhone;
    private String nickName;
    private String status;
    private String gender;
    private String profileImg;
    private LocalDateTime birth;

    public SiteUserResponse(SiteUser siteUser) {
        this.id = siteUser.getId();
        this.userName = siteUser.getUserName();
        this.email = siteUser.getEmail();
        this.mobilePhone = siteUser.getMobilePhone();
        this.nickName = siteUser.getNickName();
        this.status = siteUser.getStatus();
        this.gender = siteUser.getGender();
        this.profileImg = siteUser.getProfileImg();
        this.birth = siteUser.getBirth();
    }
}
