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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishListService {

    private final WishListRepository wishListRepository;
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    public List<WishListResponse> getWishListByUser(SiteUser user) {
        return wishListRepository.findBySiteUser(user)
                .stream()
                .map(w -> WishListResponse.from(w, imageRepository))
                .toList();
    }

    @Transactional
    public WishListResponse addWishList(WishListRequest request) {
        SiteUser user = request.getSiteUser();

        Product product = productRepository.findById(request.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        wishListRepository.findBySiteUserAndProduct(user, product)
                .ifPresent(w -> { throw new IllegalStateException("요청을 처리할 수 없습니다."); });

        WishList wish = WishList.builder()
                .siteUser(user)
                .product(product)
                .build();

        return WishListResponse.from(wishListRepository.save(wish), imageRepository);
    }

    @Transactional
    public void removeWishList(Long wishlistId, SiteUser user) {
        WishList wish = wishListRepository.findByWishlistIdAndSiteUser_Id(wishlistId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        wishListRepository.delete(wish);
    }

    public boolean isWished(SiteUser user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        return wishListRepository.existsBySiteUserAndProduct(user, product);
    }

    public long getUserWishCount(SiteUser user) {
        return wishListRepository.countBySiteUser(user);
    }

    public List<WishListResponse> getInfiniteWishlist(
            SiteUser user, Long lastWishId, int size
    ) {
        Pageable pageable = PageRequest.of(0, size);

        return wishListRepository.findInfiniteWishList(user.getId(), lastWishId, pageable)
                .stream()
                .map(w -> WishListResponse.from(w, imageRepository))
                .toList();
    }
}