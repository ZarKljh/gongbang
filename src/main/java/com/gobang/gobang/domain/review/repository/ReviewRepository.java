package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findAllByOrderByCreatedDateDesc();

//    // 기존 리뷰 찾아 수정
//    boolean existsByOrderItemId(Long orderItemId);

    int countByUserIdAndIsActiveTrue(Long userId);
}
