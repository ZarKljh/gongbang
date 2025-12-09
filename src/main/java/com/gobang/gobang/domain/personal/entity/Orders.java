package com.gobang.gobang.domain.personal.entity;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private SiteUser siteUser;

    @Column(name = "order_code", nullable = false, unique = true, length = 100)
    private String orderCode;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "created_date", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdDate;

    @Column(name = "status", length = 20)
    private String status; // 취소, 반품, 교환, null

    // 취소, 반품, 교환 사유
    @Column(name = "reason")
    private String reason;

    //hj - 결제이력 정보 컬럼추가
    @Column(name = "payment_key")
    private String paymentKey;

    @Column(name = "payment_method_name")
    private String paymentMethodName;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    //--결제이력 정보 컬럼추가--


    //hj- 결제api추가하고 보니 안쓰게 될 것 같은데?.. 일단 보류할 것!
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private PaymentMethod paymentMethod;


    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Delivery> deliveries = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();


    //  임시 주문 생성
    public static Orders createTempOrder(SiteUser user) {
        Orders order = new Orders();
        order.setSiteUser(user);
        order.setStatus("TEMP"); // 임시 주문 상태
        order.setOrderCode("ORD_" + UUID.randomUUID());
        order.setTotalPrice(BigDecimal.ZERO); // 일단 0 -> 뒤에서 계산됨

        return order;
    }

    //  주문 상품 추가
    public void addOrderItem(Product product, Long quantity, BigDecimal price) {
        OrderItem item = new OrderItem();

        item.setOrder(this);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setPrice(price);

        if (this.orderItems == null) {
            this.orderItems = new ArrayList<>();
        }

        this.orderItems.add(item);
    }

    public void addDelivery(UserAddress address) {
        Delivery delivery = Delivery.create(this, address);
        this.deliveries.add(delivery);
    }
}