package com.gobang.gobang.domain.seller.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudioAddRequest {
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
