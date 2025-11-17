package com.gobang.gobang.domain.product.productList.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.personal.repository.WishListRepository;
import com.gobang.gobang.domain.product.dto.response.ProductLikeResponse;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductImageRepository;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductWishListService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository;
    private final WishListRepository wishListRepository;

    @Transactional
    public ProductLikeResponse toggleLike(Long productId, Long userId) {

        Optional<WishList> existing =
                wishListRepository.findByProduct_IdAndSiteUser_Id(productId, userId);

        boolean liked;

        if (existing.isPresent()) {
            // 이미 눌러져 있으면 → 삭제 (좋아요 취소)
            wishListRepository.delete(existing.get());
            liked = false;
        } else {
            // 없으면 → 새로 추가 (좋아요)
            WishList wish = WishList.builder()
                    .product(Product.builder().id(productId).build())
                    .siteUser(SiteUser.builder().id(userId).build())
                    .build();
            wishListRepository.save(wish);
            liked = true;
        }

        long likeCount = wishListRepository.countByProductId(productId);

        return ProductLikeResponse.builder()
                .productId(productId)
                .liked(liked)
                .likeCount(likeCount)
                .build();
    }
}
