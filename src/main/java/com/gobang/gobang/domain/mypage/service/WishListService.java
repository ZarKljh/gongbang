package com.gobang.gobang.domain.mypage.service;

import com.gobang.gobang.domain.mypage.dto.request.WishListRequest;
import com.gobang.gobang.domain.mypage.dto.response.WishListResponse;
import com.gobang.gobang.domain.mypage.entity.WishList;
import com.gobang.gobang.domain.mypage.repository.WishListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishListService {

    private final WishListRepository wishListRepository;

    // 사용자별 찜목록 조회
    public List<WishListResponse> getWishListByUserId(Long userId) {
        List<WishList> wishLists = wishListRepository.findByUser_UserId(userId);

        return wishLists.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 찜 추가
    @Transactional
    public WishListResponse addWishList(WishListRequest request) {
        // 이미 찜한 상품인지 확인
        Optional<WishList> existing = wishListRepository.findByUser_UserIdAndProductId(
                request.getUserId(), request.getProductId());

        if (existing.isPresent()) {
            throw new IllegalStateException("이미 찜한 상품입니다.");
        }

        WishList wishList = WishList.builder()
                .user(SiteUser.builder().userId(request.getUserId()).build())
                .productId(request.getProductId())
                .build();

        WishList saved = wishListRepository.save(wishList);
        return convertToResponse(saved);
    }

    // 찜 삭제
    @Transactional
    public void removeWishList(Long wishlistId) {
        WishList wishList = wishListRepository.findById(wishlistId)
                .orElseThrow(() -> new IllegalArgumentException("찜 정보를 찾을 수 없습니다."));

        wishListRepository.delete(wishList);
    }

    // 찜 삭제 (사용자 + 상품)
    @Transactional
    public void removeWishListByUserAndProduct(Long userId, Long productId) {
        WishList wishList = wishListRepository.findByUser_UserIdAndProductId(userId, productId)
                .orElseThrow(() -> new IllegalArgumentException("찜 정보를 찾을 수 없습니다."));

        wishListRepository.delete(wishList);
    }

    // 찜 여부 확인
    public boolean isWished(Long userId, Long productId) {
        return wishListRepository.existsByUser_UserIdAndProductId(userId, productId);
    }

    // 상품의 찜 개수 조회
    public long getWishCount(Long productId) {
        return wishListRepository.countByProductId(productId);
    }

    // 사용자의 찜 개수 조회
    public long getUserWishCount(Long userId) {
        return wishListRepository.countByUser_UserId(userId);
    }

    // Entity -> Response DTO 변환
    private WishListResponse convertToResponse(WishList wishList) {
        return WishListResponse.builder()
                .wishlistId(wishList.getWishlistId())
                .userId(wishList.getUser().getUserId())
                .productId(wishList.getProductId())
                .productName("상품명") // TODO: Product 엔티티에서 가져오기
                .createdAt(wishList.getCreatedAt())
                .build();
    }
}