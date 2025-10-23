package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.UserAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class UserAddressResponse {

    private Long userAddressId;
    private SiteUser siteUser;
    private String recipientName;
    private String baseAddress;
    private String detailAddress;
    private String zipcode;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserAddressResponse from(UserAddress userAddress) {
        return UserAddressResponse.builder()
                .userAddressId(userAddress.getUserAddressId())
                .siteUser(userAddress.getSiteUser())
                .recipientName(userAddress.getRecipientName())
                .baseAddress(userAddress.getBaseAddress())
                .detailAddress(userAddress.getDetailAddress())
                .zipcode(userAddress.getZipcode())
                .isDefault(userAddress.getIsDefault())
                .createdAt(userAddress.getCreatedAt())
                .updatedAt(userAddress.getUpdatedAt())
                .build();
    }
}