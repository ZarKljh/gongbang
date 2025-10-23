package com.gobang.gobang.domain.product.entity;

import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@Table(name = "filter_option",
        indexes = {@Index(name = "idx_fo_group", columnList = "group_id")})
public class FilterOption extends BaseEntity {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;

    @Column(length = 100, nullable = false)
    private String label;


    @Column(name = "value_key", length = 100, nullable = false)
    private String valueKey;

    
    @Column(name = "input_type", length = 12, nullable = false)
    private String inputType;


    @Column(name = "select_type", length = 9, nullable = false)
    private String selectType;


    @Column(name = "color_hex", length = 7)
    private String colorHex;


    @Column(name = "icon_url", length = 255)
    private String iconUrl;


    @Column(length = 255)
    private String tooltip;

    @Column(name="min_value", precision=12, scale=2)
    private BigDecimal minValue; // null이면 하한 없음

    @Column(name="max_value", precision=12, scale=2)
    private BigDecimal maxValue; // null이면 상한 없음

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder; // 노출 순서

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 사용 여부

    // 다:1 → 여러 옵션이 하나의 그룹에 속함(소유측)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private FilterGroup group;
}
