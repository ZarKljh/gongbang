package com.gobang.gobang.domain.mypage.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodRequest {

    private Long userId;
    private String type; // '카드' 또는 '계좌'
    private String bankName;
    private String accountNumber;
    private String cardCompany;
    private String cardNumber;
    private Boolean defaultPayment;
}