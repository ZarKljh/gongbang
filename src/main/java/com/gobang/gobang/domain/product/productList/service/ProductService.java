package com.gobang.gobang.domain.product.productList.service;

import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> getProductList(Long subCategoryId, int size) {
        int limit = Math.max(1, Math.min(size, 50));

        List<Product> ProductList = productRepository.findBySubcategoryIdAndStatusOrderByBasePriceAscIdAsc(subCategoryId, PageRequest.of(0, limit), ProductStatus.PUBLISHED);
        if (ProductList.isEmpty()) {
            throw new RuntimeException("상품 목록이 비어있습니다.");
        }
        return ProductList.stream()
                .map(t -> ProductDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .subtitle(t.getSubtitle())
                        .summary(t.getSummary())
                        .description(t.getDescription())
                        .basePrice(t.getBasePrice())
                        .stockQuantity(t.getStockQuantity())
                        .slug(t.getSlug())
                        .status(t.getStatus())
                        .active(t.getActive())
                        .categoryId(t.getCategoryId())
                        .themeId(t.getThemeId())
                        .subcategoryId(t.getSubcategory() != null ? t.getSubcategory().getId() : null)
                        .seoTitle(t.getSeoTitle())
                        .seoDescription(t.getSeoDescription())
                        .build()
                )
                .toList();
    }

    public List<ProductDto> getProductFilterList(Long subCategoryId, int size, MultiValueMap<String, String> params) {
        int limit = Math.max(1, Math.min(size, 50));
//        boolean useColor = colors != null && !colors.isEmpty();

        Integer priceMin   = null;
        Integer priceMax   = null;
        String style = first(params, "STYLE");
        String pkg = first(params, "PACKAGE");
        String color = first(params, "COLOR");
        String design = first(params, "DESIGN");
        String material = first(params, "MATERIAL");
        String scent = first(params, "SCENT");
        String duration = first(params, "DURATION");
        String brightness = first(params, "BRIGHTNESS");
        String colorTemp = first(params, "COLOR_TEMP");
        String restType = first(params, "REST_TYPE");
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Order.asc("basePrice"), Sort.Order.asc("id")));
        List<Product> list = productRepository.searchByFilters(
                subCategoryId, priceMin, priceMax, style, pkg, color, design, material, scent,
                duration, brightness, colorTemp, restType, pageable
        );

        return list.stream()
                .map(t -> ProductDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .subtitle(t.getSubtitle())
                        .summary(t.getSummary())
                        .description(t.getDescription())
                        .basePrice(t.getBasePrice())
                        .stockQuantity(t.getStockQuantity())
                        .slug(t.getSlug())
                        .status(t.getStatus())
                        .active(t.getActive())
                        .categoryId(t.getCategoryId())
                        .themeId(t.getThemeId())
                        .subcategoryId(t.getSubcategory() != null ? t.getSubcategory().getId() : null)
                        .seoTitle(t.getSeoTitle())
                        .seoDescription(t.getSeoDescription())
                        .build()
                )
                .toList();

    }

    private static String first(MultiValueMap<String, String> p, String key) {
        String v = p.getFirst(key);
        return (v == null || v.isBlank()) ? null : v.trim();
    }
}
