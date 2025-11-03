package com.gobang.gobang.domain.personal.service;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.CartRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.entity.Cart;
import com.gobang.gobang.domain.personal.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;

    // 사용자별 장바구니 목록 조회
    public List<CartResponse> getCartsByUserId(SiteUser siteUser) {
        List<Cart> carts = cartRepository.findBySiteUser(siteUser);

        return carts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 장바구니 담기
    @Transactional
    public CartResponse addToCart(CartRequest request) {
        // 이미 장바구니에 있는 상품인지 확인
        Optional<Cart> existingCart = cartRepository.findBySiteUserAndProduct(
                request.getSiteUser(), request.getProduct());

        if (existingCart.isPresent()) {
            // 이미 있으면 수량 증가
            Cart cart = existingCart.get();
            cart.setQuantity(cart.getQuantity() + request.getQuantity());

            Cart saved = cartRepository.save(cart);
            return convertToResponse(saved);
        } else {
            // 없으면 새로 추가
            Cart cart = Cart.builder()
                    .siteUser(SiteUser.builder().id(request.getSiteUser().getId()).build())
                    .product(request.getProduct())
                    .quantity(request.getQuantity())
                    .build();

            Cart saved = cartRepository.save(cart);
            return convertToResponse(saved);
        }
    }

    // 장바구니 수량 수정
    @Transactional
    public CartResponse updateCartQuantity(Long cartId, Long quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다."));

        cart.setQuantity(quantity);
        return convertToResponse(cart);
    }

    // 장바구니 항목 삭제
    @Transactional
    public void deleteCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("장바구니 항목을 찾을 수 없습니다."));

        cartRepository.delete(cart);
    }

    // 장바구니 전체 삭제
    @Transactional
    public void clearCart(SiteUser siteUser) {
        cartRepository.deleteBySiteUser(siteUser);
    }

    // 장바구니 개수 조회
    public long getCartCount(SiteUser siteUser) {
        return cartRepository.sumQuantityBySiteUser(siteUser);
    }

    // Entity -> Response DTO 변환
    private CartResponse convertToResponse(Cart cart) {
        return CartResponse.builder()
                .cartId(cart.getCartId())
                .userId(cart.getSiteUser().getId())
                .productId(cart.getProduct().getId())
                .productName(cart.getProduct() != null ? cart.getProduct().getName() : null)
                .quantity(cart.getQuantity())
                .createdAt(cart.getCreatedAt())
                .build();
    }

    public Cart getCartByCartId(Long cartId) {
        return cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 장바구니가 존재하지 않습니다. ID: " + cartId));
    }
}