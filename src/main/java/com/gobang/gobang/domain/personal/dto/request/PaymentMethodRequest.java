package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import lombok.*;

@Data
public class PaymentMethodRequest {

    private SiteUser siteUser;
    private String type; // '카드' 또는 '계좌'
    private String bankName;
    private String accountNumber;
    private String cardCompany;
    private String cardNumber;
    private Boolean defaultPayment;
}