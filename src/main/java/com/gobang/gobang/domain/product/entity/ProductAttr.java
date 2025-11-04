package com.gobang.gobang.domain.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_attr",
        indexes = {
                @Index(name = "ix_attr_code_text", columnList = "attr_code, text_value"),
                @Index(name = "ix_attr_code_num",  columnList = "attr_code, num_value")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class ProductAttr  {

    @EmbeddedId
    private ProductAttrId id;

    @MapsId("productId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_product_attr_product"))
    private Product product;

    /** 숫자형 속성 (가격, 지속시간 등) */
    @Column(name = "num_value", precision = 10, scale = 2)
    private BigDecimal numValue;

    /** 문자열 속성 (향, 색상 등) */
    @Column(name = "text_value", length = 255)
    private String textValue;

    /** 편의 생성자 */
    public static ProductAttr ofNumber(Product product, String attrCode, BigDecimal value) {
        return ProductAttr.builder()
                .id(new ProductAttrId(product.getId(), attrCode))
                .product(product)
                .numValue(value)
                .build();
    }

    public static ProductAttr ofText(Product product, String attrCode, String value) {
        return ProductAttr.builder()
                .id(new ProductAttrId(product.getId(), attrCode))
                .product(product)
                .textValue(value)
                .build();
    }
}