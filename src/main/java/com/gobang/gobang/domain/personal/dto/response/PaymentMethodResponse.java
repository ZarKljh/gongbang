package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.personal.entity.PaymentMethod;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentMethodResponse {

    private Long paymentId;
    private String type;
    private String bankName;
    private String accountNumber;
    private String accountHolder;

    private String cardCompany;
    private String cardNumber;
    private String cardExpire;

    private Boolean defaultPayment;
    private LocalDateTime createdAt;

    public static PaymentMethodResponse from(PaymentMethod paymentMethod) {
        return PaymentMethodResponse.builder()
                .paymentId(paymentMethod.getPaymentId())
                .type(paymentMethod.getType().name())
                .bankName(paymentMethod.getBankName())
                .accountNumber(paymentMethod.getAccountNumber())
                .accountHolder(paymentMethod.getAccountHolder())
                .cardCompany(paymentMethod.getCardCompany())
                .cardNumber(paymentMethod.getCardNumber())
                .cardExpire(paymentMethod.getCardExpire())
                .defaultPayment(paymentMethod.getDefaultPayment())
                .createdAt(paymentMethod.getCreatedAt())
                .build();
    }
}