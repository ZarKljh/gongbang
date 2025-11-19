package com.gobang.gobang.domain.image.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
public class ProfileImageService {

    private final SiteUserRepository siteUserRepository;
    private final ImageRepository imageRepository;

    @Value("${custom.genFileDirPath}")
    private String uploadPath;

    // ---------------- 업로드 ----------------
    public RsData<Void> uploadProfileImage(Long userId, MultipartFile file) {
        SiteUser user = siteUserRepository.findById(userId).orElseThrow();

        if (file == null || file.isEmpty()) {
            return RsData.of("F-1", "이미지가 없습니다.");
        }

        try {
            // 기존 이미지 삭제
            imageRepository.findByRefTypeAndRefId(Image.RefType.USER_PROFILE, userId)
                    .ifPresent(existing -> deleteFile(existing.getImageFileName()));

            String fileName = saveFile(file);

            Image image = Image.builder()
                    .refType(Image.RefType.USER_PROFILE)
                    .refId(userId)
                    .imageUrl(fileName)
                    .imageFileName(fileName)
                    .sortOrder(0)
                    .build();
            imageRepository.save(image);

            user.setProfileImg(fileName);
            siteUserRepository.save(user);

            return RsData.of("S-1", null); // 성공 메시지는 컨트롤러에서 넣음
        } catch (Exception e) {
            return RsData.of("F-2", "프로필 업로드 실패: " + e.getMessage());
        }
    }

    // ---------------- 조회 ----------------
    public ResponseEntity<byte[]> getProfileImage(Long userId) {
        Image image = imageRepository.findByRefTypeAndRefId(Image.RefType.USER_PROFILE, userId).orElse(null);
        if (image == null) return ResponseEntity.notFound().build();

        try {
            Path path = Paths.get(uploadPath, image.getImageFileName());
            byte[] bytes = Files.readAllBytes(path);
            return ResponseEntity.ok().header("Content-Type", "image/jpeg").body(bytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ---------------- 수정 ----------------
    public RsData<Void> updateProfileImage(Long userId, MultipartFile file) {
        return uploadProfileImage(userId, file); // 실패 메시지 서비스에서 처리
    }

    // ---------------- 삭제 ----------------
    public RsData<Void> deleteProfileImage(Long userId) {
        try {
            SiteUser user = siteUserRepository.findById(userId).orElseThrow();
            imageRepository.findByRefTypeAndRefId(Image.RefType.USER_PROFILE, userId).ifPresent(existing -> {
                deleteFile(existing.getImageFileName());
                imageRepository.delete(existing);
            });

            user.setProfileImg(null);
            siteUserRepository.save(user);

            return RsData.of("S-3", null); // 성공 메시지는 컨트롤러에서 넣음
        } catch (Exception e) {
            return RsData.of("F-3", "프로필 삭제 실패: " + e.getMessage());
        }
    }

    // ---------------- 파일 저장 ----------------
    private String saveFile(MultipartFile file) throws IOException {
        Files.createDirectories(Paths.get(uploadPath));
        String fileName = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
        Path path = Paths.get(uploadPath, fileName);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    // ---------------- 파일 삭제 ----------------
    private void deleteFile(String fileName) {
        try {
            Path path = Paths.get(uploadPath, fileName);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제 실패", e);
        }
    }
}