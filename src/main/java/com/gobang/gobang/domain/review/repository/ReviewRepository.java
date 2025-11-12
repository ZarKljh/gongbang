package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

}
