package com.gobang.gobang.domain.mypage.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.mypage.dto.request.UserAddressRequest;
import com.gobang.gobang.domain.mypage.dto.response.UserAddressResponse;
import com.gobang.gobang.domain.mypage.service.UserAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/mypage/addresses")
@RequiredArgsConstructor
public class UserAddressController {

    private final UserAddressService userAddressService;

    // 배송지 목록 페이지
    @GetMapping
    public String addressList(@RequestParam(required = false) SiteUser siteUser, Model model) {
        // TODO: 실제로는 세션에서 userId를 가져와야 함
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<UserAddressResponse> addresses = userAddressService.getAddressesByUserId(siteUser);
        model.addAttribute("addresses", addresses);
        model.addAttribute("siteUser", siteUser);

        return "mypage/addresses";
    }

    // 배송지 등록 (AJAX)
    @PostMapping
    @ResponseBody
    public ResponseEntity<UserAddressResponse> createAddress(@RequestBody UserAddressRequest request) {
        UserAddressResponse response = userAddressService.createAddress(request);
        return ResponseEntity.ok(response);
    }

    // 배송지 수정
    @PatchMapping("/{addressId}")
    @ResponseBody
    public ResponseEntity<UserAddressResponse> updateAddress(
            @PathVariable Long addressId,
            @RequestBody UserAddressRequest request) {
        UserAddressResponse response = userAddressService.updateAddress(addressId, request);
        return ResponseEntity.ok(response);
    }

    // 배송지 삭제 (AJAX)
    @DeleteMapping("/{addressId}")
    @ResponseBody
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        userAddressService.deleteAddress(addressId);
        return ResponseEntity.ok().build();
    }

    // 기본 배송지 설정 (AJAX)
    @PatchMapping("/{addressId}/default")
    @ResponseBody
    public ResponseEntity<Void> setDefaultAddress(
            @PathVariable Long addressId,
            @RequestParam SiteUser siteUser) {
        userAddressService.setDefaultAddress(addressId, siteUser);
        return ResponseEntity.ok().build();
    }
}