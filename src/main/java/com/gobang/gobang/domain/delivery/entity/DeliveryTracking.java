package com.gobang.gobang.domain.delivery.entity;

import com.gobang.gobang.domain.personal.entity.Delivery;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_tracking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    // 현재 위치
    @Column(nullable = false)
    private String location;

    // 상태 메시지
    @Column(nullable = false)
    private String status;

    // 이벤트 발생 시각
    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventTime;


    @Column(name = "step_order")
    private Integer stepOrder;
}
