package com.gobang.gobang.domain.mypage.controller;

import com.gobang.gobang.domain.mypage.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final ProfileService profileService;
    private final UserAddressService addressService;
    private final CartService cartService;
    private final OrderService orderService;
    private final WishlistService wishlistService;
    private final ReviewService reviewService;
    private final PaymentService paymentService;

    // ========== 프로필 관련 ==========

    // 비밀번호 본인확인
    @PostMapping("/verify")
    public ResponseEntity<Void> verifyPassword(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        profileService.verifyPassword(password);
        return ResponseEntity.ok().build();
    }

    // 기본 정보 조회
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        Map<String, Object> profile = profileService.getProfile();
        return ResponseEntity.ok(profile);
    }

    // 기본 정보 수정
    @PatchMapping("/profile")
    public ResponseEntity<Void> updateProfile(@RequestBody Map<String, Object> request) {
        profileService.updateProfile(request);
        return ResponseEntity.ok().build();
    }

    // 전화번호 인증번호 발송
    @PostMapping("/profile/verify-phone")
    public ResponseEntity<Void> sendPhoneVerification(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        profileService.sendPhoneVerification(phone);
        return ResponseEntity.ok().build();
    }

    // 이메일 인증번호 발송
    @PostMapping("/profile/verify-email")
    public ResponseEntity<Void> sendEmailVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        profileService.sendEmailVerification(email);
        return ResponseEntity.ok().build();
    }

    // ========== 배송지 관련 ==========

    // 배송지 리스트 조회
    @GetMapping("/addresses")
    public ResponseEntity<List<Map<String, Object>>> getAddressList() {
        List<Map<String, Object>> addresses = addressService.getAddressList();
        return ResponseEntity.ok(addresses);
    }

    // 배송지 추가
    @PostMapping("/addresses")
    public ResponseEntity<Void> addAddress(@RequestBody Map<String, Object> request) {
        addressService.addAddress(request);
        return ResponseEntity.ok().build();
    }

    // 배송지 수정
    @PatchMapping("/addresses/{addressId}")
    public ResponseEntity<Void> updateAddress(@PathVariable Long addressId, @RequestBody Map<String, Object> request) {
        addressService.updateAddress(addressId, request);
        return ResponseEntity.ok().build();
    }

    // 배송지 삭제
    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.ok().build();
    }

    // ========== 장바구니 관련 ==========

    // 장바구니 리스트 조회
    @GetMapping("/cart")
    public ResponseEntity<List<Map<String, Object>>> getCartList() {
        List<Map<String, Object>> cartList = cartService.getCartList();
        return ResponseEntity.ok(cartList);
    }

    // 장바구니 수정
    @PatchMapping("/cart/{cartId}")
    public ResponseEntity<Void> updateCart(@PathVariable Long cartId, @RequestBody Map<String, Object> request) {
        cartService.updateCart(cartId, request);
        return ResponseEntity.ok().build();
    }

    // 장바구니 항목 삭제
    @DeleteMapping("/cart/{cartId}")
    public ResponseEntity<Void> deleteCart(@PathVariable Long cartId) {
        cartService.deleteCart(cartId);
        return ResponseEntity.ok().build();
    }

    // 선택 항목 삭제
    @DeleteMapping("/cart/selected")
    public ResponseEntity<Void> deleteSelectedCart(@RequestBody List<Long> cartIds) {
        cartService.deleteSelectedCart(cartIds);
        return ResponseEntity.ok().build();
    }

    // ========== 주문/배송 관련 ==========

    // 배송 리스트 조회
    @GetMapping("/deliveries")
    public ResponseEntity<List<Map<String, Object>>> getDeliveryList() {
        List<Map<String, Object>> deliveries = orderService.getDeliveryList();
        return ResponseEntity.ok(deliveries);
    }

    // 배송 취소 요청
    @PostMapping("/deliveries/{orderId}/cancel")
    public ResponseEntity<Void> cancelDelivery(@PathVariable Long orderId) {
        orderService.cancelDelivery(orderId);
        return ResponseEntity.ok().build();
    }

    // 배송 상세 정보 조회
    @GetMapping("/deliveries/{orderId}")
    public ResponseEntity<Map<String, Object>> getDeliveryDetail(@PathVariable Long orderId) {
        Map<String, Object> detail = orderService.getDeliveryDetail(orderId);
        return ResponseEntity.ok(detail);
    }

    // 배송지 수정
    @PatchMapping("/deliveries/{orderId}/address")
    public ResponseEntity<Void> updateDeliveryAddress(@PathVariable Long orderId, @RequestBody Map<String, Object> request) {
        orderService.updateDeliveryAddress(orderId, request);
        return ResponseEntity.ok().build();
    }

    // 수취 완료 처리
    @PostMapping("/deliveries/{orderId}/confirm")
    public ResponseEntity<Void> confirmReceipt(@PathVariable Long orderId) {
        orderService.confirmReceipt(orderId);
        return ResponseEntity.ok().build();
    }

    // 주문 리스트 조회
    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getOrdersList() {
        List<Map<String, Object>> orders = orderService.getOrdersList();
        return ResponseEntity.ok(orders);
    }

    // 주문 상세 정보 조회
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrderDetail(@PathVariable Long orderId) {
        Map<String, Object> detail = orderService.getOrderDetail(orderId);
        return ResponseEntity.ok(detail);
    }

    // 환불 요청
    @PostMapping("/orders/{orderId}/refund")
    public ResponseEntity<Void> requestRefund(@PathVariable Long orderId, @RequestBody Map<String, Object> request) {
        orderService.requestRefund(orderId, request);
        return ResponseEntity.ok().build();
    }

    // 교환 요청
    @PostMapping("/orders/{orderId}/exchange")
    public ResponseEntity<Void> requestExchange(@PathVariable Long orderId, @RequestBody Map<String, Object> request) {
        orderService.requestExchange(orderId, request);
        return ResponseEntity.ok().build();
    }

    // ========== 팔로우/위시리스트 관련 ==========

    // 팔로우 공방 리스트 조회
    @GetMapping("/follows")
    public ResponseEntity<List<Map<String, Object>>> getFollowList(
            @RequestParam(required = false) String category) {
        List<Map<String, Object>> follows = wishlistService.getFollowList(category);
        return ResponseEntity.ok(follows);
    }

    // 팔로우 취소
    @DeleteMapping("/follows/{sellerId}")
    public ResponseEntity<Void> unfollowSeller(@PathVariable Long sellerId) {
        wishlistService.unfollowSeller(sellerId);
        return ResponseEntity.ok().build();
    }

    // 위시리스트 조회
    @GetMapping("/wishlist")
    public ResponseEntity<List<Map<String, Object>>> getWishlist(
            @RequestParam(required = false) String category) {
        List<Map<String, Object>> wishlist = wishlistService.getWishlist(category);
        return ResponseEntity.ok(wishlist);
    }

    // 위시리스트 항목 삭제
    @DeleteMapping("/wishlist/{wishlistId}")
    public ResponseEntity<Void> deleteWishlist(@PathVariable Long wishlistId) {
        wishlistService.deleteWishlist(wishlistId);
        return ResponseEntity.ok().build();
    }

    // ========== 문의/리뷰 관련 ==========

    // 문의 내역 리스트 조회
    @GetMapping("/inquiries")
    public ResponseEntity<List<Map<String, Object>>> getInquiriesList() {
        List<Map<String, Object>> inquiries = reviewService.getInquiriesList();
        return ResponseEntity.ok(inquiries);
    }

    // 리뷰 리스트 조회
    @GetMapping("/reviews")
    public ResponseEntity<List<Map<String, Object>>> getReviewsList() {
        List<Map<String, Object>> reviews = reviewService.getReviewsList();
        return ResponseEntity.ok(reviews);
    }

    // 리뷰 수정
    @PatchMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> updateReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> request) {
        reviewService.updateReview(reviewId, request);
        return ResponseEntity.ok().build();
    }

    // 리뷰 삭제
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }

    // ========== 결제/쿠폰 관련 ==========

    // 결제수단 리스트 조회
    @GetMapping("/payment-methods")
    public ResponseEntity<List<Map<String, Object>>> getPaymentMethodsList() {
        List<Map<String, Object>> paymentMethods = paymentService.getPaymentMethodsList();
        return ResponseEntity.ok(paymentMethods);
    }

    // 결제수단 추가
    @PostMapping("/payment-methods")
    public ResponseEntity<Void> addPaymentMethod(@RequestBody Map<String, Object> request) {
        paymentService.addPaymentMethod(request);
        return ResponseEntity.ok().build();
    }

    // 결제수단 수정
    @PatchMapping("/payment-methods/{paymentId}")
    public ResponseEntity<Void> updatePaymentMethod(@PathVariable Long paymentId, @RequestBody Map<String, Object> request) {
        paymentService.updatePaymentMethod(paymentId, request);
        return ResponseEntity.ok().build();
    }

    // 결제수단 삭제
    @DeleteMapping("/payment-methods/{paymentId}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Long paymentId) {
        paymentService.deletePaymentMethod(paymentId);
        return ResponseEntity.ok().build();
    }

    // 쿠폰 리스트 조회
    @GetMapping("/coupons")
    public ResponseEntity<List<Map<String, Object>>> getCouponsList(
            @RequestParam(required = false) String status) {
        List<Map<String, Object>> coupons = paymentService.getCouponsList(status);
        return ResponseEntity.ok(coupons);
    }
}