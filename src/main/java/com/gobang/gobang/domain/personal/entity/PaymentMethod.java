package com.gobang.gobang.domain.personal.entity;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.dto.request.PaymentMethodRequest;
import com.gobang.gobang.domain.personal.enums.PaymentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_method")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private SiteUser siteUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private PaymentType type;   // CARD, BANK

    @Column(name = "bank_name", length = 50)
    private String bankName;

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Column(name = "account_holder", length = 50)
    private String accountHolder; // 예금주

    @Column(name = "card_company", length = 50)
    private String cardCompany;

    @Column(name = "card_number", length = 100)
    private String cardNumber;

    @Column(name = "card_expire", length = 10)
    private String cardExpire; // MM/YY 저장

    @Builder.Default
    @Column(name = "default_payment", nullable = false)
    private Boolean defaultPayment = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;   // 소프트 삭제 // 삭제된 결제수단을 복구 가능

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "modified_date", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static PaymentMethod from(
            PaymentMethodRequest request,
            SiteUser user,
            boolean isDefault
    ) {
        return PaymentMethod.builder()
                .siteUser(user)
                .type(request.getType())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .accountHolder(request.getAccountHolder())
                .cardCompany(request.getCardCompany())
                .cardNumber(request.getCardNumber())
                .cardExpire(request.getCardExpire())
                .defaultPayment(isDefault)
                .build();
    }

}