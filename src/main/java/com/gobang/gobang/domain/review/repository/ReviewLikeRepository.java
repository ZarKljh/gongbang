package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {
    boolean existsByReviewAndUserId(Review review, Long userId);
    void deleteByReviewAndUserId(Review review, Long userId);
    long countByReview(Review review);
}
