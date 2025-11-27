package com.gobang.gobang.domain.seller.repository;

import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

//커스텀 리포지터리
public interface ProductOfStudioRepository extends JpaRepository<Product, Long> {
    @Query(
        value = "SELECT * FROM product WHERE studio_id = :studioId",
        countQuery = "SELECT COUNT(*) FROM product WHERE studio_id = :studioId",
        nativeQuery = true
    )
    Page<Product> findByStudioId(Long studioId, Pageable pageable);


    Page<Product> findByStudioIdAndNameContaining(Long studioId, String keyword, Pageable pageable);

}
