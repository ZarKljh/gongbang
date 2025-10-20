package com.gobang.gobang.domain.product.entity;

import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

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


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private FilterGroup group;


    @Column(length = 100, nullable = false)
    private String label;


    @Column(name = "value_key", length = 100, nullable = false)
    private String valueKey;


    @Column(name = "color_hex", length = 7)
    private String colorHex;


    @Column(name = "icon_url", length = 255)
    private String iconUrl;


    @Column(length = 255)
    private String tooltip;


    @Column(name = "price_delta", nullable = false)
    private Integer priceDelta = 0;
}
