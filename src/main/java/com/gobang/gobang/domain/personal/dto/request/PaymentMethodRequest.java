package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.enums.PaymentType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentMethodRequest {

    private PaymentType type;          // CARD / BANK
    private String bankName;
    private String accountNumber;
    private String accountHolder;

    private String cardCompany;
    private String cardNumber;
    private String cardExpire;         // MM/YY

    private Boolean defaultPayment;
    private SiteUser siteUser;
}