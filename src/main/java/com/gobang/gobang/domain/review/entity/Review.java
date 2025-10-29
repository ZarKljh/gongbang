package com.gobang.gobang.domain.review.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TBL_REVIEW")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Review {

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewLike> likes = new ArrayList<>();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

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

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "review_like", nullable = false)
    private Integer reviewLike = 0;

    @CreatedDate
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime modifiedDate;

    @CreatedBy
    @Column(name = "created_by", nullable = false)
    private String createdBy;


    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

//    @PrePersist
//    public void onCreate() {
//        this.createdDate = LocalDateTime.now();
//        this.modifiedDate = LocalDateTime.now();
//    }
//
//    @PreUpdate
//    public void onUpdate() {
//        this.modifiedDate = LocalDateTime.now();
//    }
}