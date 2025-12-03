package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.request.WishListRequest;
import com.gobang.gobang.domain.personal.dto.response.WishListResponse;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.personal.repository.WishListRepository;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    // 사용자별 위시 목록 조회
    public List<WishListResponse> getWishListByUser(SiteUser siteUser) {
        List<WishList> wishLists = wishListRepository.findBySiteUser(siteUser);

        return wishLists.stream()
                .map(item -> WishListResponse.from(item, imageRepository))
                .collect(Collectors.toList());
    }

    // 위시 추가
    @Transactional
    public WishListResponse addWishList(WishListRequest request) {
        // 이미 위시한 상품인지 확인
        Optional<WishList> existing = wishListRepository.findBySiteUserAndProduct(
                request.getSiteUser(), request.getProduct());

        if (existing.isPresent()) {
            throw new IllegalStateException("이미 찜한 상품입니다.");
        }

        WishList wishList = WishList.builder()
                .siteUser(SiteUser.builder().id(request.getSiteUser().getId()).build())
                .product(request.getProduct())
                .build();

        WishList saved = wishListRepository.save(wishList);
        return WishListResponse.from(saved, imageRepository);
    }

    // 위시 삭제
    @Transactional
    public void removeWishList(Long wishlistId) {
        WishList wishList = wishListRepository.findById(wishlistId)
                .orElseThrow(() -> new IllegalArgumentException("찜 정보를 찾을 수 없습니다."));

        wishListRepository.delete(wishList);
    }

    // 위시 삭제 (사용자 + 상품)
    @Transactional
    public void removeWishListByUserAndProduct(SiteUser siteUser, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        WishList wishList = wishListRepository.findBySiteUserAndProduct(siteUser, product)
                .orElseThrow(() -> new IllegalArgumentException("찜 정보를 찾을 수 없습니다."));

        wishListRepository.delete(wishList);
    }

    // 위시 여부 확인
    public boolean isWished(SiteUser siteUser, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        return wishListRepository.existsBySiteUserAndProduct(siteUser, product);
    }

    // 상품의 위시 개수 조회
    public long getWishCount(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));
        return wishListRepository.countByProduct(product);
    }

    // 사용자의 위시 개수 조회
    public long getUserWishCount(SiteUser siteUser) {
        return wishListRepository.countBySiteUser(siteUser);
    }

    public List<WishListResponse> getInfiniteWishlist(SiteUser user, Long lastWishId, int size) {
        Pageable pageable = PageRequest.of(0, size);

        List<WishList> wishList = wishListRepository.findInfiniteWishList(
                user.getId(),
                lastWishId,
                pageable
        );

        return wishList.stream()
                .map(wishlist -> WishListResponse.from(wishlist, imageRepository))
                .toList();
    }

}