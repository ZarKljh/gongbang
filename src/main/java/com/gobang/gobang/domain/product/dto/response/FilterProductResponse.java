package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.dto.ProductImageDto;
import com.gobang.gobang.domain.product.dto.ReviewRatingDto;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FilterProductResponse {
    private List<ProductDto> productFilterList;                // 상품 목록
    private Map<Long, List<ProductImageDto>> imageMapList;     // 상품별 이미지 리스트
    private Map<Long, ReviewRatingDto> reviewMapList;     // 상품별 리뷰 집계 리스트
}
