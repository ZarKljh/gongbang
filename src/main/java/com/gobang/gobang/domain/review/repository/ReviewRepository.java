package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
//    List<Review> findAllByOrderByCreatedDateDesc();

    @Query("SELECT r FROM Review r ORDER BY r.createdDate DESC")
    Page<Review> getAllReviews(Pageable pageable);

//    // 기존 리뷰 찾아 수정
//    boolean existsByOrderItemId(Long orderItemId);

    long countByUserId(Long userId);

    List<Review> findByUserId(Long userId);

    Page<Review> findByContentContainingIgnoreCase(String keyword, Pageable pageable);
}
