package com.gobang.gobang.domain.image.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
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
    private final ProductRepository productRepository;

    @Value("${custom.genFileDirPath}")
    private String uploadPath;

    // ---------------- 업로드 ----------------
    public RsData<String> uploadProfileImage(Long userId, MultipartFile file) {

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

            // 파일 저장
            String fileName = saveFile(file);

            // 조회 URL
            String url = "/api/v1/image/profile/" + userId;

            // DB 저장
            Image image = Image.builder()
                    .refType(Image.RefType.USER_PROFILE)
                    .refId(userId)
                    .imageFileName(fileName)
                    .imageUrl(url)
                    .sortOrder(0)
                    .build();

            imageRepository.save(image);

            // User 테이블에도 저장
            user.setProfileImg(url);
            siteUserRepository.save(user);

            return RsData.of("200", "프로필 업로드 성공", url);

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

        if (image == null) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(null);
        }

        try {
            Path path = Paths.get(uploadPath, image.getImageFileName());
            byte[] bytes = Files.readAllBytes(path);
            return ResponseEntity.ok().header("Content-Type", "image/jpeg").body(bytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ---------------- 수정 ----------------
    public RsData<String> updateProfileImage(Long userId, MultipartFile file) {
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
    public RsData<Void> replaceStudioGalleryImages(Long studioId, List<MultipartFile> newFiles, List<Long> ids) {


        // 삭제 대상 직접 조회
        List<Image> deleteTargets = imageRepository.findAllById(ids);


        for (Image img : deleteTargets) {
            if (img.getRefId().equals(studioId) && img.getRefType() == Image.RefType.STUDIO) {

                try {
                    if (img.getImageFileName() != null) {
                        Path oldPath = Paths.get(uploadPath, img.getImageFileName());
                        Files.deleteIfExists(oldPath);
                    }
                } catch (Exception e) {
                    System.out.println("⚠ 갤러리 기존 파일 삭제 실패 : " + e.getMessage());
                }

                imageRepository.delete(img);
            }
        }
        // 새 갤러리 이미지를 기존 upload 메서드로 업로드
        return uploadStudioGalleryImages(studioId, newFiles);
    }

    public RsData<Void> uploadProductImage(Long productId, MultipartFile file, Image.RefType refType, int sortOrder) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 없습니다."));

        if(file == null || file.isEmpty()) {
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
                    .refId(productId)
                    .imageFileName(savedFileName)
                    .imageUrl("/images/"+ savedFileName)
                    .sortOrder(sortOrder)
                    .build();

            imageRepository.save(image);
            return RsData.of("S-1", "프로필 업로드 성공");


        } catch (Exception e) {
            return RsData.of("F-2", "상품이미지 업로드 실패: " + e.getMessage());
        }

    }

    public RsData<Void> replaceProductImage(Long productId, MultipartFile productMainImage, Image.RefType refType) {
        Optional<Image> existingImage = imageRepository.findByRefTypeAndRefId(refType, productId);
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
        try {

            //동일한 이름의 이미지 파일이 있으면 이름을 바꿔서 저장하기
            // 🔥 1️⃣ 원본 파일명
            String originalName = StringUtils.cleanPath(productMainImage.getOriginalFilename());

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
            String savedFileName = saveFile(productMainImage, finalFileName);

            Image image = Image.builder()
                    .refType(refType)
                    .refId(productId)
                    .imageFileName(savedFileName)
                    .imageUrl("/images/"+ savedFileName) // 로컬 경로 또는 URL 형태로 저장
                    .sortOrder(0)
                    .build();

            imageRepository.save(image);

            return RsData.of("S-1", "프로필 업로드 성공");

        } catch (Exception e) {
            return RsData.of("F-2", "프로필 업로드 실패: " + e.getMessage());
        }

    }
}