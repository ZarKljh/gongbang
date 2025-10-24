package com.gobang.gobang.domain.product.entity;

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
@Table(name = "theme",
        indexes = {
                @Index(name = "idx_theme_parent", columnList = "parent_id"),
                @Index(name = "idx_theme_active", columnList = "is_active")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_theme_code", columnNames = {"code"})
        })
public class Theme extends BaseEntity{
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Theme parent;

    //테마식별자 역할
    @Column(length = 50, nullable = false)
    private String code;

    @Column(length = 100, nullable = false)
    private String name;


    @Column(length = 255)
    private String description;


    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;


    @Column(name = "active", nullable = false)
    private Boolean active = true;

//    @Comment("대표 썸네일 이미지")
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "thumbnail_image_id",
//            foreignKey = @ForeignKey(name = "fk_theme_thumbnail_image"))
//    private Image thumbnailImage;  // Image 엔티티 안만들고 진행도 가능 주석처리함

//    @CreationTimestamp
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt;
//
//
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;

    // 비소유측(mappedBy)
    @ManyToMany(mappedBy = "themes", fetch = FetchType.LAZY)
    private Set<Product> products = new LinkedHashSet<>();
}
