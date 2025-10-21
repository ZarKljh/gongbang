package com.gobang.gobang.domain.mypage.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodResponse {

    private Long paymentId;
    private Long userId;
    private String type;
    private String bankName;
    private String accountNumber;
    private String cardCompany;
    private String cardNumber; // 마스킹된 카드번호
    private Boolean defaultPayment;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedDate;
}