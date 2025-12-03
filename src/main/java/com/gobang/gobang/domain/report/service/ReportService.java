package com.gobang.gobang.domain.report.service;

import com.gobang.gobang.domain.report.dto.ReportRequest;
import com.gobang.gobang.domain.report.dto.ReportStatusUpdateRequest;
import com.gobang.gobang.domain.report.entity.Report;
import com.gobang.gobang.domain.report.model.ReportStatus;
import com.gobang.gobang.domain.report.repository.ReportRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;

    @Transactional
    public Report create(ReportRequest req) {
        Report r = Report.builder()
                .reporterEmail(req.getReporterEmail())
                .reporterUserName(req.getReporterUserName())
                .targetType(req.getTargetType())
                .targetId(req.getTargetId())
                .reason(req.getReason())
                .description(req.getDescription())
                .status(ReportStatus.PENDING)
                .build();
        return reportRepository.save(r);
    }

    public List<Report> getAll() {
        return reportRepository.findAll();
    }

    public Report getById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Report not found: " + id));
    }

    public long countPending() {
        return reportRepository.countByStatus(ReportStatus.PENDING);
    }

    @Transactional
    public Report updateStatus(Long id, ReportStatusUpdateRequest req) {
        Report r = getById(id);
        r.setStatus(req.status());
        if (req.handledByAdminId() != null) {
            r.setHandledByAdminId(req.handledByAdminId());
        }
        if (req.status() == ReportStatus.RESOLVED || req.status() == ReportStatus.REJECTED) {
            r.setHandledAt(LocalDateTime.now());
        }
        return r;
    }

}
