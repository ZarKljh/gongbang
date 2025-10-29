package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewComment;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {

//    Optional<Object> findByReviewId(@NotNull(message = "리뷰 ID는 필수입니다.") Long reviewId);
Optional<ReviewComment> findByReview(Review review);
}
