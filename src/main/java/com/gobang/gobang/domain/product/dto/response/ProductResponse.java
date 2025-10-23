package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProductResponse {
    private final List<Product> productList;
}
