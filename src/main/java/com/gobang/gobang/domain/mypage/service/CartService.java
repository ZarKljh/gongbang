package com.gobang.gobang.domain.mypage.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CartService {

    // 장바구니 리스트 조회
    public List<Map<String, Object>> getCartList() {
        // 현재 사용자의 장바구니 조회
        return List.of(
                Map.of(
                        "id", 1L,
                        "productId", 101L,
                        "productName", "도자기 머그컵",
                        "price", 25000,
                        "quantity", 2,
                        "imageUrl", "/images/product1.jpg",
                        "sellerName", "행복공방",
                        "isAvailable", true
                ),
                Map.of(
                        "id", 2L,
                        "productId", 102L,
                        "productName", "가죽 지갑",
                        "price", 45000,
                        "quantity", 1,
                        "imageUrl", "/images/product2.jpg",
                        "sellerName", "가죽공작소",
                        "isAvailable", true
                )
        );
    }

    // 장바구니 수정 (주로 수량 변경)
    public void updateCart(Long cartId, Map<String, Object> cartData) {
        // 장바구니 항목 존재 여부 확인
        // 권한 확인
        // 수량 변경 (재고 확인)
        // DB 수정
    }

    // 장바구니 항목 삭제
    public void deleteCart(Long cartId) {
        // 장바구니 항목 존재 여부 확인
        // 권한 확인
        // DB 삭제
    }

    // 선택 항목 삭제
    public void deleteSelectedCart(List<Long> cartIds) {
        // 각 항목에 대해 권한 확인
        // 일괄 삭제
        // 트랜잭션 처리
    }
}