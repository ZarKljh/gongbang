package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SellerSimpleResponse {
    private String email;
    private String userName;
    private String fullName;
    private String gender;
    private LocalDateTime birth;
    private String nickName;
    private String mobilePhone;

    public SellerSimpleResponse(SiteUser seller){
        this.email = seller.getEmail();
        this.userName = seller.getUserName();
        this.gender = seller.getFullName();
        this.gender = seller.getGender();
        this.birth = seller.getBirth();
        this.nickName = seller.getNickName();
        this.mobilePhone = seller.getMobilePhone();
        //this.studioList = seller.getStudioList();
    }
}
