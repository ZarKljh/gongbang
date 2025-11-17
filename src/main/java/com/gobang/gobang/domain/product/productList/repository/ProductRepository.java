package com.gobang.gobang.domain.product.productList.repository;

import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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


    @Query("""
  SELECT p
  FROM Product p
  WHERE p.active = TRUE
    AND p.subcategory.id = :subId
    AND (:priceMin IS NULL OR p.basePrice >= :priceMin)
    AND (:priceMax IS NULL OR p.basePrice <= :priceMax)

    AND (:style      IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'STYLE'      AND a.textValue = :style))
    AND (:pkg        IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'PACKAGE'    AND a.textValue = :pkg))
    AND (:color      IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'COLOR'      AND a.textValue = :color))
    AND (:design     IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'DESIGN'     AND a.textValue = :design))
    AND (:material   IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'MATERIAL'   AND a.textValue = :material))
    AND (:scent      IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'SCENT'      AND a.textValue = :scent))
    AND (:duration   IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'DURATION'   AND a.textValue = :duration))
    AND (:brightness IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'BRIGHTNESS' AND a.textValue = :brightness))
    AND (:colorTemp  IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'COLOR_TEMP' AND a.textValue = :colorTemp))
    AND (:restType   IS NULL OR EXISTS (
          SELECT 1 FROM ProductAttr a
          WHERE a.product = p AND a.id.attrCode = 'REST_TYPE'  AND a.textValue = :restType))
  ORDER BY p.basePrice ASC, p.id ASC
  """)
    List<Product> searchByFilters(
            @Param("subId") Long subCategoryId,
            @Param("priceMin") Integer priceMin,
            @Param("priceMax") Integer priceMax,
            @Param("style") String style,
            @Param("pkg") String pkg,
            @Param("color") String color,
            @Param("design") String design,
            @Param("material") String material,
            @Param("scent") String scent,
            @Param("duration") String duration,
            @Param("brightness") String brightness,
            @Param("colorTemp") String colorTemp,
            @Param("restType") String restType,
            Pageable pageable
    );

}
