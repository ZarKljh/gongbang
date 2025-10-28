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
        SiteUser siteUser = siteUserService.getCurrentUser();
        List<UserAddressResponse> addresses = userAddressService.getAddressesByUserId(siteUser);
        return RsData.of("200", "배송지 다건 조회 성공", addresses);
    }

    @PostMapping
    public RsData<UserAddressResponse> createAddress(@RequestBody UserAddressRequest request) {
        request.setSiteUser(siteUserService.getCurrentUser());
        UserAddressResponse response = userAddressService.createAddress(request);
        return RsData.of("200", "배송지 등록 성공", response);
    }

    @PatchMapping("/{addressId}")
    public RsData<UserAddressResponse> updateAddress(@PathVariable Long addressId, @RequestBody UserAddressRequest request) {
        UserAddressResponse response = userAddressService.updateAddress(addressId, request);
        return RsData.of("200", "배송지 수정 성공", response);
    }

    @DeleteMapping("/{addressId}")
    public RsData<Void> deleteAddress(@PathVariable Long addressId) {
        userAddressService.deleteAddress(addressId);
        return RsData.of("200", "삭제 성공");
    }

    @PatchMapping("/{addressId}/default")
    public RsData<Void> setDefaultAddress(@PathVariable Long addressId) {
        SiteUser siteUser = siteUserService.getCurrentUser();
        userAddressService.setDefaultAddress(addressId, siteUser);
        return RsData.of("200", "기본 배송지 설정 성공");
    }
}