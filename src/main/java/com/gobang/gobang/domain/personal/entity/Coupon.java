package com.gobang.gobang.domain.personal.entity;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_id")
    private Long couponId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private SiteUser siteUser;

    @Column(name = "coupon_code", nullable = false, unique = true, length = 50)
    private String couponCode;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "discount_rate")
    private Long discountRate;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Column(name = "coupon_type", nullable = false, length = 50)
    private String couponType;

    @Column(name = "discount_category", nullable = false, length = 50)
    private String discountCategory;

    @Builder.Default
    @Column(name = "coupon_status", nullable = false)
    private Boolean couponStatus = false;
}