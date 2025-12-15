package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.request.UserAddressRequest;
import com.gobang.gobang.domain.personal.dto.response.UserAddressResponse;
import com.gobang.gobang.domain.personal.service.UserAddressService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/addresses")
@RequiredArgsConstructor
public class UserAddressController {

    private final UserAddressService userAddressService;
    private final SiteUserService siteUserService;

    @GetMapping
    public RsData<List<UserAddressResponse>> addressList() {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "배송지 다건 조회 성공",
                userAddressService.getAddressesByUser(user));
    }

    @PostMapping
    public RsData<UserAddressResponse> createAddress(@RequestBody UserAddressRequest request) {
        SiteUser user = siteUserService.getCurrentUser();
        request.setSiteUser(user);
        return RsData.of("200", "배송지 등록 성공",
                userAddressService.createAddress(request));
    }

    @PatchMapping("/{addressId}")
    public RsData<UserAddressResponse> updateAddress(
            @PathVariable Long addressId,
            @RequestBody UserAddressRequest request
    ) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "배송지 수정 성공",
                userAddressService.updateAddress(addressId, user, request));
    }

    @DeleteMapping("/{addressId}")
    public RsData<Void> deleteAddress(@PathVariable Long addressId) {
        SiteUser user = siteUserService.getCurrentUser();
        userAddressService.deleteAddress(addressId, user);
        return RsData.of("200", "삭제 성공");
    }

    @PatchMapping("/{addressId}/default")
    public RsData<Void> setDefaultAddress(@PathVariable Long addressId) {
        SiteUser user = siteUserService.getCurrentUser();
        userAddressService.setDefaultAddress(addressId, user);
        return RsData.of("200", "기본 배송지 설정 성공");
    }
}