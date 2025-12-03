package com.gobang.gobang.domain.personal.repository;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.product.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {

    // 사용자별 찜목록 조회
    List<WishList> findBySiteUser(SiteUser siteUser);

    // 사용자와 상품으로 찜목록 조회
    Optional<WishList> findBySiteUserAndProduct(SiteUser siteUser, Product product);

    // 상품별 찜 개수
    long countByProduct(Product product);

    // 사용자별 찜 개수
    long countBySiteUser(SiteUser siteUser);

    // 찜 여부 확인
    boolean existsBySiteUserAndProduct(SiteUser siteUser, Product product);

    @Query("""
    SELECT w
    FROM WishList w
    WHERE w.siteUser.id = :userId
      AND (:lastWishId IS NULL OR w.wishlistId < :lastWishId)
    ORDER BY w.wishlistId DESC
    """)
    List<WishList> findInfiniteWishList(
            Long userId,
            Long lastWishId,
            Pageable pageable
    );


    //좋아요 토글 - HYO
    // 🔍 특정 유저가 특정 상품을 찜했는지 확인 (좋아요 상태 확인)
    Optional<WishList> findByProduct_IdAndSiteUser_Id(Long productId, Long userId);

    //좋아요 토글 - HYO
    // 특정 상품의 좋아요 개수
    @Query("""
                select count(w)
                from WishList w
                where w.product.id = :productId
            """)
    long countByProductId(@Param("productId") Long productId);

    //좋아요 토글 - HYO
    // 특정 유저가 찜한 상품 목록 (목록 API에 "내가 누른 여부" 반환할 때 사용)
    @Query("""
                select w.product.id
                from WishList w
                 where w.siteUser.id = :userId
                 and w.product.id in :productIds
            """)
    List<Long> findLikedProductIds(@Param("userId") Long userId,
                                   @Param("productIds") List<Long> productIds);
}