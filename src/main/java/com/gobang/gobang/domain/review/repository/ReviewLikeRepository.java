package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    boolean existsByReviewAndSiteUser_Id(Review review, Long userId);
    void deleteByReviewAndSiteUser_Id(Review review, Long userId);
    long countByReview(Review review);

    // 물품 상세페이지 만들어지면 사용
    @Query("SELECT AVG(r.rating), COUNT(r) FROM Review r WHERE r.productId = :productId AND r.isActive = true")
    Object[] findAverageRatingAndCountByProductId(@Param("productId") Long productId);

    // 상세 만들어지기 전 사용
//    @Query("SELECT new map(COALESCE(AVG(r.rating), 0) as avgRating, COUNT(r) as totalCount) FROM Review r WHERE r.isActive = true")
//    Map<String, Object> findAverageRatingAndCountAsMap();
//
}
