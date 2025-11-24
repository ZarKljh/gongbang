package com.gobang.gobang.domain.image.controller;

import com.gobang.gobang.domain.image.dto.ImageUploadRequest;
import com.gobang.gobang.domain.image.dto.ImageUploadResponse;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.service.ReviewImageService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

//@RestController
//@RequestMapping("/api/v1/images")
//public class ReviewImageController {
//
//    private final String uploadDir = System.getProperty("user.dir") + "/uploads/reviews/";
//
//    @PostMapping("/upload")
//    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
//        // 폴더 없으면 생성
//        File directory = new File(uploadDir);
//        if (!directory.exists()) directory.mkdirs();
//
//        // 파일명 UUID로 변경
//        String originalFilename = file.getOriginalFilename();
//        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
//        String newFilename = UUID.randomUUID() + extension;
//
//        // 실제 저장
//        Path path = Paths.get(uploadDir + newFilename);
//        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
//
//        // 접근 가능한 URL 반환 (Spring static mapping 필요)
//        String imageUrl = "/uploads/reviews/" + newFilename;
//        return ResponseEntity.ok(imageUrl);
//    }
//
//}

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ReviewImageController {

    private final ReviewImageService reviewImageService;

    // 리뷰 이미지 업로드 (단일 파일 + refId + sortOrder)
    @PostMapping("/upload")
    public RsData<ImageUploadResponse> uploadReviewImage(
//            ImageUploadRequest request
            @RequestParam("file") MultipartFile file,
            @RequestParam("refType") Image.RefType refType,
            @RequestParam("refId") Long refId,
            @RequestParam("sortOrder") Integer sortOrder
    ) {
        return reviewImageService.uploadReviewImage(new ImageUploadRequest(file, refType, refId, sortOrder));
    }

    // 리뷰 이미지 전체 조회
    @GetMapping("/review/{reviewId}")
    public List<ImageUploadResponse> getReviewImages(@PathVariable Long reviewId) {
        return reviewImageService.getReviewImages(reviewId);
    }

    // 삭제
    @DeleteMapping("/review/{imageId}")
    public RsData<Void> deleteReviewImage(@PathVariable Long imageId) {
        return reviewImageService.deleteReviewImage(imageId);
    }
}