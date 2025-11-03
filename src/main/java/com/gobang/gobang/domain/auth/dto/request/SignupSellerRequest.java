package com.gobang.gobang.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

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
}
