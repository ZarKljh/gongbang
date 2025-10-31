package com.gobang.gobang.domain.report.repository;

import com.gobang.gobang.domain.report.entity.Report;
import com.gobang.gobang.domain.report.model.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    long countByStatus(ReportStatus status);
}
