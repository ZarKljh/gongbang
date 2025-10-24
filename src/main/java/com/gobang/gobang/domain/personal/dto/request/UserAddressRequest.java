package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.*;

@Data
public class UserAddressRequest {

    private SiteUser siteUser;
    private String recipientName;
    private String baseAddress;
    private String detailAddress;
    private String zipcode;
    private Boolean isDefault;
}
