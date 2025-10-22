package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@SuperBuilder
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
}