package com.gobang.gobang.domain.product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ProductAttrId implements Serializable {
    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "attr_code", length = 50, nullable = false)
    private String attrCode;
}