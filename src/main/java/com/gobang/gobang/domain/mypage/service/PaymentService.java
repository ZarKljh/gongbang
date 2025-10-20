package com.gobang.gobang.domain.mypage.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    // 결제수단 리스트 조회
    public List<Map<String, Object>> getPaymentMethodsList() {
        // 등록된 결제수단 목록 조회
        return List.of(
                Map.of(
                        "paymentId", 1L,
                        "userId", 1L,
                        "type", "카드",
                        "cardNumber", "1234-****-****-5678",
                        "cardCompany", "신한카드",
                        "isDefault", true,
                        "registeredAt", "2024-01-15"
                ),
                Map.of(
                        "paymentId", 2L,
                        "userId", 2L,
                        "type", "계좌",
                        "bankName", "국민은행",
                        "accountNumber", "123-***-******",
                        "isDefault", false,
                        "registeredAt", "2024-03-20"
                )
        );
    }

    // 결제수단 추가
    public void addPaymentMethod(Map<String, Object> paymentData) {
        // 결제수단 유효성 검증
        // 카드사/은행 인증
        // 암호화하여 저장
        // isDefault가 true면 기존 기본 결제수단 해제
    }

    // 결제수단 수정
    public void updatePaymentMethod(Long paymentId, Map<String, Object> paymentData) {
        // 결제수단 존재 여부 확인
        // 권한 확인
        // 변경 가능한 필드만 수정 (별칭, 기본 설정 등)
        // isDefault 변경 시 기존 기본 결제수단 해제
    }

    // 결제수단 삭제
    public void deletePaymentMethod(Long paymentId) {
        // 결제수단 존재 여부 확인
        // 권한 확인
        // 진행 중인 결제가 있는지 확인
        // 기본 결제수단인 경우 삭제 불가 처리 또는 다른 것을 기본으로 설정
        // DB 삭제
    }

    // 쿠폰 리스트 조회
    public List<Map<String, Object>> getCouponsList(String status) {
        // 쿠폰 목록 조회
        // status: "available"(사용가능), "used"(사용완료), "expired"(만료)
        return List.of(
                Map.of(
                        "couponId", 1L,
                        "name", "신규회원 10% 할인",
                        "discountType", "percentage",
                        "discountValue", 10,
                        "minOrderAmount", 30000,
                        "maxDiscountAmount", 5000,
                        "status", "available",
                        "expiresAt", "2024-12-31"
                ),
                Map.of(
                        "couponId", 2L,
                        "name", "5000원 할인쿠폰",
                        "discountType", "fixed",
                        "discountValue", 5000,
                        "minOrderAmount", 50000,
                        "maxDiscountAmount", null,
                        "status", "used",
                        "usedAt", "2024-10-01",
                        "expiresAt", "2024-11-30"
                )
        );
    }
}