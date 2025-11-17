package com.gobang.gobang.domain.admin.controller;

import com.gobang.gobang.domain.admin.dto.AdminRecentShopDto;
import com.gobang.gobang.domain.admin.dto.AdminShopListDto;
import com.gobang.gobang.domain.admin.repository.request.AdminShopStatusUpdateRequest;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.seller.model.StudioStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/shops")
public class AdminShopController {

    private final StudioRepository studioRepository;

    public AdminShopController(StudioRepository studioRepository) {
        this.studioRepository = studioRepository;
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> recent(@RequestParam(defaultValue = "6") int limit) {
        var page = PageRequest.of(0, Math.max(1, Math.min(limit, 20)));
        var data = studioRepository.findAllByOrderByCreatedDateDesc(page)
                .stream()
                .map(AdminRecentShopDto::of)
                .toList();
        return ResponseEntity.ok(Map.of("data", data));
    }

    // 목록 (상태 필터)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status
    ) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, Math.min(size, 100)));

        List<AdminShopListDto> data;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            data = studioRepository.findAllByOrderByCreatedDateDesc(pageable)
                    .map(AdminShopListDto::of)
                    .getContent();
        } else {
            StudioStatus st = StudioStatus.valueOf(status.toUpperCase());
            data = studioRepository.findByStatusOrderByCreatedDateDesc(st, pageable)
                    .map(AdminShopListDto::of)
                    .getContent();
        }
        return ResponseEntity.ok(Map.of("data", data));
    }

    // 상세 (관리 화면에서 “검토하기” 눌렀을 때)
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> detail(@PathVariable Long id) {
        Studio s = studioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Studio not found: " + id));
        return ResponseEntity.ok(Map.of("data", AdminShopListDto.of(s)));
    }

    // 상태 변경 (PENDING -> APPROVED/REJECTED 등)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody AdminShopStatusUpdateRequest req) {
        Studio s = studioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Studio not found: " + id));
        s.setStatus(StudioStatus.valueOf(req.status().toUpperCase()));
        // s.setAdminMemo(req.adminMemo()); // 엔티티에 있으면 사용
        studioRepository.save(s);
        return ResponseEntity.ok(Map.of("ok", true, "id", s.getStudioId(), "status", s.getStatus().name()));
    }
}
