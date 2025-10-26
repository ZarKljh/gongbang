package com.gobang.gobang.domain.product.entity;

import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@Table(name = "product",
        uniqueConstraints = @UniqueConstraint(name = "uk_product_slug", columnNames = {"slug"}),
        indexes = {
                @Index(name = "idx_product_subcategory", columnList = "subcategory_id"),
                @Index(name = "idx_product_status", columnList = "status"),
                @Index(name = "idx_product_active_stock", columnList = "stock_quantity")
        })
public class Product extends BaseEntity {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;

    // 판매자
    @Column(nullable = false)
    private Long sellerId;

    // 소속 테마
    private Long themeId;

    // 기본 카테고리
    @Column(nullable = false)
    private Long categoryId;

    @Column(length = 200, nullable = false)
    private String name;

    // 짧은 요약
    @Column(columnDefinition = "TEXT")
    private String summary;

    // 상세 설명
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 200, nullable = false)
    private String slug;


    // 한 줄 설명
    private String subtitle;


    @Column(name = "base_price", nullable = false)
    private Integer basePrice = 0;


    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;


    @Column(name = "backorderable", nullable = false)
    private Boolean backorderable = false;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private Subcategory subcategory;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private ProductStatus status = ProductStatus.DRAFT;


    @Column(name = "seo_title", length = 150)
    private String seoTitle;
    @Column(name = "seo_description", length = 255)
    private String seoDescription;

    // 판매 중 여부
    @Column(nullable = false)
    private Boolean active = true;

//    @CreationTimestamp
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt;
//
//
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;


    // 소유측(owning side): 여기에 @JoinTable
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "product_theme_map",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "theme_id"),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_product_theme", columnNames = {"product_id", "theme_id"}
            )
    )
    private Set<Theme> themes = new LinkedHashSet<>();

    // 소유측: 조인테이블 정의
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_category_map",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id"),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_product_category", columnNames = {"product_id","category_id"}
            )
    )
    private Set<Category> category = new LinkedHashSet<>();
}
