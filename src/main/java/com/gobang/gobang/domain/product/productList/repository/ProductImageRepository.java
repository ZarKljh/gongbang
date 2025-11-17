package com.gobang.gobang.domain.product.productList.repository;

import com.gobang.gobang.domain.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<Image, Long> {
    @Query("""
                       select i
                       from Image i
                       where i.refId in :ids
                         and i.refType = 'PRODUCT'
                       order by i.refId asc, i.sortOrder asc, i.id asc
            """)
    List<Image> findAllByRefIdInOrderBySort(@Param("ids") List<Long> ids);

    Optional<Image> findFirstByRefIdAndRefTypeOrderBySortOrderAsc(Long productId, Image.RefType refType);
}
