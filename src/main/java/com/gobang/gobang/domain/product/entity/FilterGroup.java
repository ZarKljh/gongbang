package com.gobang.gobang.domain.product.entity;

import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@Table(name = "filter_group",
        indexes = {@Index(name = "idx_fg_category", columnList = "category_id")})
public class FilterGroup extends BaseEntity {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;


    @Column(length = 50, nullable = false)
    private String code;


    @Column(length = 100, nullable = false)
    private String name;


    @Column(name = "display_order", nullable = false)
    private Integer displayOrder; // 노출 순서

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 사용 여부


    //여러 FilterGroup 이 하나의 category 에 속함(소유측)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // 그룹 : 옵션 = 1 : N
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FilterOption> options = new ArrayList<>();

    @Column(name="applies_to_all", nullable=false)
    private Boolean appliesToAll = false; // 전 카테고리 공통 사용
}
