package com.gobang.gobang.domain.personal.service;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.request.CartRequest;
import com.gobang.gobang.domain.personal.dto.response.CartResponse;
import com.gobang.gobang.domain.personal.entity.Cart;
import com.gobang.gobang.domain.personal.repository.CartRepository;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    public List<CartResponse> getCartsByUserId(SiteUser user) {
        return cartRepository.findBySiteUserWithProduct(user)
                .stream()
                .map(cart -> CartResponse.from(cart, imageRepository))
                .toList();
    }

    @Transactional
    public CartResponse addToCart(CartRequest request) {
        SiteUser user = request.getSiteUser();

        Product product = productRepository.findById(request.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        Cart cart = cartRepository.findBySiteUserAndProduct(user, product)
                .orElseGet(() -> Cart.builder()
                        .siteUser(user)
                        .product(product)
                        .quantity(0L)
                        .build());

        cart.setQuantity(cart.getQuantity() + request.getQuantity());
        return CartResponse.from(cartRepository.save(cart), imageRepository);
    }

    @Transactional
    public CartResponse updateCartQuantity(Long cartId, Long quantity, SiteUser user) {
        Cart cart = cartRepository.findByCartIdAndSiteUser(cartId, user)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        cart.setQuantity(quantity);
        return CartResponse.from(cart, imageRepository);
    }

    @Transactional
    public void deleteCart(Long cartId, SiteUser user) {
        Cart cart = cartRepository.findByCartIdAndSiteUser(cartId, user)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        cartRepository.delete(cart);
    }

    @Transactional
    public void clearCart(SiteUser user) {
        cartRepository.deleteBySiteUser(user);
    }

    public long getCartCount(SiteUser user) {
        return cartRepository.sumQuantityBySiteUser(user);
    }

    @Transactional
    public void deletePurchasedItems(SiteUser user, List<Long> cartIds) {
        if (cartIds == null || cartIds.isEmpty()) return;

        cartRepository.deleteAll(
                cartRepository.findByCartIdInAndSiteUser(cartIds, user)
        );
    }
}