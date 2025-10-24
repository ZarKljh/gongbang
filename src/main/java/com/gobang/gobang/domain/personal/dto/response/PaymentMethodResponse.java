package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class PaymentMethodResponse {

    private Long paymentId;
    private SiteUser siteUser;
    private String type;
    private String bankName;
    private String accountNumber;
    private String cardCompany;
    private String cardNumber; // 마스킹된 카드번호
    private Boolean defaultPayment;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedDate;

    public static PaymentMethodResponse from(PaymentMethod paymentMethod) {
        return PaymentMethodResponse.builder()
                .paymentId(paymentMethod.getPaymentId())
                .siteUser(paymentMethod.getSiteUser())
                .type(paymentMethod.getType())
                .bankName(paymentMethod.getBankName())
                .accountNumber(paymentMethod.getAccountNumber())
                .cardCompany(paymentMethod.getCardCompany())
                .cardNumber(paymentMethod.getCardNumber())
                .defaultPayment(paymentMethod.getDefaultPayment())
                .createdAt(paymentMethod.getCreatedAt())
                .modifiedDate(paymentMethod.getModifiedDate())
                .build();
    }
}