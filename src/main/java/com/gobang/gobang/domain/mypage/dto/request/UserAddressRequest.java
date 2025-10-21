package com.gobang.gobang.domain.mypage.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddressRequest {

    private Long userId;
    private String recipientName;
    private String baseAddress;
    private String detailAddress;
    private String zipcode;
    private Boolean isDefault;
}
