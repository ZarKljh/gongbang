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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;

    public List<UserAddressResponse> getAddressesByUser(SiteUser user) {
        return userAddressRepository.findBySiteUser(user)
                .stream()
                .map(UserAddressResponse::from)
                .toList();
    }

    @Transactional
    public UserAddressResponse createAddress(UserAddressRequest request) {
        SiteUser user = request.getSiteUser();

        boolean hasDefault = userAddressRepository.existsBySiteUserAndIsDefault(user, true);
        boolean isDefault = Boolean.TRUE.equals(request.getIsDefault()) || !hasDefault;

        if (isDefault) {
            userAddressRepository.clearDefaultAddress(user.getId());
        }

        UserAddress address = UserAddress.builder()
                .siteUser(user)
                .recipientName(request.getRecipientName())
                .baseAddress(request.getBaseAddress())
                .detailAddress(request.getDetailAddress())
                .zipcode(request.getZipcode())
                .isDefault(isDefault)
                .build();

        return UserAddressResponse.from(userAddressRepository.save(address));
    }

    @Transactional
    public UserAddressResponse updateAddress(
            Long addressId, SiteUser user, UserAddressRequest request
    ) {
        UserAddress address = userAddressRepository.findByUserAddressIdAndSiteUser_Id(addressId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        address.updateFrom(request);
        return UserAddressResponse.from(address);
    }

    @Transactional
    public void deleteAddress(Long addressId, SiteUser user) {
        UserAddress address = userAddressRepository.findByUserAddressIdAndSiteUser_Id(addressId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        userAddressRepository.delete(address);
    }

    @Transactional
    public void setDefaultAddress(Long addressId, SiteUser user) {
        UserAddress address = userAddressRepository.findByUserAddressIdAndSiteUser_Id(addressId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        userAddressRepository.clearDefaultAddress(user.getId());
        address.setIsDefault(true);
    }
}