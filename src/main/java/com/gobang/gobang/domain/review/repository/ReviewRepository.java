package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

}
