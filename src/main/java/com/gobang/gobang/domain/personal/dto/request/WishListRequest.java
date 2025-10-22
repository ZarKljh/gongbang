package com.gobang.gobang.domain.personal.dto.request;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishListRequest {

    private SiteUser siteUser;
    private Product product;
}