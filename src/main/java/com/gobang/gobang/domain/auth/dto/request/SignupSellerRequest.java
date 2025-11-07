package com.gobang.gobang.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class SignupSellerRequest {

    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String confirmPassword;
    @NotBlank
    private String userName;
    private String fullName;
    private String gender;
    private LocalDate birth;
    private String nickName;
    @NotBlank
    private String mobilePhone;
    private String status;
    @NotBlank
    private String categoryId;
    @NotBlank
    private String studioName;
    @NotBlank
    private String studioDescription;
    private String studioMobile;
    private String studioOfficeTell;
    private String studioFax;
    private String studioEmail;
    @NotBlank
    private String studioBusinessNumber;
    private String studioAddPostNumber;
    @NotBlank
    private String studioAddMain;
    private String studioAddDetail;

    private String studioMainImageUrl; //공방 메인이미지
    private String studioLogoImageUrl; //공방 로고이미지
    private List<String> studioGalleryImageUrls; //공방 내부 사진 최대 5장
}
