package com.gobang.gobang.domain.product.entity;

import com.gobang.gobang.domain.product.common.FilterInputType;
import com.gobang.gobang.domain.product.common.FilterSelectType;
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
@Table(name = "filter_group",
        indexes = {@Index(name = "idx_fg_category", columnList = "category_id")})
public class FilterGroup extends BaseEntity {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;


    @Column(length = 50, nullable = false)
    private String code;


    @Column(length = 100, nullable = false)
    private String name;


    @Enumerated(EnumType.STRING)
    @Column(name = "input_type", length = 12, nullable = false)
    private FilterInputType inputType;


    @Enumerated(EnumType.STRING)
    @Column(name = "select_type", length = 9, nullable = false)
    private FilterSelectType selectType;


    @Column(name = "is_for_browse", nullable = false)
    private Boolean forBrowse = true;


    @Column(name = "is_for_option", nullable = false)
    private Boolean forOption = false;
}
