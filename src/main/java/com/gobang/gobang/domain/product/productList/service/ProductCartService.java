package com.gobang.gobang.domain.product.productList.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.entity.Cart;
import com.gobang.gobang.domain.personal.repository.CartRepository;
import com.gobang.gobang.domain.product.dto.response.ProductCartResponse;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductCartService {

    private final SiteUserRepository siteUserRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;

//    @Transactional
//    public ProductCartResponse toggleCart(Long productId, Long userId) {
//
//        // 이미 장바구니 되어있는지 조회
//        Optional<Cart> existing = cartRepository
//                .findByProduct_IdAndSiteUser_Id(productId, userId);
//
//        boolean isInCart;
//
//        if (existing.isPresent()) {
//            // 🔥 이미 장바구니 → 장바구니 빼기
////            cartRepository.delete(existing.get());
////            isInCart = false;
//        } else {
//            // 🔥 장바구니 추가
//            Cart cart = Cart.builder()
//                    // Studio PK만 필요하니 프록시 엔티티 형태로 묶어줌
//                    .studio(Studio.builder().studioId(productId).build())
//                    .siteUser(SiteUser.builder().id(userId).build())
//                    // createdAt은 @PrePersist에서 자동 세팅되니 생략 가능
//                    .build();
//
//            cartRepository.save(cart);
//            isInCart = true;
//        }
//
//        // 팔로워 수 재조회
//        long followerCount = cartRepository.countByStudio_StudioId(productId);
//
//        // 응답 DTO 반환
//        return new ProductCartResponse(isInCart, followerCount);
//    }


    @Transactional
    public ProductCartResponse addToCart(Long productId, Long userId) {
        // 1. 상품 조회
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        // 2. 사용자 조회
        SiteUser siteUser = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 3. 기존 장바구니에 같은 상품 있는지 조회
        Optional<Cart> existingCart = cartRepository.findBySiteUserAndProduct(siteUser, product);

        // 이미 장바구니에 있는지 여부
        boolean isAlreadyInCart = existingCart.isPresent();

        if (existingCart.isPresent()) {
            // 이미 있으면 수량 +1 증가 (혹은 원하는 만큼 증가 로직)
            Cart cart = existingCart.get();
            cart.setQuantity(cart.getQuantity() + 1);   // ← 필요하면 + 요청 수량으로 변경

            Cart saved = cartRepository.save(cart);
        } else {
            // 없으면 새로 추가 (기본 수량 1)
            Cart cart = Cart.builder()
                    .siteUser(siteUser)
                    .product(product)
                    .quantity(1L)     // ← 기본 수량
                    .build();

            Cart saved = cartRepository.save(cart);
        }
        return new ProductCartResponse(isAlreadyInCart);
    }
}
