package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.dto.ProductImageDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductDetailResponse {
    private final ProductDto productDetailList;
    private ProductImageDto detailImage;
}
