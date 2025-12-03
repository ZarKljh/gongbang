package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.UserAddressRequest;
import com.gobang.gobang.domain.personal.dto.response.UserAddressResponse;
import com.gobang.gobang.domain.personal.entity.UserAddress;
import com.gobang.gobang.domain.personal.repository.UserAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;

    // 사용자별 배송지 목록 조회
    public List<UserAddressResponse> getAddressesByUserId(SiteUser siteUser) {
        List<UserAddress> addresses = userAddressRepository.findBySiteUser(siteUser);

        return addresses.stream()
                .map(UserAddressResponse::from)
                .sorted((a, b) -> {
                    // 기본 배송지가 가장 위
                    if (Boolean.TRUE.equals(a.getIsDefault()) && !Boolean.TRUE.equals(b.getIsDefault())) return -1;
                    if (!Boolean.TRUE.equals(a.getIsDefault()) && Boolean.TRUE.equals(b.getIsDefault())) return 1;
                    // 기본 배송지가 같으면 최근 등록 순
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .collect(Collectors.toList());
    }

    // 배송지 등록
    @Transactional
    public UserAddressResponse createAddress(UserAddressRequest request) {
        SiteUser siteUser = request.getSiteUser();

        boolean hasDefault = userAddressRepository.existsBySiteUserAndIsDefault(siteUser, true);

        boolean isDefault = request.getIsDefault() != null && request.getIsDefault();

        // 기본 배송지가 없는 경우 → 자동으로 기본 배송지 설정
        if (!hasDefault) {
            isDefault = true;
        }

        // 기본 배송지로 설정하는 경우, 기존 기본 배송지 해제
        if (isDefault) {
            userAddressRepository.clearDefaultAddress(siteUser.getId());
        }

        UserAddress address = UserAddress.builder()
                .siteUser(request.getSiteUser())
                .recipientName(request.getRecipientName())
                .baseAddress(request.getBaseAddress())
                .detailAddress(request.getDetailAddress())
                .zipcode(request.getZipcode())
                .isDefault(isDefault)
                .build();

        UserAddress saved = userAddressRepository.save(address);
        return UserAddressResponse.from(saved);
    }

    // 배송지 수정
    @Transactional
    public UserAddressResponse updateAddress(Long addressId, UserAddressRequest request) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("배송지를 찾을 수 없습니다."));

        boolean isDefaultRequest = Boolean.TRUE.equals(request.getIsDefault());
        boolean isCurrentlyDefault = Boolean.TRUE.equals(address.getIsDefault());

        // 기본 배송지로 변경하는 경우
        if (isDefaultRequest && !isCurrentlyDefault) {
            userAddressRepository.clearDefaultAddress(address.getSiteUser().getId());
            address.setIsDefault(true);
        }

        // 기본 배송지가 아닌 상태로 변경하는 경우 → 그냥 false 로 변경(자동 기본 지정은 안함)
        if (!isDefaultRequest && isCurrentlyDefault) {
            address.setIsDefault(false);
        }

        address.setRecipientName(request.getRecipientName());
        address.setBaseAddress(request.getBaseAddress());
        address.setDetailAddress(request.getDetailAddress());
        address.setZipcode(request.getZipcode());
        address.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));

        return UserAddressResponse.from(address);
    }

    // 배송지 삭제
    @Transactional
    public void deleteAddress(Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("배송지를 찾을 수 없습니다."));

        userAddressRepository.delete(address);
    }

    // 기본 배송지 설정
    @Transactional
    public void setDefaultAddress(Long addressId, SiteUser siteUser) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new IllegalArgumentException("배송지를 찾을 수 없습니다."));

        // 기존 기본 배송지 해제
        userAddressRepository.clearDefaultAddress(siteUser.getId());

        // 새로운 기본 배송지 설정
        address.setIsDefault(true);
    }
}