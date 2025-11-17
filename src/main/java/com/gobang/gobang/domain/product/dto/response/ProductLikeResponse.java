package com.gobang.gobang.domain.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductLikeResponse {
    private Long productId;
    private boolean liked;
    private long likeCount;
}
