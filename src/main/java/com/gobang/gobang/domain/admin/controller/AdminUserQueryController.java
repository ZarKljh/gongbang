package com.gobang.gobang.domain.admin.controller;

import com.gobang.gobang.domain.admin.dto.AdminUserDetailDto;
import com.gobang.gobang.domain.admin.dto.AdminUserSummaryDto;
import com.gobang.gobang.domain.admin.repository.request.AdminUserStatusUpdateRequest;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.auth.dto.SiteUserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserQueryController {

    private final SiteUserRepository siteUserRepository;

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> recent(@RequestParam(defaultValue = "6") int limit) {
        var page = PageRequest.of(0, Math.max(1, Math.min(limit, 20)));
        List<SiteUser> rows = siteUserRepository.findAllByOrderByCreatedDateDesc(page);

        var data = rows.stream()
                .map(SiteUserDto::new)
                .toList();

        return ResponseEntity.ok().body(
                java.util.Map.of("data", data)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, name = "q") String query
    ) {
        int p = Math.max(0, page);
        int s = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(p, s);

        String roleFilter = null;
        if (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role)) {
            String upper = role.toUpperCase();
            if ("USER".equals(upper) || "SELLER".equals(upper)) {
                roleFilter = upper;
            }
        }

        String statusFilter = null;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            String normalized = status.toUpperCase();
            if (!normalized.equals("ACTIVE") && !normalized.equals("BAN")) {
                throw new IllegalArgumentException("status는 ACTIVE 또는 BAN만 허용됩니다.");
            }
            statusFilter = normalized;
        }

        String q = (query != null && !query.isBlank()) ? query : null;

        Page<SiteUser> pageResult = siteUserRepository.searchForAdmin(roleFilter, statusFilter, q, pageable);

        var data = pageResult.getContent().stream()
                .map(AdminUserSummaryDto::of)
                .toList();

        return ResponseEntity.ok(Map.of(
                "data", data,
                "page", p,
                "size", s,
                "totalElements", pageResult.getTotalElements(),
                "totalPages", pageResult.getTotalPages()
        ));
    }


    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody AdminUserStatusUpdateRequest req
    ) {
        SiteUser user = siteUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + id));

        if (req.getStatus() == null || req.getStatus().isBlank()) {
            throw new IllegalArgumentException("status 값이 필요합니다.");
        }

        // 대문자로 정규화
        String newStatus = req.getStatus().toUpperCase();

        // 우리 프로젝트 규칙: ACTIVE / BAN 만 허용
        if (!"ACTIVE".equals(newStatus) && !"BAN".equals(newStatus)) {
            throw new IllegalArgumentException("status 는 ACTIVE 또는 BAN 만 가능합니다.");
        }

        user.setStatus(newStatus);
        SiteUser saved = siteUserRepository.save(user);

        return ResponseEntity.ok(
                java.util.Map.of("data", AdminUserSummaryDto.of(saved))
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> detail(@PathVariable Long id) {

        SiteUser user = siteUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다. id=" + id));

        return  ResponseEntity.ok(
                java.util.Map.of("data", AdminUserDetailDto.of(user))
        );


    }
}
