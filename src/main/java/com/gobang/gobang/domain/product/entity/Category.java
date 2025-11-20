package com.gobang.gobang.domain.product.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@Table(name = "category",
        uniqueConstraints = @UniqueConstraint(name = "uk_category_code", columnNames = {"code"}),
        indexes = {@Index(name = "idx_category_active", columnList = "active")} )
public class Category extends BaseEntity {
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


    @Column(name = "active", nullable = false)
    private Boolean active = true;

    // 비소유측
    @ManyToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private Set<Product> products = new LinkedHashSet<>();

    //category관계의 주인이 아님 외래키 갖고있는 Subcategory의 category가 주인
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subcategory> subCategory = new ArrayList<>();

    // 1차카테고리 : 필터그룹 = 1 : N
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FilterGroup> filterGroups = new ArrayList<>();
}