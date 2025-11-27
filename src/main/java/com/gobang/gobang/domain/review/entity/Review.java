package com.gobang.gobang.domain.review.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.CascadeType.ALL;

@Entity
@Table(name = "TBL_REVIEW")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Review {

    // orphanRemoval 부모와 연결 끊긴 자식 유령 데이터 방지
    @OneToMany(mappedBy = "review", cascade = ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ReviewComment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "review", cascade = ALL, orphanRemoval = true)
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
//    @JsonIgnoreProperties({"reviews"})
    @JsonIgnore
    private SiteUser siteUser;

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

    // 이미지 리스트를 영속성 관계 제외(임시, 엔티티에 추가x)
    @Transient
    private List<Image> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id",  insertable = false, updatable = false)
    @JsonIgnore
    private Product product;

    // 프로필 이미지를 영속성 관계 제외(임시, 엔티티에 추가x)
    @Transient
    private String profileImageUrl;
    // 서비스에서 setter 채워넣음
    public void setProfileImageUrl(String profileUrl) {
        this.profileImageUrl = profileUrl;
    }
}