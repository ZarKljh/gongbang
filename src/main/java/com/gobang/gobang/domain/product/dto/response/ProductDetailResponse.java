package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.dto.ProductImageDto;
import com.gobang.gobang.domain.product.dto.StudioDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductDetailResponse {
    private final ProductDto productDetailList;
    private ProductImageDto detailImage;
    private StudioDto studioDetail;
    private Image gbImage;
    private SellerFollowResponse followInfo;
    private ProductCartResponse cartInfo;
}
