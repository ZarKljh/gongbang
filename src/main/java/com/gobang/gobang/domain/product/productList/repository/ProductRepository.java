package com.gobang.gobang.domain.product.productList.repository;

import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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
    AND (:priceMin IS NULL OR p.basePrice <= :priceMin)
    AND (:priceMax IS NULL OR p.basePrice >= :priceMax)

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


    @Query(value = """
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                i.image_url AS thumbnail_url,
                p.base_price AS base_price,
                COUNT(w.wishlist_id) AS recent_likes
            FROM product p
            LEFT JOIN wish_list w
                ON w.product_id = p.id
               AND w.created_at >= :from
               AND w.created_at < :to
            LEFT JOIN image i
                ON i.ref_id = p.id
               AND i.ref_type = 'PRODUCT'
            GROUP BY p.id, p.name, i.image_url
            HAVING COUNT(w.wishlist_id) >= :minLikes
            ORDER BY recent_likes DESC, p.id DESC
            LIMIT :size
            """, nativeQuery = true)
    List<HotProductProjection> findHotProductsByLikes(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("minLikes") int minLikes,
            @Param("size") int size
    );


    public interface HotProductProjection {

        Long getProductId();
        Long getBasePrice();
        String getProductName();
        String getThumbnailUrl();
        Long getRecentLikes();
    }

    List<Product> findTop3ByStudioIdOrderByCreatedDateDesc(Long studioId);
}
