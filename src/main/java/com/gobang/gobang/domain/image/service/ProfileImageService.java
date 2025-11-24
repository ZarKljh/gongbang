package com.gobang.gobang.domain.image.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileImageService {

    private final SiteUserRepository siteUserRepository;
    private final StudioRepository  studioRepository;
    private final ImageRepository imageRepository;

    @Value("${custom.genFileDirPath}")
    private String uploadPath;

    // ---------------- 업로드 ----------------
    public RsData<Void> uploadProfileImage(Long userId, MultipartFile file) {
        System.out.println("userId = " + userId);
        System.out.println("file isEmpty = " + file.isEmpty());
        System.out.println("file original name = " + file.getOriginalFilename());

        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다."));

        if (file == null || file.isEmpty()) {
            return RsData.of("F-1", "이미지가 없습니다.");
        }

        try {
            // 기존 이미지 삭제
            imageRepository.findByRefTypeAndRefId(Image.RefType.USER_PROFILE, userId)
                    .ifPresent(existing -> {
                        deleteFile(existing.getImageFileName());
                        imageRepository.delete(existing);
                    });

            String fileName = saveFile(file);
            String fileUrl = "/images/" + fileName;

            // Image 엔티티 저장
            Image image = Image.builder()
                    .refType(Image.RefType.USER_PROFILE)
                    .refId(userId)
                    .imageFileName(fileName)
                    .imageUrl(fileUrl) // 로컬 경로 또는 URL 형태로 저장
                    .sortOrder(0)
                    .build();

            imageRepository.save(image);

            // SiteUser에 프로필 이미지 이름 기록
            user.setProfileImg(fileUrl);
            siteUserRepository.save(user);

            return RsData.of("200", "프로필 업로드 성공");
        } catch (Exception e) {
            return RsData.of("400", "프로필 업로드 실패: " + e.getMessage());
        }
    }

    /** 로컬에 파일 저장 */
    private String saveFile(MultipartFile file) throws IOException {
        Files.createDirectories(Paths.get(uploadPath));
        String fileName = System.currentTimeMillis() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
        Path targetPath = Paths.get(uploadPath, fileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }
    /** 새로운 이름으로 파일 저장 */
    private String saveFile(MultipartFile file, String forcedFileName) throws IOException {
        Files.createDirectories(Paths.get(uploadPath));

        String cleanName = StringUtils.cleanPath(forcedFileName);
        Path targetPath = Paths.get(uploadPath, cleanName);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return cleanName;
    }

    /** 로컬 파일 삭제 */
    private void deleteFile(String fileName) {
        try {
            Path path = Paths.get(uploadPath, fileName);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제 실패: " + fileName, e);
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
        return uploadProfileImage(userId, file);
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

            return RsData.of("200", null);
        } catch (Exception e) {
            return RsData.of("400", "프로필 삭제 실패: " + e.getMessage());
        }
    }

    public RsData<Void> uploadStudioImage(Long studioId, MultipartFile file, Image.RefType refType, int sortOrder){

        Studio studio = studioRepository.findByStudioId(studioId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다."));

        if (file == null || file.isEmpty()) {
            return RsData.of("F-1", "이미지가 없습니다.");
        }

        try {

            //동일한 이름의 이미지 파일이 있으면 이름을 바꿔서 저장하기
            // 🔥 1️⃣ 원본 파일명
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());

            // 🔥 2️⃣ DB에 동일 파일명이 존재하는지 확인
            //Optional<Image> oi = imageRepository.findByRefTypeAndRefId(refType, studioId);
            Path targetPath = Paths.get(uploadPath, originalName);

            // 🔥 3️⃣ 파일명 충돌 처리
            String finalFileName = originalName;
            /*
            if (oi.isPresent()) {
                // 같은 이름이 있으면 새 이름을 강제로 생성하여 MultipartFile 복제
                finalFileName = System.currentTimeMillis() + "_" + originalName;
            }
            */
            if (Files.exists(targetPath)) {
                finalFileName = System.currentTimeMillis() + "_" + originalName;
            }
            // 🔥 4️⃣ saveFile() 호출 (파일명은 MultipartFile.getOriginalFilename() 사용됨)
            String savedFileName = saveFile(file, finalFileName);

            Image image = Image.builder()
                    .refType(refType)
                    .refId(studioId)
                    .imageFileName(savedFileName)
                    .imageUrl(savedFileName) // 로컬 경로 또는 URL 형태로 저장
                    .sortOrder(sortOrder)
                    .build();

            imageRepository.save(image);

            return RsData.of("S-1", "프로필 업로드 성공");

        } catch (Exception e) {
            return RsData.of("F-2", "프로필 업로드 실패: " + e.getMessage());
        }
    }

    public RsData<Void> replaceStudioImage(Long studioId, MultipartFile newFile, Image.RefType refType, int sortOrder){
        Optional<Image> existingImage = imageRepository.findByRefTypeAndRefId(refType, studioId);
        if (existingImage.isPresent()) {
            Image old = existingImage.get();

            // 파일 삭제 (있을 경우)
            Path oldPath = Paths.get(uploadPath, old.getImageFileName());
            try {
                Files.deleteIfExists(oldPath);
            } catch (Exception e) {
                System.out.println("⚠ 기존 파일 삭제 실패: " + e.getMessage());
            }

            // DB 삭제
            imageRepository.delete(old);
        }
        return uploadStudioImage(studioId, newFile, refType, sortOrder);
    }

    public RsData<Void> uploadStudioGalleryImages(Long studioId, List<MultipartFile> files) {

        if (files == null || files.isEmpty()) {
            return RsData.of("S-0", "갤러리 이미지 없음(옵션)");
        }

        int order = 0;

        for (MultipartFile file : files) {
            uploadStudioImage(studioId, file, Image.RefType.STUDIO, order++);
        }

        return RsData.of("S-1", "갤러리 이미지 전체 업로드 성공");
    }

    @Transactional
    public RsData<Void> replaceStudioGalleryImages(Long studioId, List<MultipartFile> newFiles) {

        // ⭐ 기존 갤러리 이미지 조회
        List<Image> oldImages =
                imageRepository.findALLByRefIdAndRefType(studioId, Image.RefType.STUDIO);

        // ⭐ 기존 이미지 파일 삭제 + DB 삭제
        for (Image old : oldImages) {
            try {
                Path oldPath = Paths.get(uploadPath, old.getImageFileName());
                Files.deleteIfExists(oldPath);
            } catch (Exception e) {
                System.out.println("⚠ 갤러리 기존 파일 삭제 실패: " + e.getMessage());
            }

            imageRepository.delete(old);
        }

        // ⭐ 새 갤러리 이미지를 기존 upload 메서드로 업로드
        return uploadStudioGalleryImages(studioId, newFiles);
    }
}