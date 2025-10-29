package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class StudioResponse {
    private String email;
    private String userName;
    private String gender;
    private LocalDateTime birth;
    private String nickName;
    private String mobilePhone;
    private Long categoryId;
    private String studioName;
    private String studioDescription;
    private String studioMobile;
    private String studioOfficeTell;
    private String studioFax;
    private String studioEmail;
    private String studioBusinessNumber;
    private String studioAddPostNumber;
    private String studioAddMain;
    private String studioAddDetail;
    //private List<Studio> studioList;

    public StudioResponse(SiteUser siteUser, Studio studio){
        this.email = siteUser.getEmail();
        this.userName = siteUser.getUserName();
        this.gender = siteUser.getGender();
        this.birth = siteUser.getBirth();
        this.nickName = siteUser.getNickName();
        this.mobilePhone = siteUser.getMobilePhone();
        //this.studioList = siteUser.getStudioList();
        this.categoryId = studio.getCategoryId();
        this.studioName = studio.getStudioName();
        this.studioDescription = studio.getStudioDescription();
        this.studioMobile = studio.getStudioMobile();
        this.studioOfficeTell = studio.getStudioOfficeTell();
        this.studioFax = studio.getStudioFax();
        this.studioEmail = studio.getStudioEmail();
        this.studioBusinessNumber = studio.getStudioBusinessNumber();
        this.studioAddPostNumber = studio.getStudioAddPostNumber();
        this.studioAddMain = studio.getStudioAddMain();
        this.studioAddDetail = studio.getStudioAddDetail();
    }
}
