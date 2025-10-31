package com.gobang.gobang.domain.product.productList.repository;

import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySubcategoryIdAndStatusOrderByBasePriceAscIdAsc(Long subCategoryId, PageRequest of, ProductStatus status);


    @Query("""
            SELECT p
            FROM Product p
            JOIN p.subcategory s
            WHERE p.active = TRUE
              AND s.id = :subCategoryId
              AND (
                   :useColor = FALSE
                   OR EXISTS (
                        SELECT 1 FROM ProductAttr a
                        WHERE a.product = p
                          AND a.id.attrCode = 'COLOR'
                          AND a.textValue IN :colors
                   )
              )
            ORDER BY p.basePrice ASC, p.id ASC
            """)
    List<Product> getProductFilterList(
            @Param("subCategoryId") Long subCategoryId,
            PageRequest of,
//            @Param("useStyle") boolean useStyle,
//            @Param("styleVals") List<String> styleVals,
            @Param("useColor") boolean useColor,
            @Param("colors") List<String> colors
//            @Param("useMaterial") boolean useMaterial,
//            @Param("materialVals") List<String> materialVals
    );

}
