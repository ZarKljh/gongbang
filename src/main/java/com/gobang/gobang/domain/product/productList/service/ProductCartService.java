package com.gobang.gobang.domain.product.productList.service;

import com.gobang.gobang.domain.personal.repository.CartRepository;
import com.gobang.gobang.domain.product.dto.response.ProductCartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductCartService {


    private final CartRepository cartRepository;

    @Transactional
    public ProductCartResponse toggleCart(Long productId, Long userId) {

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

        // 응답 DTO 반환
        return null;
    }
}
