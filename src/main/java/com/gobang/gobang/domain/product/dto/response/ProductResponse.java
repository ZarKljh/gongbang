package com.gobang.gobang.domain.product.dto.response;

import com.gobang.gobang.domain.product.dto.ThemeDto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProductResponse {
    //private final List<Product> productList;
    private final List<ThemeDto> themeList;
}
