package com.gobang.gobang.domain.personal.entity;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private SiteUser siteUser;

    @Column(name = "order_cord", nullable = false, unique = true, length = 100)
    private String orderCord;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Delivery delivery;
}