package com.gobang.gobang.domain.order.model;


public enum OrderStatus {
    TEMP,       // 임시 주문
    PENDING,    // 결제 대기
    PAID,       // 결제 완료
    FAILED,     // 결제 실패
    CANCELLED,   // 주문 취소
    RETURN,     // 반품
    EXCHANGE    // 교환
}

