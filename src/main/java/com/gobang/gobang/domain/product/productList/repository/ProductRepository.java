package com.gobang.gobang.domain.product.productList.repository;

import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySubcategoryIdAndStatus(Long subCategoryId, PageRequest of, ProductStatus status);
}
