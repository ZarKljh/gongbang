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
    public RsData<Void> uploadProfileImage(@RequestParam MultipartFile file) {
        SiteUser user = siteUserService.getCurrentUser();
        RsData<Void> result = profileImageService.uploadProfileImage(user.getId(), file);
        if (result.isSuccess()) {
            return RsData.of("200", "프로필 업로드 성공");
        }
        return result;
    }

    // ---------------- 조회 ----------------
    @GetMapping("/profile/{userId}")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable Long userId) {
        return profileImageService.getProfileImage(userId);
    }

    // ---------------- 수정 ----------------
    @PatchMapping("/profile")
    public RsData<Void> updateProfileImage(@RequestParam MultipartFile file) {
        SiteUser user = siteUserService.getCurrentUser();
        RsData<Void> result = profileImageService.updateProfileImage(user.getId(), file);
        if (result.isSuccess()) {
            return RsData.of("200", "프로필 수정 성공");
        }
        return result;
    }

    // ---------------- 삭제 ----------------
    @DeleteMapping("/profile")
    public RsData<Void> deleteProfileImage() {
        SiteUser user = siteUserService.getCurrentUser();
        RsData<Void> result = profileImageService.deleteProfileImage(user.getId());
        if (result.isSuccess()) {
            return RsData.of("200", "프로필 삭제 성공");
        }
        return result;
    }
}