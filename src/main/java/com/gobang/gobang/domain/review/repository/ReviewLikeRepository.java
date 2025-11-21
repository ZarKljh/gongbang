package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    boolean existsByReviewAndSiteUser_Id(Review review, Long userId);
    void deleteByReviewAndSiteUser_Id(Review review, Long userId);
    long countByReview(Review review);

    // 내가 누른 좋아요 확인용
    @Query("SELECT rl.review.reviewId FROM ReviewLike rl WHERE rl.siteUser.id = :userId AND rl.review.productId = :productId")
    List<Long> findLikedReviewIds(Long userId, Long productId);
}
