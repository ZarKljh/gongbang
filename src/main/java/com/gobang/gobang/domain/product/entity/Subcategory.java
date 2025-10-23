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
@Table(name = "subcategory",
        indexes = {@Index(name = "idx_subcategory_category", columnList = "category_id")})
public class Subcategory extends BaseEntity {
//    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;

    @Column(length = 50, nullable = false)
    private String code;


    @Column(length = 100, nullable = false)
    private String name;


    @Column(length = 255)
    private String description;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;



    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    //1차카테고리 : 2차카테고리 1: N
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;


}
