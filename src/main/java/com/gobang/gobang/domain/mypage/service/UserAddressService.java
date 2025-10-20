package com.gobang.gobang.domain.mypage.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserAddressService {

    // 배송지 리스트 조회
    public List<Map<String, Object>> getAddressList() {
        // 현재 사용자의 배송지 목록 조회
        return List.of(
                Map.of(
                        "id", 1L,
                        "recipientName", "홍길동",
                        "address", "서울시 강남구 테헤란로 123",
                        "detailAddress", "456호",
                        "phone", "010-1234-5678",
                        "isDefault", true
                ),
                Map.of(
                        "id", 2L,
                        "recipientName", "김철수",
                        "address", "서울시 송파구 올림픽로 789",
                        "detailAddress", "101동 202호",
                        "phone", "010-9876-5432",
                        "isDefault", false
                )
        );
    }

    // 배송지 추가
    public void addAddress(Map<String, Object> addressData) {
        // 배송지 정보 검증
        // DB에 저장
        // isDefault가 true면 기존 기본 배송지 해제
    }

    // 배송지 수정
    public void updateAddress(Long addressId, Map<String, Object> addressData) {
        // 배송지 존재 여부 확인
        // 권한 확인 (본인의 배송지인지)
        // DB 수정
        // isDefault 변경 시 기존 기본 배송지 해제
    }

    // 배송지 삭제
    public void deleteAddress(Long addressId) {
        // 배송지 존재 여부 확인
        // 권한 확인
        // 기본 배송지인 경우 삭제 불가 처리 또는 다른 배송지를 기본으로 설정
        // DB 삭제
    }
}