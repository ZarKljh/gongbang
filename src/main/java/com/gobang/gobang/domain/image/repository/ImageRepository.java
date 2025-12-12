package com.gobang.gobang.domain.image.repository;

import com.gobang.gobang.domain.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByRefIdAndRefType(Long studioId, Image.RefType refType);
    List<Image> findALLByRefIdAndRefType(Long studioId, Image.RefType refType);
    Optional<Image> findByRefTypeAndRefId(Image.RefType refType, Long refId);

    List<Image> findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType refType, Long refId);
    Optional<Image> findTopByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType refType, Long refId);

    @Query("""
        SELECT i.refId AS productId, i.imageFileName AS fileName
        FROM Image i
        WHERE i.refType = 'PRODUCT'
          AND i.refId IN :productIds
        ORDER BY i.sortOrder ASC
    """)
    List<Object[]> findFirstImagesByProductIds(@Param("productIds") List<Long> productIds);
}
