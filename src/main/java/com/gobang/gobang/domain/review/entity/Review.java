package com.gobang.gobang.domain.review.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;

import java.time.LocalDateTime;

@Entity
@Table(name = "TBL_REVIEW")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    // 주문 ID
    @Column(name = "order_id", nullable = false)
    private Long orderId;

    // 주문 상품 ID
    @Column(name = "order_item_id", nullable = false, unique = true)
    private Long orderItemId;

    // 상품 ID
    @Column(name = "product_id", nullable = false)
    private Long productId;

    // 작성자 (회원 ID)
    @Column(name = "user_id", nullable = false)
    private Long userId;

//    @Column(name = "user_name", nullable = false)
//    private String userName;

    @Column(nullable = false)
    private Integer rating; // 1~5 점수

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "review_like", nullable = false)
    private Integer reviewLike = 0;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", nullable = false)
    private String createdBy;


    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}