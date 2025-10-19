package com.gobang.gobang.domain.mypage.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class WishlistService {

    // 팔로우 공방 리스트 조회
    public List<Map<String, Object>> getFollowList(String category) {
        // 팔로우한 공방 목록 조회
        // category가 있으면 필터링
        return List.of(
                Map.of(
                        "sellerId", 1L,
                        "sellerName", "행복공방",
                        "category", "도자기",
                        "profileImage", "/images/seller1.jpg",
                        "followedAt", "2024-09-01",
                        "productCount", 25
                ),
                Map.of(
                        "sellerId", 2L,
                        "sellerName", "가죽공작소",
                        "category", "가죽공예",
                        "profileImage", "/images/seller2.jpg",
                        "followedAt", "2024-08-15",
                        "productCount", 18
                )
        );
    }

    // 팔로우 취소
    public void unfollowSeller(Long sellerId) {
        // 팔로우 관계 확인
        // DB에서 삭제
        // 판매자의 팔로워 수 감소
    }

    // 위시리스트 조회
    public List<Map<String, Object>> getWishlist(String category) {
        // 위시리스트 조회
        // category가 있으면 필터링
        return List.of(
                Map.of(
                        "wishlistId", 1L,
                        "productId", 101L,
                        "productName", "도자기 머그컵",
                        "category", "도자기",
                        "price", 25000,
                        "imageUrl", "/images/product1.jpg",
                        "sellerName", "행복공방",
                        "isAvailable", true,
                        "addedAt", "2024-10-01"
                ),
                Map.of(
                        "wishlistId", 2L,
                        "productId", 102L,
                        "productName", "가죽 지갑",
                        "category", "가죽공예",
                        "price", 45000,
                        "imageUrl", "/images/product2.jpg",
                        "sellerName", "가죽공작소",
                        "isAvailable", true,
                        "addedAt", "2024-09-25"
                )
        );
    }

    // 위시리스트 항목 삭제
    public void deleteWishlist(Long wishlistId) {
        // 위시리스트 항목 확인
        // 권한 확인
        // DB 삭제
    }
}