package com.gobang.gobang.domain.seller.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerUpdateRequest {
    private String password;
    private String email;
    private String mobilePhone;
    private String nickName;
}
