package com.gobang.domain.review.repository;

import com.gobang.domain.review.entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {

}
