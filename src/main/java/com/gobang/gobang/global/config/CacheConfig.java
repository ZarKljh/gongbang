package com.gobang.gobang.global.config;

import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {
    private ProductRepository productRepository;

    @Cacheable(value = "recommendProducts", key = "#categoryIds")
    public List<Product> findRecommendProducts(List<Long> categoryIds) {
        return productRepository
                .findRecommendProducts(categoryIds, PageRequest.of(0, 30));
    }
}