package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.review.entity.ReviewReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewReportRepository extends JpaRepository<ReviewReport,Long> {
}
