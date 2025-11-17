package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.product.dto.ReviewRatingDto;
import com.gobang.gobang.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    long countBySiteUser_Id(Long userId);

    @Query("SELECT r FROM Review r ORDER BY r.createdDate DESC")
    Page<Review> getAllReviews(Pageable pageable);

    List<Review> findBySiteUser_Id(Long userId);

    Page<Review> findByContentContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Review> findByProductIdAndIsActiveTrue(Long productId, Pageable pageable);
    Page<Review> findByIsActiveTrue(Pageable pageable);

    // 물품 상세페이지 만들어지면 사용(v평균)
    @Query("SELECT AVG(r.rating), COUNT(r.reviewId) FROM Review r WHERE r.productId = :productId AND r.isActive = true")
    List<Object[]> findAverageRatingAndCountByProductId(@Param("productId") Long productId);

    // userId기준 상품 하나당 리뷰 하나
    boolean existsBySiteUserAndProductId(SiteUser user, Long productId);


    // 별점 분포 그래프
    @Query("""
    SELECT r.rating, COUNT(r)
    FROM Review r
    WHERE r.productId = :productId AND r.isActive = true
    GROUP BY r.rating
""")
    List<Object[]> countRatingGroup(@Param("productId") Long productId);



    //목록 평균별점용 - hyo
    @Query("""
        SELECT new com.gobang.gobang.domain.product.dto.ReviewRatingDto(
            r.productId,
            AVG(r.rating),
            COUNT(r)
        )
        FROM Review r
        WHERE r.productId IN :ids
        GROUP BY r.productId
    """)
    List<ReviewRatingDto> findRatingStatsByProductIds(@Param("ids") List<Long> ids);

}
