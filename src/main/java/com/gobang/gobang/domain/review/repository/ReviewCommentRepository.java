package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {

}
