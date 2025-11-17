package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.ProductDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductDetailResponse {
    private final ProductDto productDetailList;
}
