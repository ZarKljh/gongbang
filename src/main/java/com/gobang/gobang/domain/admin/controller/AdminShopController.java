package com.gobang.gobang.domain.admin.controller;

import com.gobang.gobang.domain.admin.dto.AdminRecentShopDto;
import com.gobang.gobang.domain.admin.dto.AdminShopDetailDto;
import com.gobang.gobang.domain.admin.dto.AdminShopListDto;
import com.gobang.gobang.domain.admin.repository.request.AdminShopStatusUpdateRequest;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.inquiry.service.InquiryService;
import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.seller.model.StudioStatus;
import com.gobang.gobang.global.mail.ShopMailService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/shops")
public class AdminShopController {

    private final StudioRepository studioRepository;
    private final CategoryRepository categoryRepository;
    private final ImageRepository imageRepository;
    private final SiteUserRepository siteUserRepository;
    private final ShopMailService shopMailService;

    public AdminShopController(StudioRepository studioRepository,
                               CategoryRepository categoryRepository,
                               ImageRepository imageRepository,
                               SiteUserRepository siteUserRepository,
                               ShopMailService shopMailService) {
        this.studioRepository = studioRepository;
        this.categoryRepository = categoryRepository;
        this.imageRepository = imageRepository;
        this.siteUserRepository = siteUserRepository;
        this.shopMailService = shopMailService;
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
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Studio not found: " + id)
                );

        Category category = null;
        if (s.getCategoryId() != null) {
            category = categoryRepository.findById(s.getCategoryId())
                    .orElse(null);
        }

        AdminShopDetailDto dto = AdminShopDetailDto.of(s, category);

        // 대표 이미지
        imageRepository.findByRefIdAndRefType(s.getStudioId(), Image.RefType.STUDIO_MAIN)
                .ifPresent(img -> {
                    dto.setStudioMainImageUrl(img.getImageUrl());
                    dto.setStudioMainImageName(img.getImageFileName());
                });

        // 대표 이미지 (로고)
        imageRepository.findByRefIdAndRefType(s.getStudioId(), Image.RefType.STUDIO_LOGO)
                .ifPresent(img -> {
                    dto.setStudioLogoImageUrl(img.getImageUrl());
                    dto.setStudioLogoImageName(img.getImageFileName());
                });

        // 3) 공방 내부 갤러리 이미지들
        List<Image> galleryImages = imageRepository.findALLByRefIdAndRefType(s.getStudioId(), Image.RefType.STUDIO);

        // sort_order 기준으로 정렬해서 내려주기 (안 하면 DB 순서 그대로)
        galleryImages.sort(Comparator.comparing(Image::getSortOrder));

        dto.setStudioGalleryImageUrls(
                galleryImages.stream()
                        .map(Image::getImageUrl)
                        .collect(Collectors.toList())
        );
        dto.setStudioGalleryImageNames(
                galleryImages.stream()
                        .map(Image::getImageFileName)
                        .collect(Collectors.toList())
        );

        return ResponseEntity.ok(Map.of("data", dto));
    }


    // 상태 변경
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody AdminShopStatusUpdateRequest req) {

        Studio studio = studioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Studio not found: " + id));

        StudioStatus newStatus = StudioStatus.valueOf(req.status().toUpperCase());
        StudioStatus oldStatus = studio.getStatus();

        // 1) 스튜디오 상태 변경
        studio.setStatus(newStatus);
        studioRepository.save(studio);

        // 2) PENDING → APPROVED 가 되는 순간에만 USER → SELLER 승급
        if (oldStatus != StudioStatus.APPROVED && newStatus == StudioStatus.APPROVED) {
            SiteUser owner = studio.getSiteUser();
            if (owner != null) {
                if (owner.getRole() != RoleType.SELLER && owner.getRole() != RoleType.ADMIN) {
                    owner.setRole(RoleType.SELLER);
                    siteUserRepository.save(owner);
                }
            }
        }

        // 3) REJECTED 로 바뀌는 경우, 반려 안내 메일 발송
        if (newStatus == StudioStatus.REJECTED) {
            SiteUser owner = studio.getSiteUser();
            String reasonText = req.rejectReason(); // 프론트에서 보낸 반려 사유
            if (owner != null && reasonText != null && !reasonText.isBlank()) {
                shopMailService.sendShopRejectedMail(
                        owner.getEmail(),
                        studio.getStudioName(),
                        reasonText
                );
            }
        }

        return ResponseEntity.ok(
                Map.of(
                        "ok", true,
                        "id", studio.getStudioId(),
                        "status", studio.getStatus().name()
                )
        );
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> countByStatus(
            @RequestParam String status
    ) {
        StudioStatus st = StudioStatus.valueOf(status.toUpperCase());
        long cnt = studioRepository.countByStatus(st);

        return ResponseEntity.ok(Map.of("count", cnt));
    }
}
