package com.gobang.gobang.domain.image.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.image.service.ProfileImageService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/image")
@RequiredArgsConstructor
public class ProfileImageController {

    private final ProfileImageService profileImageService;
    private final SiteUserService siteUserService;

    // ---------------- 업로드 ----------------
    @PostMapping("/profile")
    public RsData<String> uploadProfileImage(@RequestParam MultipartFile file) {
        SiteUser user = siteUserService.getCurrentUser();
        return profileImageService.uploadProfileImage(user.getId(), file);
    }

    // ---------------- 수정 ----------------
    @PatchMapping("/profile")
    public RsData<String> updateProfileImage(@RequestParam MultipartFile file) {
        SiteUser user = siteUserService.getCurrentUser();
        return profileImageService.uploadProfileImage(user.getId(), file);
    }

    // ---------------- 조회 ----------------
    @GetMapping("/profile/{userId}")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable Long userId) {
        return profileImageService.getProfileImage(userId);
    }

    // ---------------- 삭제 ----------------
    @DeleteMapping("/profile")
    public RsData<Void> deleteProfileImage() {
        SiteUser user = siteUserService.getCurrentUser();
        return profileImageService.deleteProfileImage(user.getId());
    }
}