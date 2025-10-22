package com.gobang.domain.review.repository;

import com.gobang.domain.review.entity.ReviewReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewReportRepository extends JpaRepository<ReviewReport,Long> {
}
